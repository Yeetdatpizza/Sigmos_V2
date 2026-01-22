math.config({
  number: 'BigNumber',
  precision: 64
});
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
    const e = document.getElementById('e')
    const pi = document.getElementById('pi')
    const sin = document.getElementById('sin')
    const cos = document.getElementById('cos')
    const tan = document.getElementById('tan')
    const asin = document.getElementById('asin')
    const acos = document.getElementById('acos')
    const atan = document.getElementById('atan')
    const log = document.getElementById('log')
    const ln = document.getElementById('ln')
    const mathInput = document.getElementById('math')

    let previousAnswer = localStorage.getItem('PreviousAnswer')

    mathInput.setAttribute("placeholder", previousAnswer ? "Previous Answer: " + previousAnswer : "0")

    function setPreviousAnswer(answer) {

        if (answer !== null) {

            if(answer.toString() == "Infinity" || answer.toString() == "-Infinity") {
                alert("BOII I AIN\'T DOIN TS!")
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

        mathToDo = mathToDo.replaceAll(' ', '')
        mathToDo = mathToDo.replaceAll('mod', '%')
        mathToDo = mathToDo.replaceAll('^', '**')
        mathToDo = mathToDo.replaceAll('√', 'sqrt')
        mathToDo = mathToDo.replaceAll('π', 'pi')

        console.log(mathToDo)
        return mathToDo
    
    }

    function makeGood(x) {
        const bn = math.bignumber(x);
        const eps = math.bignumber('1e-30');
        return math.smaller(math.abs(bn), eps) ? math.bignumber(0) : bn;
}

    if (clear) clear.addEventListener('click', () => {
        mathInput.value = ''
        mathInput.setAttribute("placeholder", previousAnswer ? "Previous Answer: " + previousAnswer : "0")
    })

    for (const button of [one, two, three, four, five, six, seven, eight, nine, zero, decimal, plus, minus, log, mod, leftParen, rightParen, e, pi, power]) {
        if (button) button.addEventListener('click', () => {
            mathInput.value += button.innerText
        })
    }

    for(const funcButton of [sin, cos, tan, asin, acos, atan, ln]) {
        if (funcButton) funcButton.addEventListener('click', () => {
            mathInput.value += funcButton.innerText + '('
        })
    }

    if (equal) equal.addEventListener('click', () => {

        try {
            const result = makeGood(math.evaluate(doMath(mathInput.value))).toString()
            checkForTuff(result)
            setPreviousAnswer(result)
        }
        
        catch (error) {
            console.log(doMath(mathInput.value))
            console.log(error)
            alert("BOII TS BROKEN!")
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
   
    if (sqrt) sqrt.addEventListener('click', () => {
        mathInput.value += '√('
    })

    if (times) times.addEventListener('click', () => {
        mathInput.value += '*'
    })

    if (division) division.addEventListener('click', () => {
        mathInput.value += '/'
    })

})