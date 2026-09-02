

math.config({
  number: 'BigNumber',
  precision: 64
}) 

function makeGood(x) {
        const bn = math.bignumber(x) 
        const eps = math.bignumber('1e-30') 
        return math.smaller(math.abs(bn), eps) ? math.bignumber(0) : bn 
}

function doMath(mathToDo) {
    mathToDo = mathToDo.replaceAll(' ', '')
    mathToDo = mathToDo.replaceAll('mod', '%')
    mathToDo = mathToDo.replaceAll('√', 'sqrt')
    mathToDo = mathToDo.replaceAll('π', 'pi')
    return mathToDo
}

export function getEquationTypeFromInput(equation) {

    var eq = equation

    if(!(typeof equation === 'string')) {
        return "invalid"
    }

    if (eq.includes("text") == false) {
        for (var i = 0; i < eq.length; i++) {
            if (eq[i] === ' ') {
                eq = eq.slice(0, i) + eq.slice(i + 1) 
                i-- 
            }
        }
    }

    if(eq.includes("text(")){
        let content = eq.substring(5, eq.indexOf(")"))
        content = content.split(",")
        if (eq.indexOf(")") == -1) {
            return "invalid"
        }

        else {
            return ["text", content[0], [content[1], content[2]], content[3], content[4]]
        }

    }

    if(eq.includes("shape(")) {
        let thePoints = eq.substring(6, eq.indexOf(")"))
        //alert(thePoints)
        let bruh = []
        let startOfAPoint = 0
        let endOfAPoint = 0
        for(let j = 0; j < thePoints.length; j++) {
            if(thePoints.substring(j, j + 1) == "[") {
                startOfAPoint = j
            }

            if(thePoints.substring(j, j + 1) == "]") {
                endOfAPoint = j
                let theStuffBetween = thePoints.substring(startOfAPoint +  1, endOfAPoint)
                let thePoint = theStuffBetween.split(",")
                bruh.push(Array(thePoint[0], thePoint[1]))
                
            }

        }
          
        return ["shape", bruh]
    }

    if(eq.includes("square")) {
        return ["square"]
    }

    if(eq.includes("rtriangle")) {
        return ["rtriangle"]
    }

    if(eq.includes("diamond")) {
        return ["diamond"]
    }2


    try {
        var points = eq.split(",")
        if (points.length == 2) {

            var x = makeGood(math.evaluate(doMath(points[0])))
            var y = makeGood(math.evaluate(doMath(points[1])))
            
            return ['point', x, y]
        }
    }

    catch {

    }

    if (eq.includes('=')) {

        var eqSplit = eq.split('=')  

        if (eqSplit.length > 2) { return 'invalid'  }

        var containsY = eq.includes("y")
        var containsX = eq.includes("x")

        if(!containsX && !containsY) { return 'invalid'}
        if((eqSplit[0].includes("y") && eqSplit[1].includes("y")) || (eqSplit[0].includes("x") && eqSplit[1].includes("x"))) { 
            return "invalid (for now)"
        }

        var sideWithX = null
        var sideWithY = null
        var sideWithNoX = null
        var sideWithNoY = null
        
        if(containsX) {
            if(eqSplit[0].includes("x")) {sideWithX = eqSplit[0]; sideWithNoX = eqSplit[1]}
            else if(eqSplit[1].includes("x")) {sideWithX = eqSplit[1]; sideWithNoX = eqSplit[0]}
        }

        if(containsY) {
            if(eqSplit[0].includes("y")) {sideWithY = eqSplit[0]; sideWithNoY = eqSplit[1]}
            else if(eqSplit[1].includes("y")) {sideWithY = eqSplit[1]; sideWithNoY = eqSplit[0]}
        }

        if(sideWithX == sideWithY) {
            return ["STOSS", sideWithX, sideWithNoX]
        }

        else {
            if(containsY && containsX) {
                return ["LSFY", sideWithY, sideWithX]
            }

            else if(containsY) {
                return ["LSFY", sideWithY, sideWithNoY]
            }

            else if(containsX) {
                return ["LSFX", sideWithX, sideWithNoX]
            }
     
        }
    }
}