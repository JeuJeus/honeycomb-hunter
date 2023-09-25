let gameCanvas;

const resizeCanvasToFullscreen = () => {
    if(!gameCanvas) gameCanvas = document.querySelector('#game');

    gameCanvas.width = window.innerWidth;
    gameCanvas.height = window.innerHeight;
};

document.addEventListener('DOMContentLoaded', () => {
    resizeCanvasToFullscreen();
});