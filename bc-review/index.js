let termBox = document.getElementById("term-box");
let definitionBox = document.getElementById("definition-box");
let inputBox = document.getElementById("input-box");
let renderedBox = document.getElementById("rendered-box");

let showAnswerButton = document.getElementById("show-answer-button")
let correctButton = document.getElementById("correct-button");
let incorrectButton = document.getElementById("incorrect-button");
let skipButton = document.getElementById("skip-button");
let downloadButton = document.getElementById("download-button");
let uploadButton = document.getElementById("upload-button");
let fileChooser = document.getElementById("fileChooser");

let unitCircleCheckbox = document.getElementById("unit-circle-checkbox");
let derivativesCheckbox = document.getElementById("derivatives-checkbox");
let integralsCheckbox = document.getElementById("integrals-checkbox");
let seriesCheckbox = document.getElementById("series-checkbox");

showAnswerButton.onclick = showAnswer;
correctButton.onclick = correct;
incorrectButton.onclick = incorrect;
skipButton.onclick = nextTerm;
downloadButton.onclick = createFile;
uploadButton.onclick = () => { fileChooser.click() };
fileChooser.onchange = loadData;

let renderedBoxMath;
let termBoxMath;
let definitionBoxMath;

let currentTerm;

let dataDownloaded = true;

function onMathJaxLoad() {
    termBoxMath = MathJax.Hub.getAllJax(termBox)[0];
    definitionBoxMath = MathJax.Hub.getAllJax(definitionBox)[0];
    renderedBoxMath = MathJax.Hub.getAllJax(renderedBox)[0];

    nextTerm();
    inputBox.addEventListener("input", renderUserInput);
}


function renderUserInput() {
    MathJax.Hub.Queue(["Text", renderedBoxMath, inputBox.value]);
}

function nextTerm() {
    renderedBox.parentElement.style.background = "";
    inputBox.value = "";
    renderUserInput();

    insertionSort(terms);
    
    if(!(unitCircleCheckbox.checked || derivativesCheckbox.checked || integralsCheckbox.checked || seriesCheckbox.checked)) {
        MathJax.Hub.Queue(["Text", termBoxMath, "\"No Units Selected\""]);
        MathJax.Hub.Queue(["Text", definitionBoxMath, ""]);
        return;
    }
    
    let nextIndex = 0;
    do {
        nextIndex = Math.floor(distributionFunc(Math.random()) * terms.length);
    } while (!validTerm(terms[nextIndex]) || terms[nextIndex] == currentTerm)

    currentTerm = terms[nextIndex];
    MathJax.Hub.Queue(["Text", termBoxMath, currentTerm.term]);
    MathJax.Hub.Queue(["Text", definitionBoxMath, ""]);
}

function distributionFunc(num) {
    return 0.5*num*num*num + 0.5*num;
}

function insertionSort(arr) { 
    let i, key, j;
    let n = arr.length;
    for (i = 1; i < n; i++)
    { 
        key = arr[i];
        keyScore = key.correct * 2 + key.incorrect;
        j = i - 1; 
   
        /* Move elements of arr[0..i-1], that are 
        greater than key, to one position ahead 
        of their current position */
        while (j >= 0 && (arr[j].correct * 2 + arr[j].incorrect) > keyScore)
        {
            arr[j + 1] = arr[j]; 
            j = j - 1; 
        }
        arr[j + 1] = key; 
    } 
} 

function validTerm(term) {
    if (term.unit == "unit-circle" && !unitCircleCheckbox.checked)
        return false;
    if (term.unit == "derivatives" && !derivativesCheckbox.checked)
        return false;
    if (term.unit == "integrals" && !integralsCheckbox.checked)
        return false;
    if (term.unit == "series" && !seriesCheckbox.checked)
        return false;

    return true;
}

function showAnswer() {
    checkAnswer();
    MathJax.Hub.Queue(["Text", definitionBoxMath, currentTerm.definition]);
}

function checkAnswer() {
    let input = inputBox.value;
    if (input.length == 0)
        return;

    if (input.replaceAll(" ", "") == currentTerm.definition.replaceAll(" ", "")) {
        MathJax.Hub.Queue(["Text", renderedBoxMath, "color(lightgreen)(" + inputBox.value + ")"]);
        renderedBox.parentElement.style.background = "forestgreen";
        return;
    }
    MathJax.Hub.Queue(["Text", renderedBoxMath, "color(red)(" + inputBox.value + ")"]);
}

function correct() {
    dataDownloaded = false;
    currentTerm.correct++;
    nextTerm();
}

function incorrect() {
    dataDownloaded = false;
    currentTerm.incorrect++;
    nextTerm();
}

function loadData() {
    const file = fileChooser.files[0];
    const reader = new FileReader();

    reader.addEventListener(
        "load",
        () => {
            let userData = JSON.parse(reader.result);

            for (let i = 0; i < terms.length; i++) {
                for (let j = 0; j < userData.length; j++) {
                    if (terms[i].term == userData[j].term) {
                        terms[i].correct += userData[j].correct;
                        terms[i].incorrect += userData[j].incorrect;
                        break;
                    }
                }
            }
            nextTerm();
            console.log("Data Loaded", userData, terms);
        },
        false
    );

    if (file) {
        reader.readAsText(file);
    }
}

function createFile() {
    dataDownloaded = true;
    //create or obtain the file's content
    var content = JSON.stringify(terms);

    //create a file and put the content, name and type
    var file = new File(["\ufeff" + content], 'bc-review-data.json', { type: "text/plain:charset=UTF-8" });

    //create a ObjectURL in order to download the created file
    url = window.URL.createObjectURL(file);

    //create a hidden link and set the href and click it
    var a = document.createElement("a");
    a.style = "display: none";
    a.href = url;
    a.download = file.name;
    a.click();
    window.URL.revokeObjectURL(url);
}

const beforeUnloadListener = (event) => {
    if(dataDownloaded)
        return;
    event.preventDefault();
    event.returnValue = '';
}

window.addEventListener("beforeunload", beforeUnloadListener, { capture: true });