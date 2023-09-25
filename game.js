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
    positionX: BLOCK_SIZE * 10,
    positionY: BLOCK_SIZE * 10,

    velocityX: VELOCITY,
    velocityY: 0,

    cellsWithBees: [],

    beesLengthCells: 4
});

let bees = getInitialBees();

const getInitialHoney = () => ({
    positionX: BLOCK_SIZE * getRandomInt(0, 20),
    positionY: BLOCK_SIZE * getRandomInt(0, 20)
});

let honey = getInitialHoney();

const clearCanvas = () => gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

const beesAreOutOfBoundsBottom = () => bees.positionX < 0;
const beesAreOutOfBoundsTop = () => bees.positionX >= gameCanvas.width;
const beesAreOutOfBoundsLeft = () => bees.positionY < 0;
const beesAreOutOfBoundsRight = () => bees.positionY >= gameCanvas.height;

const removeBeeFromLastCell = () => bees.cellsWithBees.unshift({x: bees.positionX, y: bees.positionY});

const isBeesListBiggerThanBeeCells = () => bees.cellsWithBees.length > bees.beesLengthCells;

const drawHoney = () => gameContext.drawImage(honeyPot, honey.positionX, honey.positionY, BLOCK_SIZE, BLOCK_SIZE);

const beeAteHoney = cell => cell.x === honey.positionX && cell.y === honey.positionY;

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
    honey.positionX = getRandomInt(0, 25) * BLOCK_SIZE;
    honey.positionY = getRandomInt(0, 25) * BLOCK_SIZE;
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
    if (beesAreOutOfBoundsBottom()) bees.positionX = gameCanvas.width - BLOCK_SIZE;
    else if (beesAreOutOfBoundsTop()) bees.positionX = 0;
    if (beesAreOutOfBoundsLeft()) bees.positionY = gameCanvas.height - BLOCK_SIZE;
    else if (beesAreOutOfBoundsRight()) bees.positionY = 0;
};

const drawGameStateOnCanvas = () => {
    clearCanvas();

    gameContext.canvas.width = window.innerWidth;
    gameContext.canvas.height = window.innerHeight;

    drawGameBackground();
    drawHoney();
    drawBees();
};

const gameLoop = () => {
    requestAnimationFrame(gameLoop);

    ++ticks;
    if (shallNotRenderNewFrame()) return;
    ticks = 0;

    bees.positionX += bees.velocityX;
    bees.positionY += bees.velocityY;

    handleWrappingBeesAroundScreen();

    removeBeeFromLastCell();

    if (isBeesListBiggerThanBeeCells()) bees.cellsWithBees.pop();

    drawGameStateOnCanvas();
};

const wasLeftArrowKeyPressedAndNotMovingHorizontally = e => e.key === 'ArrowLeft' && bees.velocityX === 0;
const wasUpArrowKeyPressedAndNotMovingVertically = e => e.key === 'ArrowUp' && bees.velocityY === 0;
const wasRightArrowKeyPressedAndNotMovingHorizontally = e => e.key === 'ArrowRight' && bees.velocityX === 0;
const wasDownArrowKeyPressedAndNotMovingVertically = e => e.key === 'ArrowDown' && bees.velocityY === 0;

const handleKeyboardEvents = e => {
    if (wasLeftArrowKeyPressedAndNotMovingHorizontally(e)) {
        bees.velocityX = -VELOCITY;
        bees.velocityY = 0;
    } else if (wasUpArrowKeyPressedAndNotMovingVertically(e)) {
        bees.velocityX = 0;
        bees.velocityY = -VELOCITY;
    } else if (wasRightArrowKeyPressedAndNotMovingHorizontally(e)) {
        bees.velocityX = VELOCITY;
        bees.velocityY = 0;
    } else if (wasDownArrowKeyPressedAndNotMovingVertically(e)) {
        bees.velocityX = 0;
        bees.velocityY = VELOCITY;
    }
};

document.addEventListener('keydown', e => handleKeyboardEvents(e));

