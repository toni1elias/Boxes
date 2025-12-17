start(2);

const popup = document.getElementById('popup');
const popupHelp = document.getElementById('popup-help');
// popup.addEventListener('click', (e) => { if (e.target === popup) { controlPopup('popup', 'none'); } });
popupHelp.addEventListener('click', (e) => { if (e.target === popupHelp) { controlPopup('popupHelp', 'none'); } });

const soundTap = new Audio('sound/tap.mp3');
const soundSplash = new Audio('sound/splash.mp3');
const soundWin = new Audio('sound/win.mp3');
soundTap.volume = soundSplash.volume = soundWin.volume = 1;
soundTap.preload = soundSplash.preload = soundWin.preload = 'auto';
soundTap.load(); soundSplash.load(); soundWin.load();

function start(type, menu = "closed") {
    window.colors1 = ["#1F77B4", "#17BECF", "#04bfcf", "#4FB9E0", "#2CA02C", "#5FBF58", "#2ec27e"];
    window.colors2 = ["#FF7F0E", "#CC9B58", "#D62728", "#CC6E6C", "#9467BD", "#8C564B", "#CC9A00"];
    window.randomColor1 = colors1[Math.floor(Math.random() * colors1.length)];
    window.randomColor2 = colors2[Math.floor(Math.random() * colors2.length)];

    window.buttons = document.querySelectorAll("button.button-game");
    window.boxes = document.querySelectorAll("div.box-game");
    window.turnPlayer1 = document.getElementsByClassName("turn-container-player-1");
    window.turnPlayer2 = document.getElementsByClassName("turn-container-player-2");
    window.scorePlayer1 = document.getElementById("score-player-1").firstElementChild.lastElementChild;
    window.scorePlayer2 = document.getElementById("score-player-2").firstElementChild.lastElementChild;
    window.gameResult = document.getElementById("popup-title");

    window.AI = type; window.turn = 1; window.turnSpecial = 0; window.captured1 = 0; window.captured2 = 0; window.clicked = [];

    boxes[0].player = 0; boxes[0].captured = 0; boxes[0].sides = new Set(["H1X1", "H3X1", "V2X1", "V2X2"]);
    boxes[1].player = 0; boxes[1].captured = 0; boxes[1].sides = new Set(["H1X2", "H3X2", "V2X2", "V2X3"]);
    boxes[2].player = 0; boxes[2].captured = 0; boxes[2].sides = new Set(["H3X1", "H5X1", "V4X1", "V4X2"]);
    boxes[3].player = 0; boxes[3].captured = 0; boxes[3].sides = new Set(["H3X2", "H5X2", "V4X2", "V4X3"]);
    boxes[4].player = 0; boxes[4].captured = 0; boxes[4].sides = new Set(["H5X1", "H7X1", "V6X1", "V6X2"]);
    boxes[5].player = 0; boxes[5].captured = 0; boxes[5].sides = new Set(["H5X2", "H7X2", "V6X2", "V6X3"]);
    boxes[6].player = 0; boxes[6].captured = 0; boxes[6].sides = new Set(["H7X1", "H9X1", "V8X1", "V8X2"]);
    boxes[7].player = 0; boxes[7].captured = 0; boxes[7].sides = new Set(["H7X2", "H9X2", "V8X2", "V8X3"]);

    // Reset Game:
    buttons.forEach(button => { button.playerClicked1 = 0; button.playerClicked2 = 0; button.style.backgroundColor = 'var(--color-gray-light)'; });
    boxes.forEach(box => {
        box.style.setProperty('--fill-color', 'transparent');
        box.sides.forEach(side => { box.style.borderColor = 'transparent'; box.style.backgroundColor = 'transparent'; })
    });
    turnPlayer1[0].style.visibility = "visible";
    turnPlayer2[0].style.visibility = "hidden";
    scorePlayer1.textContent = captured1; scorePlayer2.textContent = captured2;

    document.documentElement.style.setProperty("--color-random-1", randomColor1);
    document.documentElement.style.setProperty("--color-random-2", randomColor2);

    document.addEventListener('DOMContentLoaded', () => {
        const buttonH1X1 = document.getElementById('H1X1'); if (!buttonH1X1) return;
        const buttonV2X2 = document.getElementById('V2X2'); if (!buttonV2X2) return;
        const buttonH3X1 = document.getElementById('H3X1'); if (!buttonH3X1) return;
        const buttonV2X1 = document.getElementById('V2X1'); if (!buttonV2X1) return;
        buttonH1X1.classList.add('shine');
        setTimeout(() => { buttonV2X2.classList.add('shine'); }, 250);
        setTimeout(() => { buttonH3X1.classList.add('shine'); }, 500);
        setTimeout(() => { buttonV2X1.classList.add('shine'); }, 750);
        setTimeout(() => { buttonH1X1.classList.add('shine'); }, 1000);
        setTimeout(() => { buttonH1X1.classList.remove('shine'); }, 750);
        setTimeout(() => { buttonV2X2.classList.remove('shine'); }, 1000);
        setTimeout(() => { buttonH3X1.classList.remove('shine'); }, 1250);
        setTimeout(() => { buttonV2X1.classList.remove('shine'); }, 1500);
        setTimeout(() => { buttonH1X1.classList.add('shine'); }, 1750);
    });

    if (menu === "toggle") { toggleMenu(); }
}

function game(id) {
    // clicked.push(id);
    calculate(id);
    if (AI > 0 && turn === 2 && (captured1 + captured2) < 8) {
        buttons.forEach(button => button.style.pointerEvents = "none"); // Disable clicks.
        selectedButton = null;
        let buttonsEnabled = [...window.buttons].filter(button => button.playerClicked1 === 0 && button.playerClicked2 === 0);
        if (AI === 1) {
            selectedButton = selector(buttonsEnabled);
        }
        if (AI === 2) {
            const boxesWinnable = [...boxes].filter(box => box.captured === 3);
            const boxesWinnableSides = boxesWinnable.flatMap(box => [...box.sides]);
            const boxesLosable = [...boxes].filter(box => box.captured === 2);
            const boxesLosableSides = boxesLosable.flatMap(box => [...box.sides]);
            let buttonsWinnable = [];
            if (boxesWinnable.length === 0) {
                buttonsWinnable = [...buttons].filter(button => !boxesLosableSides.includes(button.id));
            }
            else {
                buttonsWinnable = [...buttons].filter(button => boxesWinnableSides.includes(button.id));
            }
            let buttonsWinnableEnabled = [...buttonsWinnable].filter(button => button.playerClicked1 === 0 && button.playerClicked2 === 0);
            if (buttonsWinnableEnabled.length === 0) { buttonsWinnableEnabled = buttonsEnabled; }
            selectedButton = selector(buttonsWinnableEnabled);
        }
        if (selectedButton) {
            setTimeout(() => { document.getElementById(selectedButton).click(); }, 555);
        }
    } else {
        calculate(id);
    }
    scorePlayer1.textContent = captured1; scorePlayer2.textContent = captured2;
    // console.log('Ran:', id);
}

function calculate(id) {
    buttons.forEach(button => button.style.pointerEvents = ""); // Enable clicks.
    if (captured1 + captured2 < 8) {
        buttons.forEach(button => {
            if (button.id === id && !(button.playerClicked1 || button.playerClicked2)) {
                // console.clear();
                turnSpecial = 0;
                boxes.forEach(box => {
                    box.sides.forEach(side => {
                        if (side === id) {
                            box.captured++;
                            if (box.captured === 4) {
                                turnSpecial = 1;
                                box.player = turn;
                                box.style.borderColor = 'var(--color-gray-lighter)';
                                if (turn === 1) {
                                    box.style.setProperty('--fill-color', randomColor1);
                                    box.classList.add('filled');
                                    captured1++;
                                } else {
                                    box.style.setProperty('--fill-color', randomColor2);
                                    box.classList.add('filled');
                                    captured2++;
                                }
                                soundSplash.currentTime = 0; soundSplash.play();
                            }
                        }
                    });
                    // console.log("Player:", box.player, "Captured:", box.captured, "Sides:", box.sides);
                });
                if (turn === 1) {
                    if (turnSpecial === 0) { turn = 2; }
                    button.playerClicked1 = 1; button.style.backgroundColor = 'var(--color-random-1)';
                } else {
                    if (turnSpecial === 0) { turn = 1; }
                    button.playerClicked2 = 1; button.style.backgroundColor = 'var(--color-random-2)';
                }
                button.classList.toggle('clicked');
                if (soundSplash.paused || soundSplash.ended || soundSplash.currentTime <= 0) {
                    soundTap.currentTime = 0; soundTap.play();
                }
                setTimeout(() => { button.classList.remove('clicked'); }, 555);
            }
        });
        if (turn === 1) {
            turnPlayer1[0].style.visibility = "visible";
            turnPlayer2[0].style.visibility = "hidden";
        } else {
            turnPlayer1[0].style.visibility = "hidden";
            turnPlayer2[0].style.visibility = "visible";
        }
    }
    if (captured1 + captured2 === 8) { // Game End:
        turnPlayer1[0].style.visibility = "hidden";
        turnPlayer2[0].style.visibility = "hidden";
        setTimeout(() => {
            if (captured1 > captured2) {
                gameResult.textContent = "Player 1 wins.";
                gameResult.style.color = 'var(--color-random-1)';
                controlPopup('popup');
                celebrateWin();
            }
            else if (captured1 < captured2) {
                gameResult.textContent = "Player 2 wins.";
                gameResult.style.color = 'var(--color-random-2)';
                controlPopup('popup');
                celebrateWin();
            }
            else {
                controlPopup('popup');
                gameResult.textContent = "Draw.";
            }
        }, 1111);
    }

}
function goHome() { window.location.href = '/'; }

function toggleMenu() { document.getElementById("menu").classList.toggle("active"); }

function selector(buttonsCollection) {
    do {
        selectorButton = buttonsCollection[Math.floor(Math.random() * buttonsCollection.length)].id;
    } while (selectorButton.playerClicked1 === 0 && selectorButton.playerClicked2 === 0);
    return selectorButton;
}

function controlPopup(name, option = "flex") {
    if (name === 'popup') { element = popup; } else { element = popupHelp; }
    element.style.display = option;
}

function celebrateWin() {
    const canvas = document.getElementById('canvas-confetti');
    const canvasConfetti = confetti.create(canvas, { resize: true, useWorker: true });
    canvasConfetti({ particleCount: 800, spread: 200, origin: { x: 0.5, y: 0.8 } });
    soundWin.currentTime = 0; soundWin.play();
}
