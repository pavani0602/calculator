const buttons = document.querySelectorAll(".btn-container button");
const mainScreen = document.querySelector(".main-screen");
const smallScreen = document.querySelector(".small-screen");
const historyBtn = document.querySelector("#history-btn");
const historyPanel = document.querySelector("#history-panel");
const historyList = document.querySelector("#history-list");
const clearHistoryBtn = document.querySelector("#clear-history");
const closeHistoryBtn = document.querySelector("#close-history");

let currentInput = "";
let previousInput = "";
//shouldResetScreen tells the calculator whether the next number typed should clear the screen or append to the current digits.
let shouldResetScreen = false; 
let operator = "";
// let history = [];

//load history when page opens
let history = JSON.parse(
    localStorage.getItem("calculatorHistory")
) || [];

renderHistory();

historyBtn.addEventListener("click", () => {
    historyPanel.classList.toggle("show")
});

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
        history = [];
        localStorage.removeItem("calculatorHistory");
        renderHistory();
    });
}

if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener("click", () => {
        historyPanel.classList.remove("show");
    });
}

function renderHistory() {
    historyList.innerHTML = "";
    history.slice().reverse().forEach(item => {
        const div = document.createElement("div");
        div.innerText = item;
        historyList.appendChild(div);
    });
}

function displayResult(result, expression) {
    smallScreen.innerText = expression;
    mainScreen.innerText = result;
    currentInput = result.toString();
    shouldResetScreen = true;
}

function addToHistory(entry){
    history.push(entry);
    //saving history for history persistence.
    if(history.length > 20){
        history.shift();
    }
    localStorage.setItem("calculatorHistory", JSON.stringify(history));
    renderHistory();
}

function handleInput(value) {
    value=value.trim();
    // This strips out any hidden line breaks or white spaces completely!
    value = value.replace(/\s+/g, ''); 

    //to reset screen to type a new num after clicking =.
    if (shouldResetScreen && ("0123456789.πe".includes(value))) {
        currentInput = "";
        shouldResetScreen = false;
    }

    if ("0123456789".includes(value)) {
        currentInput += value;
        mainScreen.innerText = currentInput;
    }
    if (["+", "-", "*", "÷", "xy"].includes(value)) {
        if (currentInput === "") {
            currentInput = mainScreen.innerText;
        }
        if (currentInput === "Error") return;
        if (previousInput !== "" && operator !== "" && currentInput !== "") {
            let num1 = Number(previousInput);
            let num2 = Number(currentInput);
            let intermediaryResult=calculate(num1, num2, operator);
        if (intermediaryResult === "Error" || isNaN(intermediaryResult)) {
            mainScreen.innerText = "Error";
            currentInput = "";
            previousInput = "";
            operator = "";
            return;
        }
        // Push the result forward as the new base for the next operation
        previousInput = intermediaryResult.toString();
        } 
        else {
            // If there's no pending operation, set up the base normally
            previousInput = currentInput;
        }
        operator = value;
        // Show a (^) in the top screen for readability
        let displayOperator = operator === "xy" ? "^" : operator;
        smallScreen.innerText = `${previousInput} ${displayOperator} `;
        currentInput = "";
        mainScreen.innerText = "0";
        shouldResetScreen = false;
    }
    if(value === "CE") {
        currentInput = "";
        mainScreen.innerText = "0";
    }
    if(value === "C") {
        currentInput = "";
        previousInput = "";
        operator = "";
        mainScreen.innerText = "0";
        smallScreen.innerText = "";
        shouldResetScreen=false;
    }
    if (value === "=") {
        if (!operator || currentInput === "") return;
        let num1 = Number(previousInput);
        let num2 = Number(currentInput);
        let result=calculate(num1, num2, operator);
        let displayOperator = operator === "xy" ? "^" : operator;
        addToHistory(`${num1} ${displayOperator} ${num2} = ${result}`);
        previousInput = ""; 
        operator = "";
        displayResult(result, `${num1} ${displayOperator} ${num2} =`);
    }        
    if (value === ".") {
        if (!currentInput.includes(".")) {
            currentInput += ".";
            mainScreen.innerText = currentInput;
        }
    }    
    if(value === "⌫") {
        currentInput = currentInput.slice(0,-1);
            if(currentInput==="") {
                mainScreen.innerText = "0";
            }
            else {
                mainScreen.innerText = currentInput;
            }
    }    
    if(value==="%") {
        let num = Number(mainScreen.innerText);
        let result = 0;
        if (previousInput !== "" && operator !== "") {
            // x % of y, y is base number
            // the flow goes like y * x % ,(x percent of y => (x/100)*y)
            let baseNum = Number(previousInput);
            result = baseNum * (num / 100);
        } else {
            // if no operation is queued, just get num/100.
            // this is x
            result = num / 100;
        }
        addToHistory(`${num}% = ${result}`);
        displayResult(result, " ");
        //if you press "=" , after %, you mean to do x*(x% of y).
    }
    if(value === "1/x") {
        let num = Number(mainScreen.innerText);
        if(num === 0) {
            mainScreen.innerText = "Error";
            currentInput = "";
            return;
        }
        let result = 1 / num;
        addToHistory(`1/(${num}) = ${result}`);
        displayResult(result, `1/(${num})`);
    }
    if(value==="x²") {
        let num=Number(mainScreen.innerText);
        if(num==0) {
            mainScreen.innerText="0";
            smallScreen.innerText="sqr(0)";
            currentInput = "0";
            return;
        }
        let result = num*num;
        addToHistory(`sqr(${num}) = ${result}`);
        displayResult(result, `sqr(${num})`);
    }
    if(value==="²√x"){
        let num=Number(mainScreen.innerText);
        if (num < 0) {
            mainScreen.innerText = "Error";
            smallScreen.innerText = `√(${num})`;
            currentInput = "";
            shouldResetScreen = true;
            return;
        }
        if(num==0) {
            mainScreen.innerText="0";
            smallScreen.innerText="√(0)";
            currentInput = "0";
            return;
        }
        let result = Math.sqrt(num);
        addToHistory(`√(${num}) = ${result}`);
        displayResult(result, `√(${num})`);
    }
    if (value === "x!") {
        let num = Number(mainScreen.innerText);
        if (num > 170) {
            mainScreen.innerText = "Invalid Input";
            smallScreen.innerText = `fact(${num})`;
            currentInput = "";
            shouldResetScreen = true;
            return;
        }
        let result = calculateFactorial(num);
        addToHistory(`fact(${num}) = ${result}`);
        displayResult(result, `fact(${num})`);
    }
    if (value === "π") {
        currentInput = Math.PI.toString();
        mainScreen.innerText = currentInput;
        shouldResetScreen = true;
    }    
    if (value === "e") {
        currentInput = Math.E.toString();
        mainScreen.innerText = currentInput;
        shouldResetScreen = true;
    }
    if (value === "+/-") {
        let num = Number(mainScreen.innerText);
        if (num === 0 || mainScreen.innerText === "Error") return;            
            let result = num * -1;
            mainScreen.innerText = result;
            currentInput = result.toString();
        }
}


buttons.forEach((button) => {
    button.addEventListener("click", () => {
        handleInput(button.textContent);
    });
});

const validKeys = [
    "0","1","2","3","4","5","6","7","8","9",
    "+","-","*","÷",".","=","⌫","C","xy","%"
];


document.addEventListener("keydown", (event) => {
    let value = event.key;
    
    if (event.ctrlKey || event.metaKey || event.altKey || value === "F5") return;
    
    event.preventDefault();

    if (value === "/") value = "÷";
    if (value === "Enter") value = "=";
    if (value === "Backspace") value = "⌫";
    if (value === "Escape") value = "C";
    if (value === "^") value = "xy";


    if (!validKeys.includes(value)) return;
    
    handleInput(value);
});

function calculateFactorial(n) {
    if (n < 0 || !Number.isInteger(n)) return "Error";
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function calculate(num1, num2, operator) {
    switch(operator) {
        case "+": return num1 + num2;
        case "-": return num1 - num2;
        case "*": return num1 * num2;
        case "÷": return num2 !== 0 ? num1 / num2 : "Error";
        case "xy": 
            let powerResult = Math.pow(num1, num2);
            if (isNaN(powerResult)) {
                return "Error";
            }
            return powerResult;
        default: return "Error";
    }
}