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

/*cursor code modified from https://quant-paint.glitch.me/paint0.html, 
https://quant-paint.glitch.me/paint1.html
*/
const canvasContext = mainCanvas.getContext("2d");
if (canvasContext == undefined) {
    throw "Canvas 2d context undefined.";
}

//create cursor objecct
const cursor = { active: false, x: 0, y: 0 };

//define the data structure we're using to store points
type Coord = {
    x: number;
    y: number;
};
//a line is an array of coordinates. a list of lines makes up our lines and redolines
const lines: Coord[][] = [];
const redoLines: Coord[][] = [];

//set the current line to be empty
let currLine: Coord[] = [];

//create array of points to store mouse data in.

//when mouse is pressed, start active drawing
mainCanvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    //initialize current line with a starting point
    currLine = [{ x: cursor.x, y: cursor.y }];

    //push when mouse goes down
    lines.push(currLine);

    //splice the redo lines
    redoLines.splice(0, redoLines.length);
    mainCanvas.dispatchEvent(drawChanged);
});

//if mouse is active and moving, draw at its position
mainCanvas.addEventListener("mousemove", (e) => {
    if (cursor.active) {
        cursor.x = e.offsetX;
        cursor.y = e.offsetY;

        currLine.push({ x: cursor.x, y: cursor.y });

        mainCanvas.dispatchEvent(drawChanged);
    }
});

//stop drawing on mouseup
mainCanvas.addEventListener("mouseup", (e) => {
    cursor.active = false;
    currLine = [];
    mainCanvas.dispatchEvent(drawChanged);
});

//canvas dispatch event
const drawChanged = new Event("drawing-changed");

mainCanvas.addEventListener("drawing-changed", (e) => {
    canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

    for (const line of lines) {
        if (line.length > 1) {
            canvasContext.beginPath();
            const { x, y } = line[0];
            canvasContext.moveTo(x, y);
            for (const { x, y } of line) {
                canvasContext.lineTo(x, y);
            }
            canvasContext.stroke();
        }
    }
});

const buttonSection = document.createElement("div");
//do clear, undo, redo buttons

//clear
const clearCanvasButton = document.createElement("button");
buttonSection.appendChild(clearCanvasButton);
clearCanvasButton.innerText = "CLEAR";
clearCanvasButton.addEventListener("click", () => {
    canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    lines.splice(0, lines.length);
    redoLines.splice(0, redoLines.length);

    mainCanvas.dispatchEvent(drawChanged);
});

//undo
const undoButton = document.createElement("button");
buttonSection.appendChild(undoButton);
undoButton.innerText = "UNDO";
undoButton.addEventListener("click", () => {
    canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    let tmp = lines.pop();
    if (typeof tmp == "object") {
        redoLines.push(tmp);
    }
    mainCanvas.dispatchEvent(drawChanged);
});

//redo
const redoButton = document.createElement("button");
buttonSection.appendChild(redoButton);
redoButton.innerText = "REDO";
redoButton.addEventListener("click", () => {
    canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    let tmp = redoLines.pop();
    if (typeof tmp == "object") {
        lines.push(tmp);
    }
    mainCanvas.dispatchEvent(drawChanged);
});

app.appendChild(buttonSection);
