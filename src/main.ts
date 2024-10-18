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

//cursor object is replaced with the Tool object
class Tool {
    static xpos: number;
    static ypos: number;
    static active: boolean = false;
    static thickness: MARKER_SIZE = MARKER_SIZE.Thin;
    static drawEmojis: boolean = false;
    static currentEmoji: string;
    static draw(ctx: CanvasRenderingContext2D) {
        if (!this.drawEmojis) {
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
        } else {
            ctx.beginPath();
            ctx.fillText(this.currentEmoji, this.xpos, this.ypos);
        }
    }
    static thinMode() {
        this.thickness = MARKER_SIZE.Thin;
        this.drawEmojis = false;
    }
    static thickMode() {
        this.thickness = MARKER_SIZE.Thick;
        this.drawEmojis = false;
    }
    static set emojiMode(_emoji: string) {
        this.drawEmojis = true;
        this.currentEmoji = _emoji;
    }
}

//define the data structure we're using to store points
class Coord {
    static lines: Coord[] = [];
    static redoLines: Coord[] = [];
    static currLine: Coord;
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

class Emoji {
    static currEmoji: Emoji;
    static placedEmotes: Emoji[] = [];
    x: number;
    y: number;
    emoticon: string;
    constructor(_x: number, _y: number, _emoticon: string) {
        this.x = _x;
        this.y = _y;
        this.emoticon = _emoticon;
        Emoji.placedEmotes.push(this);
        Emoji.currEmoji = this;
    }
    display(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.fillText(this.emoticon, this.x, this.y);
    }
    move(_newX: number, _newY: number) {
        this.x = _newX;
        this.y = _newY;
    }
}

//when mouse is pressed, start active drawing
mainCanvas.addEventListener("mousedown", (e) => {
    Tool.active = true;
    Tool.xpos = e.offsetX;
    Tool.ypos = e.offsetY;

    if (!Tool.drawEmojis) {
        //initialize current line with a starting point
        Coord.currLine = new Coord(Tool.xpos, Tool.ypos, currSize);
        //push to list of all lines & reset redos
        Coord.lines.push(Coord.currLine);
        Coord.redoLines.splice(0, Coord.redoLines.length);
    } else {
        new Emoji(Tool.xpos, Tool.ypos, Tool.currentEmoji);
    }
});

//if mouse is active and moving, draw at its position
mainCanvas.addEventListener("mousemove", (e) => {
    Tool.xpos = e.offsetX;
    Tool.ypos = e.offsetY;
    mainCanvas.dispatchEvent(toolMoved);
    if (Tool.active) {
        if (!Tool.drawEmojis) {
            Coord.currLine.extend(Tool.xpos, Tool.ypos);
        } else {
            Emoji.currEmoji.move(Tool.xpos, Tool.ypos);
        }
    }
    mainCanvas.dispatchEvent(drawChanged);
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
    Emoji.placedEmotes.forEach((element) => {
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
    Emoji.placedEmotes.splice(0, Emoji.placedEmotes.length)
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
    Tool.thinMode();
    mainCanvas.dispatchEvent(buttonClear);
    thinButton.setAttribute("class", "selected-tool");
});
markerHolder.appendChild(thinButton);
//thick line
const thickButton = document.createElement("button");
thickButton.innerText = "Thick Marker";
thickButton.addEventListener("click", () => {
    currSize = MARKER_SIZE.Thick;
    Tool.thickMode();
    mainCanvas.dispatchEvent(buttonClear);
    thickButton.setAttribute("class", "selected-tool");
});
markerHolder.appendChild(thickButton);

app.appendChild(markerHolder);

//emoji buttons
const emojiSection = document.createElement("div");
//do clear, undo, redo buttons
//clear
const emote1 = document.createElement("button");
emojiSection.appendChild(emote1);
emote1.innerText = "✨";
emote1.addEventListener("click", (event) => emojiCallback(emote1));

const emote2 = document.createElement("button");
emojiSection.appendChild(emote2);
emote2.innerText = "💀";
emote2.addEventListener("click", (event) => emojiCallback(emote2));

const emote3 = document.createElement("button");
emojiSection.appendChild(emote3);
emote3.innerText = "👍";
emote3.addEventListener("click", (event) => emojiCallback(emote3));
app.appendChild(emojiSection);

function emojiCallback(_theButton: HTMLButtonElement) {
    mainCanvas.dispatchEvent(buttonClear);
    _theButton.setAttribute("class", "selected-tool");
    mainCanvas.dispatchEvent(toolMoved);
    Tool.emojiMode = _theButton.innerText;
}
