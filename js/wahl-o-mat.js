surveyData = {
    questions:
    [
        "Do you like cats?",
        "Is your name Elvis?",
        "Have you stopped drinking brandy in the morning?",
        //"How much is 2x2?",
    ],

    responses:
    {
        1: "Yes",
        2: "WTF?",
        3: "No"
    }
}

class Survey
{
    constructor(
        surveyData, 
        container, 
        nextCallback = this.next
        )
    {
        this.current = -1;
        this.questions = surveyData.questions; 
        this.responses = surveyData.responses;
        this.container = document.getElementById(container);
        this.nextCallback = nextCallback;
        this.callbacks = [];
        this.cards = (new cardGenerator(this)).generate();
        this.progressBar = document.getElementById('surveyProgress') ?? false;
    }

    addEndCallback(fn)
    {
        this.callbacks.push(fn);
        return this;
    }

    runEndCallbacks()
    {
        console.log(JSON.stringify(this.answers));
        this.container.replaceChildren(); 
        for (const callback of this.callbacks) callback.call(this, this);
        return this;
    }

    start()
    {
        this.answers = new Array(this.questions.length);
        this.show(0);
        return this;
    }

    next()
    {
        this.show(this.current + 1);
        return this;
    }

    back()
    {
        this.show(this.current - 1);
        return this;
    }

    show(question, target = this.container)
    {
        const card = this.cards[question];
        if (question < 0) return false;
        if (question > this.questions.length - 1) 
        {
            this.progressBar.style.width = "100%";
            this.runEndCallbacks();
            return this;
        }

        this.current = question;
        this.progressBar.style.width = question * 100/ this.questions.length + "%";
        if (!target.hasChildNodes()) 
        {
            target.appendChild(card);
            card.classList.add('active');
            return this;
        }

        const old = target.children[0];
        old.ontransitionend = () => 
        {
            old.remove();
            target.appendChild(card);
            card.classList.add('active');
        }
        old.classList.remove('active');
        return this;
    }

    toList()
    {
        const list = document.createElement('div');
        list.className = "questionList";
        this.questions.forEach((question, i) => 
        {
            const resp = this.answers[i] ?? '';
            const answer = this.responses[resp] ?? "&mdash;";
            list.innerHTML += `<div><div>${question}</div><div class="answer answer-${resp}">${answer}</div>`;
        })
        return list;
    }

}

class cardGenerator
{
    constructor(survey)
    {
        this.cards = [];
        this.survey = survey;
    }

    generate()
    {
        this.cards = [...this.survey.questions.keys()].map(i => this.makeQuestionCard(i));
        return this.cards;
    }

    makeQuestionCard(question)
    {
        const div = document.createElement('div');
        div.className = "questionCard";
        div.innerHTML = `<div class="question">${this.survey.questions[question]}</div>`;
        div.appendChild(this.makeQuestionButtons(question));
        div.appendChild(this.makeNavigationButtons());
        return div;
    }

    makeQuestionButtons(question)
    {
        const buttons = document.createElement('div');
        buttons.className = "buttons";
        for (const resp in this.survey.responses)
        {
            const button = document.createElement("button");
            const answer = this.survey.responses[resp];
            button.name = question;
            button.value = resp;
            button.innerHTML = answer;
            button.addEventListener("click", () => this.onButtonClick(button))
            buttons.append(button); 
        }
        return buttons
    }

    makeNavigationButtons()
    {
        const nav = document.createElement("div");
        nav.className = "navButtons";
        for (const action of ['back', 'next'])
        {
            const button = document.createElement("button");
            button.name = action;
            button.innerHTML = '';
            button.addEventListener("click", () => this.survey[action]());
            nav.append(button); 
        }
        return nav;
    }

    onButtonClick(button)
    {
        const question = button.name,
              old = this.survey.answers[question] ?? false;
        if (old) 
        {
            button
                .parentNode
                .querySelector(`[value="${old}"]`)
                .classList
                .remove('clicked');
        }
        this.survey.answers[question] = button.value;
        button.classList.add('clicked');
        this.survey.nextCallback.call(this.survey, question);
    }

}


// initialization routines
const overlay = document.querySelector("#overlay");
const intro = document.getElementById("intro");
const survey = document.getElementById("survey");
const result = document.getElementById('result');
const show = (el) => el.classList.remove("hidden");
const hide = (el) => el.classList.add("hidden");

[...document.getElementsByClassName("local")].forEach( el => {
    el.addEventListener('click', e => { 
        e.preventDefault();
        show(document.getElementById(el.id + '-txt'));
    })
});

[...document.querySelectorAll(".close")].forEach( el => {
    el.addEventListener('click', e => { 
        e.preventDefault();
        hide(el.parentNode);
    })
});

overlay.querySelector(".close").addEventListener("click", () => hide(overlay));
  
// Survey stuff
const endCallback = (surveyInstance) =>
{
    window.setTimeout(() =>
    {
        result.querySelector('#result .content').replaceChildren(surveyInstance.toList());
        show(result);
        show(intro);
        hide(survey);
        document.getElementById('surveyProgress').style.width = "0%";
    }, 500)
}

let surveyInstance = null;
const begin = () =>
{
    hide(intro);
    show(overlay);
    show(survey);
    window.setTimeout(() => hide(overlay), 900);

    surveyInstance = new Survey(surveyData, 'survey');
    surveyInstance
        .addEndCallback(endCallback)
        .start();
}

document.getElementById("startButton").addEventListener("click", () => begin());

