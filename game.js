const gameBackground = new Image();
gameBackground.src = './assets/sprite/grass.png';

const honeyPot = new Image();
honeyPot.src = './assets/sprite/honey-pot.svg';

const bee = new Image();
bee.src = './assets/sprite/bee.svg';

const slurpSound = new Audio('./assets/sound/slurp.mp3');

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

let gameCanvas;
let gameContext;

let ticks = 0;
const TICKS_PER_FRAME = 10;

const resizeCanvasToFullscreen = () => {
    if (!gameCanvas) gameCanvas = document.querySelector('#game');

    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
};

const drawGameBackground = () => {
    gameContext.fillStyle = gameContext.createPattern(gameBackground, 'repeat');
    gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
};

const ensureGameBackground = () => gameBackground.addEventListener('load', () => drawGameBackground());

document.addEventListener('DOMContentLoaded', () => {
    gameCanvas = document.querySelector('#game');
    gameContext = gameCanvas.getContext('2d');

    resizeCanvasToFullscreen();

    ensureGameBackground();

    requestAnimationFrame(gameLoop);
});

const BLOCK_SIZE = 64;
const VELOCITY = BLOCK_SIZE;
const getInitialBees = () => ({
    position: {
        x: BLOCK_SIZE * getRandomInt(0, 10),
        y: BLOCK_SIZE * getRandomInt(0, 10),
    },

    velocity: {
        x: VELOCITY,
        y: 0
    },

    cellsWithBees: [],

    beesLengthCells: 4
});

let bees = getInitialBees();

const getInitialHoney = () => ({
    position: {
        x: BLOCK_SIZE * getRandomInt(0, 20),
        y: BLOCK_SIZE * getRandomInt(0, 20),
    },
});

let honey = getInitialHoney();

const clearCanvas = () => gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

const beesAreOutOfBoundsBottom = () => bees.position.x < 0;
const beesAreOutOfBoundsTop = () => bees.position.x >= gameCanvas.width;
const beesAreOutOfBoundsLeft = () => bees.position.y < 0;
const beesAreOutOfBoundsRight = () => bees.position.y >= gameCanvas.height;

const removeBeeFromLastCell = () => bees.cellsWithBees.unshift({x: bees.position.x, y: bees.position.y});

const isBeesListBiggerThanBeeCells = () => bees.cellsWithBees.length > bees.beesLengthCells;

const drawHoney = () => gameContext.drawImage(honeyPot, honey.position.x, honey.position.y, BLOCK_SIZE, BLOCK_SIZE);

const beeAteHoney = cell => cell.x === honey.position.x && cell.y === honey.position.y;

const beesRanOverThemself = (cell, i) => cell.x === bees.cellsWithBees[i].x && cell.y === bees.cellsWithBees[i].y;

const resetGame = () => {
    bees = getInitialBees();
    honey = getInitialHoney();
};

const beeCollisionDetection = (index, cell) => {
    let beeAfterTheCurrent = index + 1;
    for (let i = beeAfterTheCurrent; i < bees.cellsWithBees.length; i++) {
        if (beesRanOverThemself(cell, i)) resetGame();
    }
};

const placeNewHoney = () => {
    honey.position.x = getRandomInt(0, 25) * BLOCK_SIZE;
    honey.position.y = getRandomInt(0, 25) * BLOCK_SIZE;
};

const drawBee = (cell, index) => {

    gameContext.drawImage(bee, cell.x, cell.y, BLOCK_SIZE, BLOCK_SIZE);

    if (beeAteHoney(cell)) {
        slurpSound.play();
        bees.beesLengthCells++;
        placeNewHoney();
    }

    beeCollisionDetection(index, cell);
};

const drawBees = () => bees.cellsWithBees.forEach((cell, index) => drawBee(cell, index));

const shallNotRenderNewFrame = () => ticks < TICKS_PER_FRAME;

const handleWrappingBeesAroundScreen = () => {
    if (beesAreOutOfBoundsBottom()) bees.position.x = gameCanvas.width - BLOCK_SIZE;
    else if (beesAreOutOfBoundsTop()) bees.position.x = 0;
    if (beesAreOutOfBoundsLeft()) bees.position.y = gameCanvas.height - BLOCK_SIZE;
    else if (beesAreOutOfBoundsRight()) bees.position.y = 0;
};

const drawGameStateOnCanvas = () => {
    clearCanvas();

    gameContext.canvas.width = window.innerWidth;
    gameContext.canvas.height = window.innerHeight;

    drawGameBackground();
    drawHoney();
    drawBees();
};

const moveBees = () => {
    bees.position.x += bees.velocity.x;
    bees.position.y += bees.velocity.y;
};

const gameLoop = () => {
    requestAnimationFrame(gameLoop);

    ++ticks;
    if (shallNotRenderNewFrame()) return;
    ticks = 0;

    moveBees();

    handleWrappingBeesAroundScreen();

    removeBeeFromLastCell();

    if (isBeesListBiggerThanBeeCells()) bees.cellsWithBees.pop();

    drawGameStateOnCanvas();
};

const wasLeftArrowKeyPressedAndNotMovingHorizontally = e => e.key === 'ArrowLeft' && bees.velocity.x === 0;
const wasUpArrowKeyPressedAndNotMovingVertically = e => e.key === 'ArrowUp' && bees.velocity.y === 0;
const wasRightArrowKeyPressedAndNotMovingHorizontally = e => e.key === 'ArrowRight' && bees.velocity.x === 0;
const wasDownArrowKeyPressedAndNotMovingVertically = e => e.key === 'ArrowDown' && bees.velocity.y === 0;

const changeMovementDirectionToLeft = () => {
    bees.velocity.x = -VELOCITY;
    bees.velocity.y = 0;
};

const changeMovementDirectionToUp = () => {
    bees.velocity.x = 0;
    bees.velocity.y = -VELOCITY;
};

const changeMovementDirectionToRight = () => {
    bees.velocity.x = VELOCITY;
    bees.velocity.y = 0;
};

const changeMovementDirectionToDown = () => {
    bees.velocity.x = 0;
    bees.velocity.y = VELOCITY;
};

const handleKeyboardEvents = e => {
    if (wasLeftArrowKeyPressedAndNotMovingHorizontally(e)) changeMovementDirectionToLeft();
    else if (wasUpArrowKeyPressedAndNotMovingVertically(e)) changeMovementDirectionToUp();
    else if (wasRightArrowKeyPressedAndNotMovingHorizontally(e)) changeMovementDirectionToRight();
    else if (wasDownArrowKeyPressedAndNotMovingVertically(e)) changeMovementDirectionToDown();
};

document.addEventListener('keydown', e => handleKeyboardEvents(e));

const clickWasInLeftDirectionAndNotMovingHorizontally = e => e.x < bees.position.x && bees.velocity.x === 0;

const clickWasInRightDirectionAndNotMovingHorizontally = e => e.x > bees.position.x && bees.velocity.x === 0;

const clickWasInTopDirectionAndNotMovingVertically = e => e.y < bees.position.y && bees.velocity.y === 0;

const clickWasInBottomDirectionAndNotMovingVertically = e => e.y > bees.position.y && bees.velocity.y === 0;

const handleClickEvent = e => {
    if (clickWasInLeftDirectionAndNotMovingHorizontally(e)) changeMovementDirectionToLeft();
    else if (clickWasInTopDirectionAndNotMovingVertically(e)) changeMovementDirectionToUp();
    else if (clickWasInRightDirectionAndNotMovingHorizontally(e)) changeMovementDirectionToRight();
    else if (clickWasInBottomDirectionAndNotMovingVertically(e)) changeMovementDirectionToDown();
};

document.addEventListener('click', e => handleClickEvent(e))
