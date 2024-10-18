import "./style.css";

const APP_NAME = "Sticker Sketchpad aleghart";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

enum MARKER_SIZE {
    Thin = 1,
    Thick = 5,
}
let currSize: MARKER_SIZE = MARKER_SIZE.Thin;

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

class Tool {
    static xpos: number;
    static ypos: number;
    static active: boolean = false;
    static thickness: MARKER_SIZE = MARKER_SIZE.Thin;
    static draw(ctx: CanvasRenderingContext2D) {
        ctx.lineWidth = this.thickness;
        ctx.beginPath();
        ctx.ellipse(
            this.xpos,
            this.ypos,
            this.thickness,
            this.thickness,
            0,
            0,
            360
        );
        ctx.stroke();
    }
}

//define the data structure we're using to store points
class Coord {
    static lines: Coord[] = [];
    static redoLines: Coord[] = [];
    x: number[] = [];
    y: number[] = [];
    thickness: MARKER_SIZE;
    constructor(_x: number, _y: number, _thicc: MARKER_SIZE) {
        this.x.push(_x);
        this.y.push(_y);
        this.thickness = _thicc;
    }
    public display(ctx: CanvasRenderingContext2D) {
        if (this.x.length != this.y.length) {
            throw "Coord: display(): x and y coord array lengths are not the same.";
            return -1;
        }
        ctx.lineWidth = this.thickness;
        ctx.beginPath();
        ctx.moveTo(this.x[0], this.y[0]);
        for (let i = 0; i < this.x.length; i++) {
            ctx.lineTo(this.x[i], this.y[i]);
        }
        ctx.stroke();
    }
    public extend(_x: number, _y: number) {
        this.x.push(_x);
        this.y.push(_y);
    }
}
//a line is an array of coordinates. a list of lines makes up our lines and redolines

//set the current line to be empty
let currLine: Coord;

//when mouse is pressed, start active drawing
mainCanvas.addEventListener("mousedown", (e) => {
    Tool.active = true;
    Tool.xpos = e.offsetX;
    Tool.ypos = e.offsetY;

    //initialize current line with a starting point
    currLine = new Coord(Tool.xpos, Tool.ypos, currSize);
    //push to list of all lines & reset redos
    Coord.lines.push(currLine);
    Coord.redoLines.splice(0, Coord.redoLines.length);

    //no longer need o call dispach on mousedown only mousemove
});

//if mouse is active and moving, draw at its position
mainCanvas.addEventListener("mousemove", (e) => {
    Tool.xpos = e.offsetX;
    Tool.ypos = e.offsetY;
    mainCanvas.dispatchEvent(toolMoved);
    if (Tool.active) {
        currLine.extend(Tool.xpos, Tool.ypos);
    }
    mainCanvas.dispatchEvent(drawChanged);

    //call toolMoved after the drawChanged - that way canvas has been cleared.
});

//stop drawing on mouseup
mainCanvas.addEventListener("mouseup", (e) => {
    Tool.active = false;
    //currLine = undefined;
    mainCanvas.dispatchEvent(drawChanged);
});

//canvas dispatch event
const drawChanged = new Event("drawing-changed");

mainCanvas.addEventListener("drawing-changed", (e) => {
    canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    if (!Tool.active) {
        Tool.draw(canvasContext);
    }
    Coord.lines.forEach((element) => {
        element.display(canvasContext);
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
    Coord.lines.splice(0, Coord.lines.length);
    Coord.redoLines.splice(0, Coord.redoLines.length);

    mainCanvas.dispatchEvent(drawChanged);
});

//undo
const undoButton = document.createElement("button");
buttonSection.appendChild(undoButton);
undoButton.innerText = "UNDO";
undoButton.addEventListener("click", () => {
    canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    let tmp = Coord.lines.pop();
    if (typeof tmp == "object") {
        Coord.redoLines.push(tmp);
    }
    mainCanvas.dispatchEvent(drawChanged);
});

//redo
const redoButton = document.createElement("button");
buttonSection.appendChild(redoButton);
redoButton.innerText = "REDO";
redoButton.addEventListener("click", () => {
    canvasContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    let tmp = Coord.redoLines.pop();
    if (typeof tmp == "object") {
        Coord.lines.push(tmp);
    }
    mainCanvas.dispatchEvent(drawChanged);
});
buttonSection.appendChild(redoButton);
app.appendChild(buttonSection);

//line button holder
const markerHolder = document.createElement("div");

//thin line
const thinButton = document.createElement("button");
thinButton.setAttribute("class", "selected-tool");
thinButton.innerText = "Thin Marker";
thinButton.addEventListener("click", () => {
    currSize = MARKER_SIZE.Thin;
    Tool.thickness = MARKER_SIZE.Thin;
    thinButton.setAttribute("class", "selected-tool");
    thickButton.setAttribute("class", "");
});
markerHolder.appendChild(thinButton);
//thick line
const thickButton = document.createElement("button");
thickButton.innerText = "Thick Marker";
thickButton.addEventListener("click", () => {
    currSize = MARKER_SIZE.Thick;
    Tool.thickness = MARKER_SIZE.Thick;
    thickButton.setAttribute("class", "selected-tool");
    thinButton.setAttribute("class", "");
});
markerHolder.appendChild(thickButton);

app.appendChild(markerHolder);
