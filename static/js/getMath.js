document.addEventListener('DOMContentLoaded', () => {

    const clear = document.getElementById('clear')
    const one = document.getElementById('one')
    const two = document.getElementById('two')
    const three = document.getElementById('three')
    const back = document.getElementById('back')
    const four = document.getElementById('four')
    const five = document.getElementById('five')
    const six = document.getElementById('six')
    const answer = document.getElementById('answer')
    const seven = document.getElementById('seven')
    const eight = document.getElementById('eight')
    const nine = document.getElementById('nine')
    const zero = document.getElementById('zero')
    const power = document.getElementById('power')
    const decimal = document.getElementById('decimal')
    const equal = document.getElementById('equal')
    const sqrt = document.getElementById('sqrt')
    const mod = document.getElementById('mod')
    const plus = document.getElementById('plus')
    const minus = document.getElementById('minus')
    const times = document.getElementById('times')
    const division = document.getElementById('division')
    const leftParen = document.getElementById('left-paren')
    const rightParen = document.getElementById('right-paren')

    const mathInput = document.getElementById('math')

    let previousAnswer = localStorage.getItem('PreviousAnswer')

    mathInput.setAttribute("placeholder", previousAnswer ? "Previous Answer: " + previousAnswer : "0")

    function setPreviousAnswer(answer) {
        if (answer !== null) {

            if(answer.toString() == "Infinity" || answer.toString() == "-Infinity") {
                answer = 'BOII I AIN\'T DOIN TS!'
            }

            localStorage.setItem('PreviousAnswer', answer)
            previousAnswer = answer
            mathInput.value = answer
            mathInput.setAttribute("placeholder", "Previous Answer: " + answer)
        }
    }

    function checkForTuff(thingToCheck) {

        thingToCheck = thingToCheck.toLowerCase()

        if (thingToCheck.includes("67")) {
            window.location.href = "static/videos/67.mp4"
        }
    }

    function doMath(mathToDo) {

        for(let i = 0; i < mathToDo.length; i++) {

            if(mathToDo[i] === '×') {
                mathToDo[i] = '*'
            }
            else if(mathToDo[i] === '÷') {
                mathToDo[i] = '/'
            }
            else if(mathToDo[i] === '√') {
                mathToDo[i] = 'Math.sqrt'
            }
            else if(mathToDo[i] === '^') {
                mathToDo[i] = '**'
            }

            else if(mathToDo[i + 1] === '(' && (/[0-9.]/).test(mathToDo[i])) {
                mathToDo = mathToDo.slice(0, i + 1).concat(['*']).concat(mathToDo.slice(i + 1))
                i++
            }

            else if(mathToDo[i - 1] === ')' && (/[0-9.]/).test(mathToDo[i])) {
                mathToDo = mathToDo.slice(0, i).concat(['*']).concat(mathToDo.slice(i))
                i++
            }

        }

        return mathToDo
    
    }

    if (clear) clear.addEventListener('click', () => {
        mathInput.value = ''
        mathInput.setAttribute("placeholder", previousAnswer ? "Previous Answer: " + previousAnswer : "0")
    })

    for (const button of [one, two, three, four, five, six, seven, eight, nine, zero, decimal, plus, minus, mod, leftParen, rightParen]) {
        if (button) button.addEventListener('click', () => {
            mathInput.value += button.innerText
        })
    }

    if (equal) equal.addEventListener('click', () => {

        checkForTuff(mathInput.value)

        try {
            const result = eval(doMath(mathInput.value)).toFixed(15).replace(/\.?0+$/, '')
            setPreviousAnswer(result)
        }
        
        catch (error) {

            console.log(doMath(mathInput.value))

            console.log(error)
            setPreviousAnswer("BOII TS BROKEN!")
        }
    })

    if (back) back.addEventListener('click', () => {
        mathInput.value = mathInput.value.slice(0, -1)
    })

    if (answer) answer.addEventListener('click', () => {
        if (previousAnswer !== null) {
            mathInput.value += previousAnswer
        }
    })

    if (power) power.addEventListener('click', () => {
        mathInput.value += '**' 
    })

    if (sqrt) sqrt.addEventListener('click', () => {
        mathInput.value += 'Math.sqrt('
    })

    if (times) times.addEventListener('click', () => {
        mathInput.value += '*'
    })

    if (division) division.addEventListener('click', () => {
        mathInput.value += '/'
    })
    

})