import "./style.css";

const APP_NAME = "Sticker Sketchpad aleghart";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;


//create title
const mainHeader = document.createElement("h1");
mainHeader.innerText = APP_NAME;
app.appendChild(mainHeader)

const mainCanvas = document.createElement("canvas");
mainCanvas.setAttribute("width", '256px');
mainCanvas.setAttribute("height", '256px');
app.appendChild(mainCanvas)
