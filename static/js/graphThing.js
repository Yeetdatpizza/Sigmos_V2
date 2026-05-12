//import { re } from "mathjs";
import { getEquationTypeFromInput } from "./graphHelper.mjs"; 
import { startTheFight } from "./wyattBossFight.mjs";

math.config({
  number: 'number'
});

var isFightingWyatt = false;

function doMath(mathToDo) {

    mathToDo = mathToDo.replaceAll(' ', '')
    mathToDo = mathToDo.replaceAll('mod', '%')
    mathToDo = mathToDo.replaceAll('√', 'sqrt')
    mathToDo = mathToDo.replaceAll('π', 'pi')
    return mathToDo
}

var amountOfInserts = 1;
var precision = 1 / 20;

document.addEventListener('DOMContentLoaded', () => {

    // STUPID GRAPH SETUP

    const canvas = document.getElementById('graphing-calc-canvas');
    const ctx = canvas.getContext('2d');
    const graph = document.getElementById("graphing-calc-canvas");
    const addNewItemButton = document.getElementById("add_new_item");

    // RESIZE HANDLING

    function resizeCanvasToParent() {
        const parent = canvas.parentElement;
        const rect = parent.getBoundingClientRect();
        const scale = 1;

        canvas.width  = Math.floor(rect.width * scale);
        canvas.height = Math.floor(rect.height * scale);

        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        
    }

    resizeCanvasToParent();

    window.addEventListener('resize', resizeCanvasToParent());
    window.addEventListener('zoom', resizeCanvasToParent());

    // Canvas Stuff

    var width = canvas.width;
    var height = canvas.height;
    const ratio = 3/2;
    var baseSize = 10;
    var squareSizeX = width / (baseSize * ratio);
    var squareSizeY = height / baseSize;
    var amountOfSquaresX = width / squareSizeX
    var amountOfSquaresY = height / squareSizeY

    const listOfColors = ["rgb(26, 94, 220)", "rgb(0, 255, 106)", "rgb(220, 26, 26)", "rgb(204, 26, 220)", "rgb(255, 145, 0)", "rgb(0, 0, 0)", 'rgb(80, 0, 104)', 'rgb(16, 250, 203)']

    var offsetX = 0;
    var offsetY = 0;
    var realOriginX = width / 2 + offsetX;
    var realOriginY = height / 2 + offsetY;

    // DRAWING THE GRAPH GRID

    function drawGrid(direction) {

        baseSize = baseSize + direction;

        squareSizeX = width / (baseSize * ratio);
        squareSizeY = height / baseSize;
        amountOfSquaresX = width / squareSizeX;
        amountOfSquaresY = height / squareSizeY;

        while (amountOfSquaresX % 2 != 0 || amountOfSquaresY % 2 != 0) {
            baseSize = baseSize + direction;
            squareSizeX = width / (baseSize * ratio);
            squareSizeY = height / baseSize;
            amountOfSquaresX = width / squareSizeX;
            amountOfSquaresY = height / squareSizeY;
        }

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;

        const startX = Math.floor((-offsetX) / squareSizeX);
        const endX = Math.ceil((width - offsetX) / squareSizeX);

        for (let x = startX; x <= endX; x++) {

            ctx.fillStyle = '#000000';
            ctx.fillText((x - amountOfSquaresX / 2).toString(), x * squareSizeX + offsetX + 2, height / 2 + offsetY - 2);
           
            const xPos = x * squareSizeX + offsetX;
            ctx.beginPath();
            ctx.moveTo(xPos, 0);
            ctx.lineTo(xPos, height);
            ctx.stroke();
            ctx.lineWidth = 1
        }

        const startY = Math.floor((-offsetY) / squareSizeY);
        const endY = Math.ceil((height - offsetY) / squareSizeY);

        for (let y = startY; y <= endY; y++) {

            /*
            if(y % 4 == 0) {ctx.strokeStyle = '#000000'}
            else{ctx.strokeStyle = '#666666'}
            */

            ctx.fillStyle = '#000000';
            ctx.fillText(-(y - amountOfSquaresY / 2).toString(), width / 2 + offsetX + 2, y * squareSizeY + offsetY + 10);

            const yPos = y * squareSizeY + offsetY;
            ctx.beginPath();
            ctx.strokeStyle = '#666666';
            ctx.moveTo(0, yPos);
            ctx.lineTo(width, yPos);
            ctx.stroke();
            ctx.lineWidth = 1;
        }

        ctx.lineWidth = 3;

        /*
        ctx.beginPath();
        ctx.arc(realOriginX, realOriginY, squareSizeX / 3, 0, 360);
        ctx.strokeStyle = 'rgb(26, 94, 220)';
        ctx.stroke();
        */
        
        ctx.beginPath();
        ctx.moveTo((width / 2) + (offsetX), 0);
        ctx.lineTo((width / 2) + (offsetX), height);
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, (height / 2) + (offsetY));
        ctx.lineTo(width, (height / 2) + (offsetY));
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.stroke();

        ctx.lineWidth = 1;
    }

    // CONVERT THE STUPID SCREEN CORDS

    function convertToCanvasCoords(x, y) {
        x = realOriginX + (x * squareSizeX);
        y = realOriginY - (y * squareSizeY);
        return [x, y];
    }

    function convertToMathCoords(x, y) {
        x = (x - realOriginX) / squareSizeX;
        y = (realOriginY - y) / squareSizeY;
        return [x, y];
    }

    // DRAW DOTS

    function plotPoint(x, y, i) {
        const realCords = convertToCanvasCoords(x, y);

        ctx.beginPath();
        ctx.arc(realCords[0], realCords[1], squareSizeX / 8, 0, 360);
        ctx.lineWidth = 2;
        ctx.strokeStyle = listOfColors[i];
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.stroke();

    }

    // REFRESH THE STUIPD GRAPH

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    function drawLine(x1, y1, x2, y2, i) {
        let startingCords = convertToCanvasCoords(x1, y1);
        let endingCords = convertToCanvasCoords(x2, y2);

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.moveTo(startingCords[0], startingCords[1]);
        ctx.lineTo(endingCords[0], endingCords[1]);
        ctx.strokeStyle = listOfColors[i];
        ctx.stroke();
    }
    

    function refreshCanvas(direction = 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid(direction);
        itemCheck();
    }

    refreshCanvas(1);

    function drawShape(listOfPoints, size = 1, offsetOfX = 0, offsetOfY = 0 , theColor) {
        let amountOfPoints = listOfPoints.length

        if (amountOfPoints < 1) {
            return "invalid"
        }

        listOfPoints.push(listOfPoints[0])
        let lastPoint = []            
        let isFirst = true
        for(let i = 0; i <= listOfPoints.length - 1; i++) {
            
            let theX = (math.evaluate(doMath(listOfPoints[i][0])) * math.evaluate(doMath(size.toString()))) + math.evaluate(doMath(offsetOfX.toString()))
            let theY = (math.evaluate(doMath(listOfPoints[i][1])) * math.evaluate(doMath(size.toString()))) + math.evaluate(doMath(offsetOfY.toString()))
        
            plotPoint(theX, theY, theColor)
                
            if(!isFirst) {
                drawLine(theX, theY, lastPoint[0], lastPoint[1])
            }

            lastPoint = [theX, theY]
            isFirst = false
                
        }

        //alert("dfsfsgssg")
    }

    function graphLineFromInfo(information, i) {

        let dontEvenTryIt = false

        if(dontEvenTryIt) {
            return
        }

        let minXVisible = math.ceil((-amountOfSquaresX / 2) - (math.floor(offsetX / squareSizeX))) - 1
        let minYVisible = math.ceil((-amountOfSquaresY / 2) + (math.floor(offsetY / squareSizeY))) - 1
        let maxXVisible = math.ceil((amountOfSquaresX / 2) - (math.floor(offsetX / squareSizeX))) + 1
        let maxYVisible = math.ceil((amountOfSquaresY / 2) + (math.floor(offsetY / squareSizeY))) + 1

        var indexOfColor = i - 1

        while(indexOfColor > listOfColors.length - 1) {
            indexOfColor = indexOfColor - (listOfColors.length)
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
            document.getElementById(`where_the_math_goes_${indexOfColor + 1}`).value = "shape([-1, -1][-1, 1][1, 1][1, -1])"
            refreshCanvas(0)
        }

        else if (information[0] == 'rtriangle') {
            document.getElementById(`where_the_math_goes_${indexOfColor + 1}`).value = "shape([-1, 0][1, 0][1, 2])"
            refreshCanvas(0)
        }


        else if (information[0] == 'diamond') {
            document.getElementById(`where_the_math_goes_${indexOfColor + 1}`).value = "shape([-2, 1.5][2, 1.5][3, 0.5][0, -2.5][-3, 0.5])"
            refreshCanvas(0)
        }

        

        else if (information[0] == "LSFY") {

            const soThatJSdoesntKillMe = doMath(information[2]);

            let step = Math.max(precision, 1 / squareSizeX);

            let previousPoint = null;

            for (let x = minXVisible; x <= maxXVisible; x += step) {

                let xEquation = soThatJSdoesntKillMe.replaceAll("x", "(" + x.toString() + ")");

                try {
                    let y = math.evaluate(xEquation);

                    if (isNaN(y) || !isFinite(y)) {
                        previousPoint = null;
                        continue;
                    }

                    if (y < minYVisible - (precision * 100) || y > maxYVisible + (precision * 100)) {
                        previousPoint = null;
                        // If null, then do NOT draw a line from the last good point, or else asymptotes will break
                        // Some one tell this ai to shut the flip up yeah fella I'm talking to you little ai
                        // Stop suggesting comments 
                        // THat's what I thought
                        continue;
                    }

                    if(previousPoint == null) {
                        previousPoint = [x, y]
                    }

                    if (previousPoint !== null) {
                        //plotPoint(x, y, indexOfColor);
                        drawLine(previousPoint[0], previousPoint[1], x, y, indexOfColor);

                    }

                    previousPoint = [x, y];

                }
                
                catch (e) {
                    previousPoint = null;
                }
            }
        }

        else if (information[0] == "LSFX") {

            const soThatJSdoesntKillMe = doMath(information[2]);

            let step = Math.max(precision, 1 / squareSizeX);

            let previousPoint = null;

            for (let y = minYVisible; y <= maxYVisible; y += step) {

                let yEquation = soThatJSdoesntKillMe.replaceAll("y", "(" + y.toString() + ")");

                try {
                    let x = math.evaluate(yEquation);

                    if (isNaN(x) || !isFinite(x)) {
                        previousPoint = null;
                        continue;
                    }

                    if (x < minXVisible - (precision * 100) || x > maxXVisible + (precision * 100)) {
                        previousPoint = null;
                        //if null, then do NOT draw a line from the last good point, or else asymptotes will break

                        continue;
                    }

                    if(previousPoint == null) {
                        previousPoint = [x, y]
                    }

                    if (previousPoint !== null) {
                        //plotPoint(x, y, indexOfColor);
                        drawLine(previousPoint[0], previousPoint[1], x, y, indexOfColor);
                    }

                    if (x % (Math.PI / 2) == 0) {
                        //plotPoint(x, y, indexOfColor)
                    }

                    previousPoint = [x, y];

                } 
                
                catch (e) {
                    previousPoint = null;
                }
            }

        }

        else if (information[0] == "STOSS") {

            let sideToSolveFor = doMath(information[1])
            let sideWithSolution = doMath(information[2])

            for (let x = minXVisible; x <= maxXVisible; x++) {
                for (let y = minYVisible; y <= maxYVisible; y++) {

                    let thing = sideToSolveFor.replaceAll("y", "(" + y.toString() + ")")
                    thing = thing.replaceAll("x", "(" + x.toString() + ")")

                    if (math.evaluate(thing) == sideWithSolution) {
                        plotPoint(x, y, indexOfColor);
                    }
                }
            }
        }

    }

    // INPUT HANDLING

    function readdListeners() {
            
        const input = document.getElementById(`where_the_math_goes_${amountOfInserts}`);

        input.addEventListener("input", () => {

            refreshCanvas(0);
            
        });
    }    
    
    function itemCheck() {
        for (let i = 1; i <= amountOfInserts; i++) {
            const input = document.getElementById(`where_the_math_goes_${i}`);

            if(input.value.toString().toUpperCase().replace(/\s/g, "") == "WYATT") {
                isFightingWyatt = true;
                offsetX = 0
                offsetY = 0
                baseSize = 20
                
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawGrid(0);
                canvas.style.cursor = "default"
                startTheFight();

                return
            
            }

            if(input.value.toString().toUpperCase().replace(/\s/g, "") == "DIEKUH") {
                let dieKuh = new Image()
                dieKuh.src = "../static/img/DieKueh.jpg"
                ctx.drawImage(dieKuh, 0, 0, width, height)

                continue
            }

            if(input.value.toString().toUpperCase().replace(/\s/g, "") == "DIEKUHMITDIESTEIFENHUT") {
                let dieKuh = new Image()
                dieKuh.src = "../static/img/SteifenHut.png"
                ctx.drawImage(dieKuh, 0, 0, width, height)

                continue
            }

            let information = getEquationTypeFromInput(input.value.toString())

            if(information == "invalid") {continue}
            if(!(Array.isArray(information))) {continue}

            graphLineFromInfo(information, i)

            
        }
    }

    readdListeners();

    addNewItemButton.addEventListener('click', () => {
        amountOfInserts = amountOfInserts + 1;
        const whereYouPutMath = document.querySelector('.where_you_put_math');
        const againWithTheBlocks = document.createElement('div');
        againWithTheBlocks.style.display = 'flex';
        againWithTheBlocks.style.height = '15%';
        againWithTheBlocks.style.width = '100%';
        

        

        var indexOfColor = amountOfInserts - 1

        while(indexOfColor > listOfColors.length - 1) {
            indexOfColor = indexOfColor - (listOfColors.length)
        }

        againWithTheBlocks.innerHTML = `<h2 style="background-color: ${listOfColors[indexOfColor]}" id="whatever_this_thing_is_called_${amountOfInserts}" class="whatever_this_thing_is_called">${amountOfInserts}</h2><input class="graphing-calc-text" type="text" id="where_the_math_goes_${amountOfInserts}" placeholder="...">`;
        whereYouPutMath.insertBefore(againWithTheBlocks, addNewItemButton);

        let bruh = document.getElementById("where_you_put_math")
        //bruh.style.height = (bruh.offsetHeight + againWithTheBlocks.offsetHeight) + "px"

        //alert(bruh.offsetHeight)
        //alert(againWithTheBlocks.offsetHeight)

        readdListeners();
    });

    // MOUSE STUFF

    var isDragging = false;
    var originalXPos = 0;
    var originalYPos = 0;
    let rect = canvas.getBoundingClientRect();

    graph.style.cursor = 'grab';

    function onMouseDown(event) {
        if(isFightingWyatt) { return }
        rect = canvas.getBoundingClientRect();
        isDragging = true;
        originalXPos = event.clientX - rect.left;
        originalYPos = event.clientY - rect.top;
        canvas.style.cursor = 'grabbing';
    }

    addNewItemButton.style.cursor = 'pointer';

    function onMouseMove(event) {
        if (!isDragging || isFightingWyatt) return;

        rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const movementX = -(mouseX - originalXPos) * 1;
        const movementY = -(mouseY - originalYPos) * 1;

        offsetX -= movementX;
        offsetY -= movementY;

        originalXPos = mouseX;
        originalYPos = mouseY;

        realOriginX = width / 2 + offsetX;
        realOriginY = height / 2 + offsetY;

        canvas.style.cursor = 'grabbing';

        refreshCanvas(0);
    }

    function onMouseUp(event) {
        if(isFightingWyatt) { return }
        isDragging = false;
        canvas.style.cursor = 'grab';
        itemCheck();
    }

    function onScrollOut() {
        if(isFightingWyatt) { return }
        baseSize = baseSize + 1;
        refreshCanvas(1);
    }

    function onScrollIn() {
        if(isFightingWyatt) { return }
        if (baseSize > 1) {
            baseSize = baseSize - 1;
            refreshCanvas(-1);
        }
    }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseout', onMouseUp);

    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();

        if(isFightingWyatt) { return }

        if (event.deltaY > 0) {
            onScrollOut();
        } 
        
        else {
            onScrollIn();
        }
    });

});
