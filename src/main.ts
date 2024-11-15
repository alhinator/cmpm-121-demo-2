import "./style.css";
import { ToolPreview } from "./Tool.ts";

const APP_NAME = "Sticker Sketchpad aleghart";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

export enum MARKER_SIZE {
    Thin = 1,
    Thick = 5,
}
let currSize: MARKER_SIZE = MARKER_SIZE.Thin;
interface color {
    r:number;
    g:number;
    b:number;
}
let currColor: color = { r: 0, g: 0, b: 0 };

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

interface Tool {
    display(ctx: CanvasRenderingContext2D): void;
    move(_newX: number, _newY: number): void;
}

//define the data structure we're using to store points
class Coord implements Tool {
    x: number[] = [];
    y: number[] = [];
    thickness: MARKER_SIZE;
    col:color;
    constructor(_x: number, _y: number, _thicc: MARKER_SIZE) {
        this.x.push(_x);
        this.y.push(_y);
        this.thickness = _thicc;
        this.col = {r:currColor.r, g:currColor.g, b:currColor.b};
    }
    public display(ctx: CanvasRenderingContext2D) {
        if (this.x.length != this.y.length) {
            throw "Coord: display(): x and y coord array lengths are not the same.";
            return -1;
        }
        ctx.lineWidth = this.thickness;

        ctx.strokeStyle =
            "rgb(" + this.col.r + " " + this.col.g + " " + this.col.b + ")";
        ctx.beginPath();
        ctx.moveTo(this.x[0], this.y[0]);
        for (let i = 0; i < this.x.length; i++) {
            ctx.lineTo(this.x[i], this.y[i]);
        }
        ctx.stroke();
    }
    public move(_x: number, _y: number) {
        this.x.push(_x);
        this.y.push(_y);
    }
}

class Emoji implements Tool {
    x: number;
    y: number;
    emoticon: string;
    constructor(_x: number, _y: number, _emoticon: string) {
        this.x = _x;
        this.y = _y;
        this.emoticon = _emoticon;
    }
    display(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.font = "16px sans serif";
        ctx.fillText(this.emoticon, this.x, this.y);
    }
    move(_newX: number, _newY: number) {
        this.x = _newX;
        this.y = _newY;
    }
}

const undoList: Tool[] = [];
const redoList: Tool[] = [];
let currentTool: Tool | null = null;

//when mouse is pressed, start active drawing
mainCanvas.addEventListener("mousedown", (e) => {
    ToolPreview.active = true;
    ToolPreview.xpos = e.offsetX;
    ToolPreview.ypos = e.offsetY;

    if (!ToolPreview.drawEmojis) {
        //initialize current line with a starting point
        currentTool = new Coord(ToolPreview.xpos, ToolPreview.ypos, currSize);
    } else {
        currentTool = new Emoji(ToolPreview.xpos, ToolPreview.ypos, ToolPreview.currentEmoji);
    }
    redoList.push(currentTool);
});

//if mouse is active and moving, draw at its position
mainCanvas.addEventListener("mousemove", (e) => {
    ToolPreview.xpos = e.offsetX;
    ToolPreview.ypos = e.offsetY;
    mainCanvas.dispatchEvent(toolMoved);
    if (ToolPreview.active && currentTool) {
        currentTool.move(ToolPreview.xpos, ToolPreview.ypos);
    }
    mainCanvas.dispatchEvent(drawChanged);
});

//stop drawing on mouseup
mainCanvas.addEventListener("mouseup", (e) => {
    ToolPreview.active = false;
    //currLine = undefined;
    mainCanvas.dispatchEvent(drawChanged);
});

//canvas dispatch event
const drawChanged = new Event("drawing-changed");
mainCanvas.addEventListener("drawing-changed", (e) => {
    canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    if (!ToolPreview.active) {
        ToolPreview.draw(canvasContext);
    }
    redoList.forEach((tool) => {
        tool.display(canvasContext);
    });
});

//tool moved dispach event
const toolMoved = new Event("tool-moved");
mainCanvas.addEventListener("tool-moved", (e) => {
    //do stuff
    //mainCanvas.dispatchEvent(drawChanged);
});

const buttonSection = document.createElement("div");
//do clear, undo, redo buttons
//clear
const clearCanvasButton = document.createElement("button");
buttonSection.appendChild(clearCanvasButton);
clearCanvasButton.innerText = "CLEAR";
clearCanvasButton.addEventListener("click", () => {
    canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    redoList.splice(0, redoList.length);
    mainCanvas.dispatchEvent(drawChanged);
});

//undo
const undoButton = document.createElement("button");
buttonSection.appendChild(undoButton);
undoButton.innerText = "UNDO";
undoButton.addEventListener("click", () => {
    canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    if(redoList.length > 0) {
        undoList.push(redoList.pop()!);
    }
    mainCanvas.dispatchEvent(drawChanged);
});

//redo
const redoButton = document.createElement("button");
buttonSection.appendChild(redoButton);
redoButton.innerText = "REDO";
redoButton.addEventListener("click", () => {
    canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    if(undoList.length > 0) {
        redoList.push(undoList.pop()!);
    }
    mainCanvas.dispatchEvent(drawChanged);
});
app.appendChild(buttonSection);

//line button holder
const markerHolder = document.createElement("div");

const buttonClear = new Event("button-clear");
mainCanvas.addEventListener("button-clear", (event) => {
    let buttArray = document.getElementsByClassName("selected-tool");
    for (let i = 0; i < buttArray.length; i++) {
        buttArray[i].setAttribute("class", "");
    }
});

//thin line
const thinButton = document.createElement("button");
thinButton.setAttribute("class", "selected-tool");
thinButton.innerText = "Thin Marker";
thinButton.addEventListener("click", () => {
    currSize = MARKER_SIZE.Thin;
    ToolPreview.thinMode();
    mainCanvas.dispatchEvent(buttonClear);
    thinButton.setAttribute("class", "selected-tool");
});
markerHolder.appendChild(thinButton);
//thick line
const thickButton = document.createElement("button");
thickButton.innerText = "Thick Marker";
thickButton.addEventListener("click", () => {
    currSize = MARKER_SIZE.Thick;
    ToolPreview.thickMode();
    mainCanvas.dispatchEvent(buttonClear);
    thickButton.setAttribute("class", "selected-tool");
});
markerHolder.appendChild(thickButton);

app.appendChild(markerHolder);

//emoji buttons
const emojiSection = document.createElement("div");
const availableEmojis: string[] = ["✨", "💀", "👍"];
let emojiButtons: HTMLButtonElement[] = [];

const customButton = document.createElement("button");

customButton.innerText = "Custom Sticker";
customButton.addEventListener("click", (event) => {
    let t = prompt("Custom Sticker Text", "🤓");
    if (t !== null) {
        makeEmojiButtons(emojiButtons, [t]);
    }
});
emojiSection.appendChild(customButton);

makeEmojiButtons(emojiButtons, availableEmojis);
app.appendChild(emojiSection);

function makeEmojiButtons(_export: HTMLButtonElement[], _arr: string[]) {
    _arr.forEach((element) => {
        let tmp = document.createElement("button");
        tmp.innerText = element;
        tmp.addEventListener("click", (event) => emojiCallback(tmp));
        emojiSection.appendChild(tmp);
        _export.push(tmp);
    });
}

function emojiCallback(_theButton: HTMLButtonElement) {
    mainCanvas.dispatchEvent(buttonClear);
    _theButton.setAttribute("class", "selected-tool");
    mainCanvas.dispatchEvent(toolMoved);
    ToolPreview.emojiMode = _theButton.innerText;
}

const dlDiv = document.createElement("div");
const dlButton = document.createElement("button");
dlDiv.appendChild(dlButton);
dlButton.innerText = "Download Sketch!";
dlButton.addEventListener("click", doDownload);
app.appendChild(dlDiv);
function doDownload() {
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.setAttribute("width", "1024px");
    tmpCanvas.setAttribute("height", "1024px");
    const tmpCtx = tmpCanvas.getContext("2d");
    if (tmpCtx == undefined) {
        throw "scaled Canvas 2d context undefined.";
    }
    tmpCtx.scale(4, 4);
    redoList.forEach((tool) => {
        tool.display(tmpCtx);
    });
    const anchor = document.createElement("a");
    anchor.href = tmpCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
}

const colorDiv = document.createElement("div");
const sliderTxt = document.createElement("p");
sliderTxt.innerText = "Color sliders RGB";
colorDiv.appendChild(sliderTxt);



const sliderR = document.createElement("input");
sliderR.setAttribute("type", "range");
sliderR.setAttribute("id", "R");
sliderR.setAttribute("min", "0");
sliderR.setAttribute("max", "255");
sliderR.setAttribute("value", "0");
sliderR.addEventListener("change", updateColor);

const sliderG = document.createElement("input");
sliderG.setAttribute("type", "range");
sliderG.setAttribute("id", "G");
sliderG.setAttribute("min", "0");
sliderG.setAttribute("max", "255");
sliderG.setAttribute("value", "0");
sliderG.addEventListener("change", updateColor);

const sliderB = document.createElement("input");
sliderB.setAttribute("type", "range");
sliderB.setAttribute("id", "B");
sliderB.setAttribute("min", "0");
sliderB.setAttribute("max", "255");
sliderB.setAttribute("value", "0");

sliderB.addEventListener("change", updateColor);

colorDiv.appendChild(sliderR);
colorDiv.appendChild(sliderG);
colorDiv.appendChild(sliderB);

function updateColor() {
    currColor.r = parseInt(sliderR.value);
    currColor.g = parseInt(sliderG.value);
    currColor.b = parseInt(sliderB.value);
}

app.appendChild(colorDiv);
