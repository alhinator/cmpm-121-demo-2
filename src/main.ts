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
const ctx = mainCanvas.getContext("2d");
if (ctx == undefined) {
    throw "Canvas 2d context undefined.";
}

const cursor = { active: false, x: 0, y: 0 };

mainCanvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
});

mainCanvas.addEventListener("mousemove", (e) => {
    if (cursor.active) {
        ctx.beginPath();
        ctx.moveTo(cursor.x, cursor.y);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        cursor.x = e.offsetX;
        cursor.y = e.offsetY;
    }
});

mainCanvas.addEventListener("mouseup", (e) => {
    cursor.active = false;
});

const divider = document.createElement("div")
const clearCanvasButton = document.createElement("button")
clearCanvasButton.innerText = "CLEAR"
clearCanvasButton.addEventListener("click", ()=>{ctx.clearRect(0,0,mainCanvas.width, mainCanvas.height)})
divider.appendChild(clearCanvasButton)
app.appendChild(divider)