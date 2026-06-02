const display = document.querySelector("#display")
const expressionEl = document.querySelector("#expression")
const buttons = document.querySelectorAll(".box button")
const historyList = document.querySelector("#history-list")
const clearHistoryBtn = document.querySelector("#clear-history")

const MAX_HISTORY = 25
const OPERATORS = ["+", "-", "*", "/"]

let firstNumber = null
let operator = null
let currentNumber = ""
let freshResult = false

function isOperator(value) {
    return OPERATORS.includes(value)
}

function formatNumber(value) {
    if (typeof value === "string") return value
    if (!Number.isFinite(value)) return "Error"

    const n = Number(value)
    if (Number.isInteger(n)) return String(n)

    return parseFloat(n.toFixed(10)).toString()
}

function updateDisplay(value) {
    display.textContent = formatNumber(value)
}

function updateExpression(text = "") {
    expressionEl.textContent = text
}

function refreshUI() {
    if (display.textContent === "Error") return

    if (operator !== null && firstNumber !== null) {
        updateExpression(`${formatNumber(firstNumber)} ${operator}`)
    } else {
        updateExpression("")
    }

    if (currentNumber !== "") {
        updateDisplay(currentNumber)
    } else if (firstNumber !== null && operator !== null) {
        updateDisplay(firstNumber)
    } else {
        updateDisplay("0")
    }
}

function resetAfterError() {
    if (display.textContent !== "Error") return false
    clearAll()
    return true
}

function clearAll() {
    firstNumber = null
    operator = null
    currentNumber = ""
    freshResult = false
    updateExpression("")
    updateDisplay("0")
}

function backspace() {
    if (display.textContent === "Error") {
        clearAll()
        return
    }

    currentNumber = currentNumber.slice(0, -1)
    refreshUI()
}

function trimHistory() {
    while (historyList.children.length > MAX_HISTORY) {
        historyList.removeChild(historyList.lastElementChild)
    }
}

function addHistory(text) {
    const empty = historyList.querySelector(".history-empty")
    if (empty) empty.remove()

    const li = document.createElement("li")
    li.textContent = text
    historyList.prepend(li)
    trimHistory()
}

function clearHistory() {
    historyList.replaceChildren()
    const empty = document.createElement("li")
    empty.className = "history-empty"
    empty.textContent = "No calculations yet"
    historyList.append(empty)
}

function calculate() {
    if (operator === null || currentNumber === "") return

    const secondNumber = Number(currentNumber)
    let result

    switch (operator) {
        case "+":
            result = firstNumber + secondNumber
            break
        case "-":
            result = firstNumber - secondNumber
            break
        case "*":
            result = firstNumber * secondNumber
            break
        case "/":
            if (secondNumber === 0) {
                updateExpression("")
                updateDisplay("Error")
                firstNumber = null
                operator = null
                currentNumber = ""
                freshResult = false
                return
            }
            result = firstNumber / secondNumber
            break
    }

    const entry = `${formatNumber(firstNumber)} ${operator} ${formatNumber(secondNumber)} = ${formatNumber(result)}`
    addHistory(entry)

    currentNumber = formatNumber(result)
    firstNumber = null
    operator = null
    freshResult = true
    updateExpression("")
    updateDisplay(currentNumber)
}

function handleInput(value) {
    if (value !== "C" && resetAfterError()) {
        if (isOperator(value) || value === "=" || value === "backspace") {
            return
        }
    }

    if (value === "C") {
        clearAll()
        return
    }

    if (value === "backspace") {
        backspace()
        return
    }

    if (value === "=") {
        calculate()
        return
    }

    if (isOperator(value)) {
        if (currentNumber === "" && firstNumber === null) return

        if (currentNumber !== "") {
            firstNumber = Number(currentNumber)
        }

        operator = value
        currentNumber = ""
        freshResult = false
        refreshUI()
        return
    }

    if (freshResult) {
        currentNumber = ""
        freshResult = false
    }

    if (value === ".") {
        if (currentNumber.includes(".")) return
        if (currentNumber === "") currentNumber = "0"
    }

    currentNumber += value
    refreshUI()
}

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        const value = button.dataset.value ?? button.textContent.trim()
        handleInput(value)
    })
})

clearHistoryBtn.addEventListener("click", clearHistory)

document.addEventListener("keydown", (e) => {
    const key = e.key
    let handled = false

    if (/[0-9]/.test(key)) {
        handleInput(key)
        handled = true
    } else if (key === ".") {
        handleInput(key)
        handled = true
    } else if (isOperator(key)) {
        handleInput(key)
        handled = true
    } else if (key === "Enter" || key === "=") {
        handleInput("=")
        handled = true
    } else if (key === "Backspace" || key === "Delete") {
        handleInput("backspace")
        handled = true
    } else if (key === "Escape" || key.toLowerCase() === "c") {
        handleInput("C")
        handled = true
    }

    if (handled) e.preventDefault()
})

clearHistory()
