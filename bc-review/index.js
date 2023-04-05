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
    inputBox.style.color = "black";
    inputBox.value = "";
    renderUserInput();

    let nextIndex = -1;
    for(let i = 0; i < terms.length; i++) {
        let attemptedIndex = Math.floor(Math.random() * terms.length);
        if(validTerm(terms[attemptedIndex])) {
            nextIndex = attemptedIndex;
            break;
        }
    }

    if(nextIndex == -1) {
        MathJax.Hub.Queue(["Text", termBoxMath, ""]);
        MathJax.Hub.Queue(["Text", definitionBoxMath, ""]);
        return;
    }
        
    currentTerm = terms[nextIndex];
    console.log(currentTerm.term);
    MathJax.Hub.Queue(["Text", termBoxMath, currentTerm.term]);
    MathJax.Hub.Queue(["Text", definitionBoxMath, ""]);
}

function validTerm(term) {
    if(term.unit == "unit circle" && !unitCircleCheckbox.checked)
        return false;
    if(term.unit == "derivatives" && !derivativesCheckbox.checked)
        return false;
    if(term.unit == "integrals" && !integralsCheckbox.checked)
        return false;
    if(term.unit == "series" && !seriesCheckbox.checked)
        return false;
    
    return true;
}

function showAnswer() {
    checkAnswer();
    MathJax.Hub.Queue(["Text", definitionBoxMath, currentTerm.definition]);
}

function checkAnswer() {
    let input = inputBox.value;
    if(input.length == 0)
        return;

    if(input.replaceAll(" ", "") == currentTerm.definition.replaceAll(" ", "")) {
        inputBox.style.color = "lime";
        MathJax.Hub.Queue(["Text", renderedBoxMath, "color(lime)(" + inputBox.value + ")"]);
        return;
    }
    MathJax.Hub.Queue(["Text", renderedBoxMath, "color(red)(" + inputBox.value + ")"]);
}

function correct() {
    currentTerm.correct++;
    nextTerm();
}

function incorrect() {
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
                        terms[i].correct = userData[j].correct;
                        terms[i].incorrect = userData[j].incorrect;
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