const state = {
  data: ["comptia1.json", "comptia2.json"],
  mode: "prod", /* use "test" for testing */
  testSize: 5,
  testTime: 3,
  type: 'train',
  part: '1',
  qeue: [],
  examSize: 60,
  examTime: 60
}

const overlay = document.querySelector("#overlay");
const partButtons = document.querySelectorAll('#test_part button[name="part"]');
const typeButtons = document.querySelectorAll('#test_type button[name="type"]');
const startButton = document.querySelector('button#start');
const testSection = document.querySelector("section#test");
const questionDiv = document.querySelector("#question"); 
const fields = document.querySelectorAll("#question > div"); 
const nextButton = document.querySelector("button#next");
const stopButton = document.querySelector("button#stop");
const submitButton = document.querySelector("button#submit");
const explainButton = document.querySelector("button#explain");
const explainSection = document.querySelectorAll('#Explanation, #Answer');
const optSection = document.querySelector('#Options');
const resSection = document.querySelector('#result');
const ticker = document.querySelector('#ticker');
const tickerDiv = document.querySelector('#tickerDiv');
const progress = document.querySelector('#progress');
const progressBar = document.querySelector('#progressBar');
const progressNum = document.querySelector('#progressNum');
const clock = document.querySelector('#clock');

const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; 
  }
}

const initQeue = () => {
  state.qeue = [...Array(Q[state.part].length).keys()];
  shuffleArray(state.qeue);
  state.qeue.forEach((el, i) => { state.qeue[i] = [el, ''] })

  if (state.mode == "test") {
    state.examSize = state.testSize;
    state.examTime = state.testTime;
  }

  if (state.type == "exam") {
    state.qeue = state.qeue.slice(0, state.examSize);
  }

  state.cursor = 0;
}

const disableMenuButtons = (flag) => {
  for (const button of [...partButtons, ...typeButtons, startButton]) button.disabled = flag;
}

const setQuestionMode = (mode) => {
  let methods = ["add", "remove"];
  if (mode == "submitted") methods.reverse(); 
  const [a,b] = methods;
  for (const button of [nextButton, explainButton]) button.classList[a]("hidden");
  submitButton.classList[b]("hidden");

  optSection.style.opacity = mode == "submitted" ? "0.5" : "1";
  optSection.style.pointerEvents = mode == "submitted" ? "none" : "initial";
}

const showQuestion = (part, index) => {
  explainSection.forEach((el) => el.classList.add("hidden"));

  let question = {...Q[part][index]};

  let optHtml = '';
  let opts = question["Options"];
  for (const opt in opts) {
    optHtml += `<label><input type="checkbox" name="${opt}" id="${opt}">${opt}. ${opts[opt]}</label>`;
  }
  question["Options"] = optHtml;
  question["Answer"] = 'Correct answer: <span>' + question["Answer"] + '</span>';
  question["id"] = 'ID: ' + question["id"];
  for (const field of fields) {
    if (field.id && field.id in question) field.innerHTML = question[field.id]
  }
  progressNum.innerHTML = `<span>${state.cursor + 1}</span> /  ${state.qeue.length}`;

  questionDiv.classList.remove("hidden");
}

const showTicker = (part, index, answer) => {
  const correct = Q[part][index]["Answer"].split(',').sort().join(''); 
  const id = Q[part][index]["id"];
  const res = correct == answer ? 'right' : 'wrong';

  let tickerHtml = `<a class="ticker ${res}">${id}</a>`;
  ticker.innerHTML += tickerHtml;
  if (state.cursor == 0) tickerDiv.classList.remove('hidden');
}

const start = () => {
  disableMenuButtons(true);
  setQuestionMode("new");
  tickerDiv.classList.add('hidden');
  ticker.innerHTML = '';
  resSection.classList.remove('active');
  resSection.innerHTML = '';

  initQeue(); 

  progressBar.style.width = '0%';
  progressBar.innerHTML = '&nbsp;&nbsp;&nbsp;0%';
  progressNum.innerHTML = ' <span>1</span> / ' + state.qeue.length;
  progress.classList.remove('hidden');

  showQuestion(state.part, state.qeue[0][0]);

  testSection.classList.add('active');

  clock.classList.add('hidden');
  if (state.type == "exam") timer(state.examTime);
}

const submit = () => {
  const checked = optSection.querySelectorAll('input[type="checkbox"]:checked');
  const answer = Array.from(checked).map(checked => checked.id).sort().join('');
  state.qeue[state.cursor][1] = answer; 
  showTicker(state.part, state.qeue[state.cursor][0], answer);

  const progress = Math.round((state.cursor + 1)*100/state.qeue.length) + '%';
  progressBar.style.width = progress;
  progressBar.innerHTML = '&nbsp;&nbsp;&nbsp;' + progress;

  if (state.type == "train") 
    setQuestionMode("submitted"); 
  else 
    next();
}

const next = () => {
  if (state.cursor + 1 == state.qeue.length) {
    stop();
    return;
  }

  state.cursor += 1;

  if (state.type == "train") setQuestionMode("new");
  showQuestion(state.part, state.qeue[state.cursor][0]);
}

const explain = () => {
  explainSection.forEach((el) => el.classList.toggle("hidden"));
}

const stop = () => {
  disableMenuButtons(false);
  timer();
  showResults();
}

const showResults = () => {
  const all = state.type == 'exam' ? state.examSize : state.cursor + 1;
  if (state.type == 'train' && !all) return;
  let right = 0, wrong = 0, noanswer = 0, notshowed = 0;
  for (let i = 0; i <= state.cursor; i++) {
    const answer = state.qeue[i][1];
    if (answer.length == 0) continue;
    const qNum = state.qeue[i][0];
    const correct = Q[state.part][qNum]["Answer"].split(',').sort().join('');
    if (answer == correct) right += 1; else wrong += 1;
  }
  noanswer = all - right - wrong;
  const max = Math.max(noanswer, wrong, right);

  resSection.innerHTML = `<h1>FINISHED!</h1><h2>Your score: <span>${Math.round(right*100/all)}%</span></h2>
  <div id="wrapper">
    <div>
      <p>&#10033; Number of questions: <span>${all}</span></p>
      <p>&#10033; Wrong answers: <span style="background: #ee4a4a;">${wrong}</span></p>
      <p>&#10033; Not answered: <span style="background: #eeee23;">${noanswer}</span></p>
      <p>&#10033; Correct answers: <span style="background: #49d549;">${right}</span></p>
    </div>
    <div id="diagram">
      <div style="background: #ee4a4a; height:${wrong*100/max}%;">${Math.round(wrong*100/all)}%</div>
      <div style="background: #eeee23; height:${noanswer*100/max}%;">${Math.round(noanswer*100/all)}%</div>
      <div style="background: #49d549; height:${right*100/max}%;">${Math.round(right*100/all)}%</div>
    </div>
  </div>`;

  questionDiv.classList.add('hidden');
  resSection.classList.add('active');
}

const timer = (t) => {
  if (typeof timeInterval  !== 'undefined') clearInterval(timeInterval); 
  if (!t) return;

  const currentTime = Date.parse(new Date());
  const deadline = new Date(currentTime + t*60*1000);

  const update = () => {
    const left = Date.parse(deadline) - Date.parse(new Date());
    const seconds = Math.floor( (left/1000) % 60 ).toString();
    const minutes = Math.floor( (left/1000) / 60 ).toString();
    clock.innerHTML = minutes.padStart(2, '0') + ':' + seconds.padStart(2, '0');
    if ( left <= 0 ) { 
      clearInterval(timeInterval); 
      stop();
    }
  }

  clock.classList.remove('hidden');
  update(); 
  timeInterval = setInterval(update, 1000);
}

const init = () => {
  overlay.style.display = 'none';

  [partButtons, typeButtons].forEach((btnSet) => {
    btnSet.forEach((btn) => {
      btn.addEventListener("click", () => {
        state[btn.name] = btn.value;
        document.querySelector(`button[name=${btn.name}].active`).classList.remove("active");
        btn.classList.add("active");
      })
    })
  })

  submitButton.addEventListener("click", submit);
  nextButton.addEventListener("click", next);
  startButton.addEventListener("click", start);
  explainButton.addEventListener('click', explain);
  stopButton.addEventListener("click", stop);
}

const getData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  }
  catch (err) {
    document.querySelector("#banner").innerHTML = err + 
    '<br>Something went wrong or there is a problem with your internet connection. Please try again later.';
  }
}

const Q = {};
state.data.forEach((url, i) => {
  getData(url)
    .then(data => { 
      Q[i+1] = data;
      if (Object.keys(Q).length == state.data.length) init();
    })
})
