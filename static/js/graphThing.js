// Handles (mostly) all of the graphing logic, other stuff is handled by graphHelper.js

// Imports
import { getEquationTypeFromInput } from "./graphHelper.mjs"
import { startTheFight } from "./wyattBossFight.mjs"

// Basically fixes floating-point issues with JavaScript, via a library. 
math.config({number: 'number'})

// Varible to control if you are fighting Wyatt or if you are not.
var isFightingWyatt = false

// This holds the math inputs, the place where you actually type the equation you want to graph
var mathInputs = []
mathInputs.push(document.getElementById(`whatever_this_thing_is_called`))

// Converts an equation (string) to something JavaScript can understand.
function JSify(equation) {
    equation = equation.replaceAll(' ', '')
    equation = equation.replaceAll('mod', '%')
    equation = equation.replaceAll('√', 'sqrt')
    equation = equation.replaceAll('π', 'pi')
    equation = equation.replaceAll('phi', '(1 + sqrt(5)) / 2')
    return equation
}

// Holds the amount of inputs there currently are, deprecated, use mathInputs.length instead.
var amountOfInputs = 1

// How precise the graphing should be, only applies to point-slope equations, the lower the value, the more precise.
var precision = 0.01

// Runs once everything has loaded in.
document.addEventListener('DOMContentLoaded', () => {

    // Setting up the graph:
    const graph = document.getElementById("graphing-calc-canvas") 
    const ctx = graph.getContext('2d')
    const addNewItemButton = document.getElementById("add_new_item") 
    //----

    // Function to resize the graph
    function resizeGraphToParent() {
        const parent = graph.parentElement 
        const rect = parent.getBoundingClientRect()
        graph.width  = Math.floor(rect.width)
        graph.height = Math.floor(rect.height) 
        ctx.setTransform(1, 0, 0, 1, 0, 0) 
    }
    //----

    // Resize in case any major changes occured after the intial load.
    resizeGraphToParent() 

    // Bind the resize function to zoom and resize actions.
    window.addEventListener('resize', resizeGraphToParent()) 
    window.addEventListener('zoom', resizeGraphToParent()) 

    // Graph Configuration, most of these will be settings in the future.
    // These two are self-explanitory
    var width = graph.width 
    var height = graph.height
    
    // Ratio of x/y size
    const ratio = 3/2 

    // The base zoom level of the graph
    var zoomLevel = 10 

    // The width (in pixels) of each square
    var squareWidth = width / (zoomLevel * ratio) 

    // The height (in pixels) of each square
    var squareHeight = height / zoomLevel 

    // The amount of squares along the x-axis of the graph
    var amountOfSquaresX = width / squareWidth

    // The amount of squares along the y-axis of the graph
    var amountOfSquaresY = height / squareHeight

    // All of the available colors for graphing
    const listOfColors = [
        "rgb(26, 94, 220)", 
        "rgb(0, 255, 106)", 
        "rgb(220, 26, 26)", 
        "rgb(106, 0, 192)", 
        "rgb(255, 145, 0)", 
        "rgb(0, 0, 0)", 
        'rgb(255, 0, 212)', 
        'rgb(16, 250, 203)'
    ]

    // The offsets (in pixels), relative to graphs 0, 0 (the canvas center)
    var offsetX = 0
    var offsetY = 0

    // The real origin of the graph, accounting for offsets
    var realOriginX = width / 2 + offsetX 
    var realOriginY = height / 2 + offsetY 

    // Function to draw the grid
    function drawGrid(direction) {
        
        // The level of zoom the graph is at, the lower, the more zoomed in.
        zoomLevel = zoomLevel + direction 
        squareWidth = width / (zoomLevel * ratio) 
        squareHeight = height / zoomLevel 
        amountOfSquaresX = width / squareWidth 
        amountOfSquaresY = height / squareHeight 

        while (amountOfSquaresX % 2 != 0 || amountOfSquaresY % 2 != 0) {
            zoomLevel = zoomLevel + direction 
            squareWidth = width / (zoomLevel * ratio) 
            squareHeight = height / zoomLevel 
            amountOfSquaresX = width / squareWidth 
            amountOfSquaresY = height / squareHeight 
        }

        ctx.strokeStyle = '#000000' 
        ctx.lineWidth = 1 

        const startX = Math.floor((-offsetX) / squareWidth) 
        const endX = Math.ceil((width - offsetX) / squareWidth) 

        for (let x = startX; x <= endX; x++) {
            ctx.font = "10px Arial";
            ctx.textAlign = 'start'
            ctx.textBaseline = 'alphabetic'
            ctx.fillStyle = '#000000'
            ctx.fillText((x - amountOfSquaresX / 2).toString(), x * squareWidth + offsetX + 2, height / 2 + offsetY - 2) 
           
            const xPos = x * squareWidth + offsetX 
            ctx.beginPath() 
            ctx.moveTo(xPos, 0) 
            ctx.lineTo(xPos, height) 
            ctx.stroke() 
            ctx.lineWidth = 1
        }

        const startY = Math.floor((-offsetY) / squareHeight) 
        const endY = Math.ceil((height - offsetY) / squareHeight) 

        for (let y = startY; y <= endY; y++) {

            /*
            if(y % 4 == 0) {ctx.strokeStyle = '#000000'}
            else{ctx.strokeStyle = '#666666'}
            */

            ctx.fillStyle = '#000000' 
            ctx.fillText(-(y - amountOfSquaresY / 2).toString(), width / 2 + offsetX + 2, y * squareHeight + offsetY + 10) 

            const yPos = y * squareHeight + offsetY 
            ctx.beginPath() 
            ctx.strokeStyle = '#666666' 
            ctx.moveTo(0, yPos) 
            ctx.lineTo(width, yPos) 
            ctx.stroke() 
            ctx.lineWidth = 1 
        }

        ctx.lineWidth = 3 

        /*
        ctx.beginPath() 
        ctx.arc(realOriginX, realOriginY, squareWidth / 3, 0, 360) 
        ctx.strokeStyle = 'rgb(26, 94, 220)' 
        ctx.stroke() 
        */
        
        ctx.beginPath() 
        ctx.moveTo((width / 2) + (offsetX), 0) 
        ctx.lineTo((width / 2) + (offsetX), height) 
        ctx.strokeStyle = 'rgb(0, 0, 0)' 
        ctx.stroke() 

        ctx.beginPath() 
        ctx.moveTo(0, (height / 2) + (offsetY)) 
        ctx.lineTo(width, (height / 2) + (offsetY)) 
        ctx.strokeStyle = 'rgb(0, 0, 0)' 
        ctx.stroke() 

        ctx.lineWidth = 1 
    }

    // CONVERT THE STUPID SCREEN CORDS

    function convertToGraphCoords(x, y) {
        x = realOriginX + (x * squareWidth) 
        y = realOriginY - (y * squareHeight) 
        return [x, y] 
    }

    function convertToMathCoords(x, y) {
        x = (x - realOriginX) / squareWidth 
        y = (realOriginY - y) / squareHeight 
        return [x, y] 
    }

    // DRAW DOTS

    function plotPoint(x, y, i) {
        const realCords = convertToGraphCoords(x, y) 

        ctx.beginPath() 
        ctx.arc(realCords[0], realCords[1], squareWidth / 8, 0, 360) 
        ctx.lineWidth = 2 
        ctx.strokeStyle = listOfColors[i] 
        ctx.fillStyle = '#ffffff' 
        ctx.fill() 
        ctx.stroke() 

    }

    // REFRESH THE STUIPD GRAPH
    ctx.clearRect(0, 0, graph.width, graph.height) 

    function drawLine(x1, y1, x2, y2, i) {
        let startingCords = convertToGraphCoords(x1, y1) 
        let endingCords = convertToGraphCoords(x2, y2) 

        ctx.beginPath() 
        ctx.lineWidth = 3 
        ctx.moveTo(startingCords[0], startingCords[1]) 
        ctx.lineTo(endingCords[0], endingCords[1]) 
        ctx.strokeStyle = listOfColors[i] 
        ctx.stroke() 
    }
    
    function refreshGraph(direction = 0) {
        ctx.clearRect(0, 0, graph.width, graph.height) 
        drawGrid(direction) 
        itemCheck() 
    }

    refreshGraph(1) 

    function writeText(text, position, color, size) {
        ctx.font = `${(size * 20) / (zoomLevel - 9)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'center';
        ctx.fillStyle = color
        ctx.fillText(text, convertToGraphCoords(position[0], position[1])[0], convertToGraphCoords(position[0], position[1])[1]);
    }

    function drawShape(listOfPoints, size = 1, offsetOfX = 0, offsetOfY = 0 , theColor) {
        let amountOfPoints = listOfPoints.length

        if (amountOfPoints < 1) {
            return "invalid"
        }

        listOfPoints.push(listOfPoints[0])
        let lastPoint = []            
        let isFirst = true
        for(let i = 0; i <= listOfPoints.length - 1; i++) {
            
            let theX = (math.evaluate(JSify(listOfPoints[i][0])) * math.evaluate(JSify(size.toString()))) + math.evaluate(JSify(offsetOfX.toString()))
            let theY = (math.evaluate(JSify(listOfPoints[i][1])) * math.evaluate(JSify(size.toString()))) + math.evaluate(JSify(offsetOfY.toString()))
        
            plotPoint(theX, theY, theColor)
                
            if(!isFirst) {
                drawLine(theX, theY, lastPoint[0], lastPoint[1])
            }

            lastPoint = [theX, theY]
            isFirst = false
                
        }
    }

    function graphLineFromInfo(information, i) {

        let dontEvenTryIt = false

        if(dontEvenTryIt) {
            return
        }

        let minXVisible = math.ceil((-amountOfSquaresX / 2) - (math.floor(offsetX / squareWidth))) - 1
        let minYVisible = math.ceil((-amountOfSquaresY / 2) + (math.floor(offsetY / squareHeight))) - 1
        let maxXVisible = math.ceil((amountOfSquaresX / 2) - (math.floor(offsetX / squareWidth))) + 1
        let maxYVisible = math.ceil((amountOfSquaresY / 2) + (math.floor(offsetY / squareHeight))) + 1

        var indexOfColor = listOfColors.indexOf(mathInputs[i - 1].style.backgroundColor)

        if (information[0] == "text") {

            if (information[1] == null || information[1] == "") {
                information[1] = "Text"
            }

            if (information[2] == null || information[2] == "") {
                information[2] = [0, 0]
            }

            if (information[3] == null || information[3] == "") {
                information[3] = listOfColors[indexOfColor]
            }

            if (information[4] == null || information[4] == "") {
                information[4] = 16
            }

            writeText(information[1], information[2], information[3], information[4])
        }
        
        if (information[0] == 'point') {
            plotPoint(information[1], information[2], indexOfColor)
            return
        }
        
        if (information[0] == 'shape') {
            //alert(information[1])
            drawShape(information[1], 1, 0, 0, indexOfColor)
        }

        else if (information[0] == 'square') {
            document.getElementById(`where_the_math_goes_${i}`).value = "shape([-1, -1][-1, 1][1, 1][1, -1])"
            refreshGraph(0)
        }

        else if (information[0] == 'rtriangle') {
            document.getElementById(`where_the_math_goes_${i}`).value = "shape([-1, 0][1, 0][1, 2])"
            refreshGraph(0)
        }


        else if (information[0] == 'diamond') {
            document.getElementById(`where_the_math_goes_${i}`).value = "shape([-2, 1.5][2, 1.5][3, 0.5][0, -2.5][-3, 0.5])"
            refreshGraph(0)
        }

        else if (information[0] == "LSFY") {

            const soThatJSdoesntKillMe = JSify(information[2]) 

            let step = Math.max(precision, 1 / squareWidth) 

            let previousPoint = null 

            for (let x = minXVisible; x <= maxXVisible; x += step) {

                let xEquation = soThatJSdoesntKillMe.replaceAll("x", "(" + x.toString() + ")") 

                try {
                    let y = math.evaluate(xEquation) 

                    if (isNaN(y) || !isFinite(y)) {
                        previousPoint = null 
                        continue 
                    }

                    if (y < minYVisible - (precision * 100) || y > maxYVisible + (precision * 100)) {
                        previousPoint = null 
                        // If null, then do NOT draw a line from the last good point, or else asymptotes will break
                        continue 
                    }

                    if(previousPoint == null) {
                        previousPoint = [x, y]
                    }

                    if (previousPoint !== null) {
                        //plotPoint(x, y, indexOfColor) 
                        drawLine(previousPoint[0], previousPoint[1], x, y, indexOfColor) 

                    }

                    previousPoint = [x, y] 

                }
                
                catch (e) {
                    previousPoint = null 
                }
            }
        }

        else if (information[0] == "LSFX") {

            const soThatJSdoesntKillMe = JSify(information[2]) 

            let step = Math.max(precision, 1 / squareWidth) 

            let previousPoint = null

            for (let y = minYVisible; y <= maxYVisible; y += step) {

                let yEquation = soThatJSdoesntKillMe.replaceAll("y", "(" + y.toString() + ")") 

                try {
                    let x = math.evaluate(yEquation) 

                    if (isNaN(x) || !isFinite(x)) {
                        previousPoint = null 
                        continue 
                    }

                    if (x < minXVisible - (precision * 100) || x > maxXVisible + (precision * 100)) {
                        previousPoint = null 
                        //if null, then do NOT draw a line from the last good point, or else asymptotes will break

                        continue 
                    }

                    if(previousPoint == null) {
                        previousPoint = [x, y]
                    }

                    if (previousPoint !== null) {
                        //plotPoint(x, y, indexOfColor) 
                        drawLine(previousPoint[0], previousPoint[1], x, y, indexOfColor) 
                    }

                    if (x % (Math.PI / 2) == 0) {
                        //plotPoint(x, y, indexOfColor)
                    }

                    previousPoint = [x, y] 

                } 
                
                catch (e) {
                    previousPoint = null 
                }
            }
        }

        else if (information[0] == "STOSS") {

            let sideToSolveFor = JSify(information[1])
            let sideWithSolution = JSify(information[2])

            let lastPoint = null

            for (let x = minXVisible; x <= maxXVisible; x++) {
                for (let y = minYVisible; y <= maxYVisible; y++) {

                    let thing = sideToSolveFor.replaceAll("y", "(" + y.toString() + ")")
                    thing = thing.replaceAll("x", "(" + x.toString() + ")")

                    if (math.evaluate(thing) == sideWithSolution) {
                        
                        plotPoint(x, y, indexOfColor) 

                    }
                }
            }
        }
    }

    // INPUT HANDLING

    function readdListeners() {
            
        const input = document.getElementById(`where_the_math_goes_${mathInputs.length}`) 

        input.addEventListener("input", () => {

            refreshGraph(0) 
            
        }) 
    }    
    
    function itemCheck() {
        for (let i = 1; i <= mathInputs.length; i++) {
            const input = document.getElementById(`where_the_math_goes_${i}`) 

            if(input.value.toString().toUpperCase().replace(/\s/g, "") == "WYATT") {
                isFightingWyatt = true 
                offsetX = 0
                offsetY = 0
                zoomLevel = 20
                
                ctx.clearRect(0, 0, graph.width, graph.height) 
                drawGrid(0) 
                graph.style.cursor = "default"
                startTheFight() 

                return
            
            }

            if(input.value.toString().toUpperCase().replace(/\s/g, "") == "DIEKUH") {
                let dieKuh = new Image()
                dieKuh.src = "../static/img/DieKueh.jpg"
                ctx.drawImage(dieKuh, 0, 0, width, height)

                

                continue
            }

            let information = getEquationTypeFromInput(input.value.toString())

            if(information == "invalid") {continue}
            if(!(Array.isArray(information))) {continue}

            graphLineFromInfo(information, i)

            
        }
    }

    readdListeners() 

    let starterThing = document.getElementById("whatever_this_thing_is_called")

    starterThing.style.cursor = 'pointer' 

    starterThing.addEventListener("click", () => {
        let currentColor = starterThing.style.backgroundColor 
        let index = listOfColors.indexOf(currentColor) 

        if(index == listOfColors.length - 1) {
            starterThing.style.backgroundColor = listOfColors[0]
        }

        else {
            starterThing.style.backgroundColor = listOfColors[index + 1]
        }

        refreshGraph(0) 

    })

    addNewItemButton.addEventListener('click', () => {
        const whereYouPutMath = document.querySelector('.where_you_put_math') 
        const againWithTheBlocks = document.createElement('div') 
        againWithTheBlocks.style.display = 'flex' 
        againWithTheBlocks.style.height = '10%' 
        againWithTheBlocks.style.width = '100%' 

        let inputIndex = mathInputs.length + 1
        let indexOfColor = inputIndex

        while(indexOfColor > listOfColors.length - 1) {
            indexOfColor = indexOfColor - (listOfColors.length)
        }

        againWithTheBlocks.innerHTML = `<h2 style="background-color: ${listOfColors[0]}" id="whatever_this_thing_is_called_${inputIndex}" class="whatever_this_thing_is_called">${inputIndex}</h2><input class="graphing-calc-text" type="text" id="where_the_math_goes_${inputIndex}" placeholder="...">` 

        
        whereYouPutMath.insertBefore(againWithTheBlocks, addNewItemButton) 

        let bruh = document.getElementById("where_you_put_math")
        //bruh.style.height = (bruh.offsetHeight + againWithTheBlocks.offsetHeight) + "px"

        //alert(bruh.offsetHeight)
        //alert(againWithTheBlocks.offsetHeight)

        readdListeners() 

        mathInputs.push(document.getElementById(`whatever_this_thing_is_called_${inputIndex}`))

        let spy = mathInputs[mathInputs.length - 1]

        spy.style.cursor = 'pointer' 

        spy.addEventListener("click", () => {
            let currentColor = spy.style.backgroundColor 
            let index = listOfColors.indexOf(currentColor) 

            if(index == listOfColors.length - 1) {
                spy.style.backgroundColor = listOfColors[0]
            }

            else {
                spy.style.backgroundColor = listOfColors[index + 1]
            }

            refreshGraph(0)

        })

        document.getElementById(`where_the_math_goes_${inputIndex}`).addEventListener("input", () => {
            refreshGraph(0)
        })

    }) 

    // MOUSE STUFF

    var isDragging = false 
    var originalXPos = 0 
    var originalYPos = 0 
    let rect = graph.getBoundingClientRect() 

    graph.style.cursor = 'grab' 

    function onMouseDown(event) {
        if(isFightingWyatt) { return }
        rect = graph.getBoundingClientRect() 
        isDragging = true 
        originalXPos = event.clientX - rect.left 
        originalYPos = event.clientY - rect.top 
        graph.style.cursor = 'grabbing' 
    }

    addNewItemButton.style.cursor = 'pointer' 

    function onMouseMove(event) {
        if (!isDragging || isFightingWyatt) return 

        rect = graph.getBoundingClientRect() 
        const mouseX = event.clientX - rect.left 
        const mouseY = event.clientY - rect.top 

        const movementX = -(mouseX - originalXPos) * 1 
        const movementY = -(mouseY - originalYPos) * 1 

        offsetX -= movementX 
        offsetY -= movementY 

        originalXPos = mouseX 
        originalYPos = mouseY 

        realOriginX = width / 2 + offsetX 
        realOriginY = height / 2 + offsetY 

        graph.style.cursor = 'grabbing' 

        refreshGraph(0) 
    }

    function onMouseUp(event) {
        if(isFightingWyatt) { return }
        isDragging = false 
        graph.style.cursor = 'grab' 
        itemCheck() 
    }

    function onScrollOut() {
        if(isFightingWyatt) { return }
        zoomLevel = zoomLevel + 1 
        refreshGraph(1) 
    }

    function onScrollIn() {
        if(isFightingWyatt) { return }
        if (zoomLevel > 1) {
            zoomLevel = zoomLevel - 1 
            refreshGraph(-1) 
        }
    }

    // Listening for mouse events on the graph
    graph.addEventListener('mousedown', onMouseDown) 
    graph.addEventListener('mousemove', onMouseMove) 
    graph.addEventListener('mouseup', onMouseUp) 
    graph.addEventListener('mouseout', onMouseUp) 

    // Listening for scroll events on the graph, for zooming in and out
    graph.addEventListener('wheel', (event) => {
        event.preventDefault() 

        // Ignore zooming if you are fighting The Dug
        if(isFightingWyatt) {return}

        if (event.deltaY > 0) {onScrollOut()}
        else {onScrollIn()}

    }) 

}) 
