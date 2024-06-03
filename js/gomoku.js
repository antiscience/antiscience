const Game = 
{
    alpha: [...'abcdefghijklmnopqrstuvwxyz'.replace('i', '')],
    size: 15,
    patterns: [
                [[0,0], [1,0], [2,0], [3,0], [4,0]],
                [[0,0], [1,1], [2,2], [3,3], [4,4]],
                [[0,0], [0,1], [0,2], [0,3], [0,4]],
                [[0,5], [1,4], [2,3], [3,2], [4,1]]
              ],
    messages:
    {
        1: 'Next move: ',
        2: 'Game over. Black won!',
        3: 'Game over. White won!',
        4: 'Game over. Draw.',
        5: 'The game is already over. No further moves possible.',
        6: '2nd move by Black must be out of the 5x5 square (painted gray)'
    },

    convert(x)
    {
        if (typeof x == 'string') return [this.alpha.indexOf(x[0]), parseInt(x.slice(1))];
        return this.alpha[x[0]] + x[1]
    },

    init(obj)
    {
        this.status = 1;
        this.state = ['h7'];
        this.wlen = Math.min(this.patterns.map(x => x.length));

        this.fiveRule();
        this.render();
        this.showMessage(1)

        return this;
    },

    fiveRule()
    {
        const center = Math.floor(this.size/2) - 2;
        this.five = [];

        for (let i = center; i < center + 5; i++)
            for (let j = center; j < center + 5; j++) 
                this.five.push(this.convert([i, j]));
    },

    render()
    {
        const wrapper = document.getElementById("wrapper");
        wrapper.innerHTML = '';
        const board = document.createElement('div');
        board.id = "board";

        let html = '';
        for (let i = this.size - 1; i >= 0; i--) 
        {
            for (let j = 0; j < this.size; j++)
            {
                const point = this.convert([j, i])
                let cls = 'field'; 
                const idx = this.state.indexOf(point);
                if (idx > -1) cls += idx % 2 ? ' o' : ' x';
                html += `<div id="${point}" class="${cls}"></div>`;
            }
        }
        
        board.innerHTML = html;
        wrapper.appendChild(board);
        board.addEventListener("click", (e) => this.move(e));
        if (this.state.length < 3) this.switchFive(true);
    },

    switchFive(bool)
    {
        this.five.map(id => 
            {
                let field = document.getElementById(id);
                if (bool) field.classList.add("five"); else field.classList.remove("five");    
            })
    },

    move(e)
    { 
        const field = e.target;
        if (!field.matches('div.field')) return false;
        console.log(field)

        if (this.status !== 1) 
        {
            this.showMessage(5);
            return false;
        }

        const id = field.id;
        if (this.state.includes(id)) return false;
        if (this.state.length === 2 && field.classList.contains("five")) 
        {            
            this.showMessage(6);
            return false;
        }

        field.classList.add(this.state.length % 2 ? 'o' : 'x');
        this.update(id); 
    },

    update(id)
    {        
        this.state.push(id);
        if (this.state.length === 3) this.switchFive(false);
        if (this.state.length == this.size**2) this.status = 4;

        const won = this.hasWon();
        if (won) 
        {
            this.winningPattern = won;
            this.winner = this.state.length % 2;
            this.status = this.winner ? 2 : 3; 
            won.map(id => document.getElementById(id).classList.add('won')); 
        }

        this.showMessage(this.status);
        return this;
    },

    hasWon()
    {
        if (Math.ceil(this.state.length / 2) < this.wlen) return false;

        const player = (this.state.length + 1) % 2;
        const moves = new Set(this.state.filter((x, i) => i % 2 == player));
        const last = this.convert(this.state.slice(-1)[0]);

        const checker = new PatternMatcher(moves, this.size);
        for (let pattern of this.patterns)
        {
            match = checker.match(pattern, last)
            if (match.length) return match
        }
        return false
    },

    showMessage(s)
    {
        const turn = this.state.length % 2 ? 1 : 0;
        let message = this.messages[s];
        if (s == 1) message += ['<span id="msg-b">Black</span>', '<span id="msg-w">White</span>'][turn];

        const messageDiv = document.getElementById("message");
        messageDiv.innerHTML = message;
        messageDiv.className = s === 1 ? "ok" : "alert";

        return this;
    },

    reset()
    {
        this.init();
    }
}

class PatternMatcher
{
    constructor(points, border)
    {
        this.points = points; 
        this.border = border;
    }

    #translate(pattern, vector)
    {
        return pattern.map(x => [x[0] + vector[0], x[1] + vector[1]]);
    }

    match(pattern, point)
    { 
        for (let s of pattern)
        { 
            const vector = [point[0] - s[0], point[1] - s[1]];
            const translated = this.#translate(pattern, vector); 
            let ok = true;
            for (let p of translated)
            {  
                if (this.points.has(Game.convert(p))) continue;
                ok = false;
                break
            }
            if (ok) return translated.map(x => Game.convert(x));
        }
        return []
    }
}

(function init()
{
    document.getElementById("reset")
        .addEventListener('click', e => 
            { 
                e.preventDefault();
                Game.reset();
            });
    document.getElementById("rules")
    .addEventListener('click', e => 
        { 
            e.preventDefault();
            rules = document.getElementById('rulesDiv');
            rules.classList.remove('hidden');
        });
    [...document.querySelectorAll(".close")].map(el =>
        {
            el.addEventListener('click', e => 
            { 
                e.preventDefault();
                el.parentNode.classList.add('hidden');
            })
        })
})()

Game.init()

