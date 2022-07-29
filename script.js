
let jpk = {models:{},builtins:{},utils:{},client:{},ui:{}};

jpk.models.load = `<div class="card">
            <h1 class="card-title">Load a deck</h1>
            <div class="card-descriptions">
                <p>builtins <button onclick="jpk.utils.loaddeck(jpk.builtins.TestDeck)">TestDeck</button> or <form id="form"><input id="form-file" type="file"><input id="form-submit" type="submit"></form></p>
            </div>
        </div>`
jpk.models.noms = `<div class="card">
            <h1 class="card-title">noms:Title</h1>
            <div class="card-descriptions">
                <p>EXMAPLE</p><button>test</button>
            </div>
        </div>`

jpk.builtins.TestDeck = `{
    "pack": {
        "name": "pack name",
        "desc": "pack description",
        "creator": "name of creator"
    },
    "cards": [
        {
            "face": "How bees are alive?",
            "flip": [
                "100"
            ]
        },
        {
            "face": "What is your name?",
            "flip": [
                "Billy", "Joe", "John"
            ]
        }
    ]
}`

jpk.client = {
    deck: null,
    cards: 0,
    pickedCard: null
}

jpk.utils.deck = class {
    constructor(name, desc, creator, cards) {
        this.pack = {
            name: name,
            desc: desc,
            creator: creator
        }
        this.cards = cards;
    }
}

jpk.utils.card = class {
    constructor(face, flip) {
        this.face = face; //Question
        this.flip = flip; //Array of possible correct answers
        this.seen = 0;
        this.correct = 0;
    }
    isCorrect(attempt) {
        return this.flip.includes(attempt);
    }
    getPercent() {
        return Math.round((this.correct/this.seen)*100)
    }
}

//turns JSON to jpk.utils.deck
jpk.utils.parsedeck = (deck) => {
    let fake_cards = []
    for(let i = 0; i < deck.cards.length; i++) {
        fake_flips = [];
        for(let j = 0; j < deck.cards[i].flip.length; j++) {
            fake_flips.push(deck.cards[i].flip[j].toLowerCase())
        }
        fake_cards.push(new jpk.utils.card(deck.cards[i].face, fake_flips))
    }
    return new jpk.utils.deck(deck.pack.name, deck.pack.desc, deck.pack.creator, fake_cards);
}

//actually loads the deck
jpk.utils.loaddeck = (deck) => {
    try {
        deck = jpk.utils.parsedeck(JSON.parse(deck));
    } catch {
        alert("22JPK: Something went wrong loading deck")
        jpk.utils.go(); //try to restart without crashing pls pls pls
    }
    jpk.client.deck = deck;
    jpk.ui.dynamic(`<div class="card">
            <h1><span id="card-title">Loading</span><span class="dimmed" id="card-hint"></span></h1>
            <div id="card-descriptions">
                <form id="card-form" autocomplete="off">
                    <input id="card-input" type="text"><input id="card-submit" type="submit">
                </form>
            </div>
        </div>`)
    let form = document.getElementById("card-form")
    let input = document.getElementById("card-input")
    let hint = document.getElementById("card-hint")
    //thx to Thenlie#9148
    form.addEventListener('submit', (Event) => {
        Event.preventDefault()
        input.value = input.value.toLowerCase();
        if (jpk.client.pickedCard.isCorrect(input.value)) {
            input.value = "";
            jpk.client.pickedCard.seen++;
            jpk.client.pickedCard.correct++;
            jpk.client.cards++;
            hint.innerHTML = "";
            jpk.utils.loadcard()
        } else if (input.value == "s") {
            input.value = "";
            jpk.client.pickedCard.seen++;
            jpk.client.cards++;
            hint.innerHTML = "";
            jpk.utils.loadcard()
        } else if (input.value == "?") {
            input.value = "";
            jpk.client.pickedCard.seen++;
            jpk.client.cards++;
            jpk.ui.updateLowBar(jpk.client.deck.pack.name, jpk.client.cards, jpk.client.pickedCard.seen, jpk.client.pickedCard.correct, jpk.client.pickedCard.getPercent())
            hint.innerHTML = " (" + jpk.client.pickedCard.flip[0] + ") "
        } else if (!jpk.client.pickedCard.isCorrect(input.value)) {
            input.value = "";
            jpk.client.pickedCard.seen++;
            jpk.client.cards++;
            jpk.ui.updateLowBar(jpk.client.deck.pack.name, jpk.client.cards, jpk.client.pickedCard.seen, jpk.client.pickedCard.correct, jpk.client.pickedCard.getPercent())
        }
    })
    jpk.utils.loadcard();
}

//primary function for choosing, triggering ui loading of new cards
jpk.utils.loadcard = () => {
    let num = Math.floor(Math.random() * jpk.client.deck.cards.length)
    jpk.client.pickedCard = jpk.client.deck.cards[num];
    jpk.ui.pushcard()
}

//go back to loading screen, unload deck
jpk.utils.quitdeck = () => {
    jpk.client.deck = null;
    jpk.client.pickedCard = null;
    jpk.utils.go();
}

//initial loading setup
jpk.utils.go = () => {
    jpk.ui.dynamic(jpk.models.load)
    let form = document.getElementById("form");
    let file_holder = document.getElementById("form-file")
    form.addEventListener('submit', (Event) => {
        Event.preventDefault();
        let file = file_holder.files[0];
        file.text().then((v) => {
            console.log(v)
            jpk.utils.loaddeck(v)
        })
    })
    jpk.ui.updateLowBar("unknown", jpk.client.cards, 0, 0, 0)
}

//updates the lowbar ui
jpk.ui.updateLowBar = (playing, cards, seen, correct, percentage) => {
    let lowbar = document.getElementById("lowbar");
    lowbar.innerHTML = `<button onclick="jpk.utils.quitdeck()">quit</button><span class="leftlowbar">playing <span class="highlight">${playing}</span> cards ${cards}</span> ——————————— <span class="rightlowbar">seen ${seen} correct ${correct} percent ${percentage}</span>`
}

//shorthand way of loading to the dynamic div
jpk.ui.dynamic = (content) => {
    document.getElementById("dynamic").innerHTML = content;
}

//push card ui content (question)
jpk.ui.pushcard = () => {
    document.getElementById("card-title").innerHTML = jpk.client.pickedCard.face;
    jpk.ui.updateLowBar(jpk.client.deck.pack.name, jpk.client.cards, jpk.client.pickedCard.seen, jpk.client.pickedCard.correct, jpk.client.pickedCard.getPercent())
}

