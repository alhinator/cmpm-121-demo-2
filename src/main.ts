import "./style.css";

const APP_NAME = "Sticker Sketchpad aleghart";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

//create title
const mainHeader = document.createElement("h1");
mainHeader.innerText = APP_NAME;
app.appendChild(mainHeader);

const mainCanvas = document.createElement("canvas");
mainCanvas.setAttribute("width", "256px");
mainCanvas.setAttribute("height", "256px");
app.appendChild(mainCanvas);

//cursor code modified from https://quant-paint.glitch.me/paint0.html
const canvasContext = mainCanvas.getContext("2d");
if (canvasContext == undefined) {
    throw "Canvas 2d context undefined.";
}

//create cursor objecct
const cursor = { active: false, x: 0, y: 0 };

//when mouse is pressed, start active drawing
mainCanvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
});

//if mouse is active and moving, draw at its position
mainCanvas.addEventListener("mousemove", (e) => {
    if (cursor.active) {
        canvasContext.beginPath();
        canvasContext.moveTo(cursor.x, cursor.y);
        canvasContext.lineTo(e.offsetX, e.offsetY);
        canvasContext.stroke();
        cursor.x = e.offsetX;
        cursor.y = e.offsetY;
    }
});

//stop drawing on mouseup
mainCanvas.addEventListener("mouseup", (e) => {
    cursor.active = false;
});

const divider = document.createElement("div");
const clearCanvasButton = document.createElement("button");
clearCanvasButton.innerText = "CLEAR";
clearCanvasButton.addEventListener("click", () => {
    canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
});
divider.appendChild(clearCanvasButton);
app.appendChild(divider);
