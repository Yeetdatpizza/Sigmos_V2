import * as Objects from "./Objects.js" 
import * as Dialouge from "../dialouge/Wyatt.js"

var canvas = document.getElementById('graphing-calc-canvas')
var ctx = canvas.getContext('2d') 
var graphingGraphThing = document.getElementById('graphingGraphThing') 

var isDone = false

var keysPressed = {} 
var lastFrameTime = performance.now() 

var currentAttack = "Intro" 
var attacks = Array("ChickenPatty", "WeridThings", "Highlighter", "Tiphead")
var attackAmount = 0 

var items = []
var dialogueSpoken = []

var currentTaunt = null 

var attackStartFrame = 0 
var generalAssumedFramesPerSecond = 30
var currentFrame = 0 
var fps = null 
var painFrames = null 
var painFramesCount = null 

var temporarySpeech = ""
var currentSpeech = 0

var playerOrign = null 
var playerImage = new Image() 
playerImage.src = "../static/img/sigmos.png"
var player = null 

var wyattImage = new Image() 
wyattImage.src = "../static/img/WyattSprites/wyatt.png"

var explosion = new Image() 
explosion.src = "../static/img/explosion.webp"

var creeper = new Image() 
creeper.src = "../static/img/creeper.png"
var wyatt = null 
var wyattPosition = null 

export function startTheFight() {

    var whereYouPutMath = document.getElementById("where_you_put_math")
    whereYouPutMath.innerHTML = ""
    whereYouPutMath.outerHTML = ""

    var navbar = document.getElementById("navbar")
    navbar.style.background = "black"
    navbar.innerHTML = "<h1 style='color: #ffffff;' id='wyattTitle'>DUGMOS</h1><div style='color: #ffffff;' id='wyattHealth'>Wyatt's Health: ???</div>"
    
    canvas.style.backgroundColor = "black"
    graphingGraphThing.style.width = "100%"
    
    document.addEventListener('keydown', (e) => {
        keysPressed[e.key.toLowerCase()] = true
        console.log(e.key.toLowerCase())
    })
    
    document.addEventListener('keyup', (e) => {
        keysPressed[e.key.toLowerCase()] = false
    })

    playerOrign = {x: (canvas.width / 2) - canvas.width / 48, y: (canvas.height * (3 / 5) + (canvas.height / 10))}
    player = new Objects.Player(playerOrign.x, playerOrign.y, 100, 0, canvas.width / 24, canvas.width / 24, playerImage)

    wyatt = new Objects.Enemy((canvas.width / 2) - canvas.width / 6, (canvas.height / 2) - canvas.width / 3, canvas.width / 3, canvas.width / 3, 1000, wyattImage)
    
    lastFrameTime = performance.now() 
    updateFrame()

}

function getFramesPerSecond() {
    
    var now = performance.now() 
    var delta = now - lastFrameTime 
    lastFrameTime = now 
    var fps = 1000 / delta 
    
    return Math.round(fps) 
    
}

function write(text, canSpeedUp = true, canSkip = true, isAnAction = false) {

    if (dialogueSpoken.includes(text)) {
        return "Done"
    }

    var stuffToActuallyWrite = text.replace("[stop]", "").replace("[next]", "")

    if(!(temporarySpeech.length >= stuffToActuallyWrite)) {
        if (keysPressed['shift'] && canSpeedUp) {
            temporarySpeech = stuffToActuallyWrite
        }
    }

    if (currentFrame % (2 * math.ceil(fps / generalAssumedFramesPerSecond)) == 0) {
        temporarySpeech += stuffToActuallyWrite.charAt(temporarySpeech.length)
    }

    ctx.font = "20px Arial" 
    ctx.fillStyle = "white" 
    ctx.textAlign = "center" 
    ctx.textBaseline = "middle" 

    drawWrappedCenteredText(ctx, temporarySpeech, canvas.width / 2, canvas.height / 2, 400, 28) 

    if(keysPressed[' '] && isAnAction) {
        temporarySpeech = ""
        return "Done"
    }

    if (temporarySpeech.length >= stuffToActuallyWrite.length) {
        if(keysPressed['enter'] && canSkip) {
            temporarySpeech = ""
            dialogueSpoken.push(text)
            return "Done"
        }
    }
}

function taunt() {
    let currentTaunt = Dialouge.taunts[currentSpeech]
    if (write(currentTaunt, true, true, false) == "Done") {
        if (currentTaunt.includes("[next]")) {
            currentSpeech += 1
            taunt()
        }

        else {
            currentSpeech += 1
            return "Done"
        }
        
    }
    
}
    
function updateFrame() {

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    var boundingBoxStart = [(canvas.width / 3), (canvas.height * (3 / 5))]
    var boundingBoxSize = [canvas.width / 3, canvas.height / 3]
        
    var box = new Objects.BoundingBox(boundingBoxStart[0], boundingBoxStart[1], boundingBoxSize[0], boundingBoxSize[1])
    box.draw(ctx)

    player.setBoundingBox(box)

    if (keysPressed['w']) player.move(0, -1)
    if (keysPressed['a']) player.move(-1, 0)
    if (keysPressed['s']) player.move(0, 1)
    if (keysPressed['d']) player.move(1, 0)
    if (keysPressed['arrowup']) player.move(0, -1)
    if (keysPressed['arrowleft']) player.move(-1, 0)
    if (keysPressed['arrowdown']) player.move(0, 1)
    if (keysPressed['arrowright']) player.move(1, 0)

    fps = getFramesPerSecond()
    navbar.innerHTML = "<h1 style='color: #ffffff;' id='wyattTitle'>DUGMOS</h1><div style='color: #ffffff;' id='wyattHealth'>Wyatt's Health: " + wyatt.getHealth() + " | Your Health: " + player.getHealth() + "</div>"
        
    player.draw(ctx)
    player.updateSpeed(Math.ceil((generalAssumedFramesPerSecond / fps)) * 5)
    wyatt.draw(ctx)
    
    for (let i = items.length - 1; i >= 0; i--) {

        if(items[i].getId() == "tiphead") {
            let head = items[i]
            let dx = -(head.getPosition()["x"] - player.getPosition()["x"])
            let dy = -(head.getPosition()["y"] - player.getPosition()["y"])

            let targetAngle = Math.atan2(dy, dx)
            let currentAngle = Math.atan2(head.getDirection()["y"], head.getDirection()["x"])
            let angleDifference = targetAngle - currentAngle

            angleDifference = Math.atan2(Math.sin(angleDifference), Math.cos(angleDifference))

            currentAngle += (angleDifference * .075)
            
            if (head.getDecayTime() > 0) {
                head.changeDirection(Math.cos(currentAngle), Math.sin(currentAngle))
            }
            
            if (currentAttack == "Taunt") {
                items[i].destroy() 
            }
        }

        items[i].update() 
        items[i].draw(ctx) 
        
        if (player.isColliding(items[i])) {
            if(items[i].getId() == "ChickenPatty") {
                player.inflate() 
            }
            
            player.takeDamage(items[i].getDamage()) 
            items[i].destroy() 
            
        }
    }

    currentFrame++
    
    attackLoop(currentFrame)
    
    requestAnimationFrame(updateFrame)

}

function drawWrappedCenteredText(ctx, text, centerX, centerY, maxWidth, lineHeight) {

    const words = text.split(" ") 
    let lines = [] 
    let currentLine = words[0] 

    for (let i = 1; i < words.length; i++) {
        let testLine = currentLine + " " + words[i] 
        let metrics = ctx.measureText(testLine) 

        if (metrics.width > maxWidth) {
            lines.push(currentLine) 
            currentLine = words[i] 
        }
        
        else {
            currentLine = testLine 
        }
    }

    lines.push(currentLine) 

    const totalHeight = lines.length * lineHeight 
    let startY = centerY - totalHeight / 2 + lineHeight / 2 

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], centerX, startY + i * lineHeight) 
    }
}

function attackLoop(currentFrame) {

    if (isDone) {
        return
    }

    if(wyatt.getHealth() <= 0) {
       currentAttack = "Final"
    }

    if(player.getHealth() <= 0) {
        if (write("Well, THAT was easy!", false, false, true) == "Done") {
            wyatt.health = 1000
            player.health = 100
            currentAttack = "Intro"
            currentSpeech = 0
            dialogueSpoken = []
            if(player.isInflated()) {
                player.deflate()
            }
        }
        return
    }

    if (currentAttack == "Intro") {

        if(write(Dialouge.introduction) == "Done") {
            currentAttack = attacks[Math.floor(Math.random() * attacks.length)]
            attackStartFrame = currentFrame + 10 * (Math.round(fps / generalAssumedFramesPerSecond))
        }
        
    }

    else if (currentAttack == "Player") {

        if(write("(Press SPACE to attack!)", true, false, true) == "Done") {
            wyatt.takeDamage((currentSpeech + 1) * 10)
            if(wyatt.health <= 100) {
                currentAttack = "Taunt"
            }

            else {
                currentAttack = "Taunt"
            }
            
            attackStartFrame = currentFrame + 10 * (Math.round(fps / generalAssumedFramesPerSecond))
        }
    }

    else if (currentAttack == "ChickenPatty") {
        
        if (currentFrame == attackStartFrame) {

            if (attackAmount < 10) {

                var chickenPattyImage = new Image() 
                chickenPattyImage.src = "../static/img/ChickenPatty.png"

                var chickenPatty = new Objects.Projectile((((canvas.width / 2) + (canvas.width / 4)) / (Math.random() * 2 + 1)), canvas.height / 8, 20 / (Math.round(fps / generalAssumedFramesPerSecond)) , 0, 1, canvas.width / 15, canvas.width / 15, chickenPattyImage, "ChickenPatty", 5)
                chickenPatty.image = chickenPattyImage
                items.push(chickenPatty)
                attackStartFrame += 16 * (Math.round(fps / generalAssumedFramesPerSecond))
                attackAmount++

            }

            else {

                attackAmount = 0 
                currentAttack = 'Player'
            }
        }
    }

    else if(currentAttack == "WeridThings") {
        
        if (currentFrame == attackStartFrame) {

            if (attackAmount < 50) {

                var weridTThingImage = new Image() 
                weridTThingImage.src = "../static/img/werid_thing.png"

                var weridThing = new Objects.Projectile(0, canvas.width / 2 * (Math.random() * 2), 45 / (Math.round(fps / generalAssumedFramesPerSecond)), 1, ((Math.random() * 2) - 1) * (3/4), canvas.width / 32, canvas.width / 32, weridTThingImage, "WeridThing", 1)
                weridThing.image = weridTThingImage
                items.push(weridThing)
                attackStartFrame += 1 * (Math.ceil(fps / generalAssumedFramesPerSecond))
                attackAmount++

            }

            else {
                
                if(player.isInflated()) {
                    
                    player.deflate()
                }
                
                attackAmount = 0 
                currentAttack = 'Player'
            }
        }
    }

    else if(currentAttack == "Highlighter") {

        if (currentFrame == attackStartFrame) {

            if (attackAmount < 10) {

                var highlighterImage = new Image() 
                highlighterImage.src = "../static/img/highlighter.png"

                var highlighter = new Objects.Projectile(-canvas.width, player.y, 60 / (Math.round(fps / generalAssumedFramesPerSecond)), 1, 0, canvas.width / 4, canvas.width / 32, highlighterImage, "Highlighter", 15)
                highlighter.image = highlighterImage
                items.push(highlighter)
                attackStartFrame += 25 * (Math.ceil(fps / generalAssumedFramesPerSecond))
                attackAmount++

            }

            else {
                
                if(player.isInflated()) {
                    
                    player.deflate()
                }
                
                attackAmount = 0 
                currentAttack = 'Player'
            }
        }
    }

    else if(currentAttack == "Tiphead") {
        if (currentFrame == attackStartFrame) {

            if (attackAmount < 10) {

                
                let positions = [
                    {x: 0, y: 0},
                    {x: canvas.width, y: 0},
                    {x: 0, y: canvas.height},
                    {x: canvas.width, y: canvas.height}
                ]

                let randomPosition = positions[math.round(math.random(0, 3))]


                var tipheadImage = new Image() 
                tipheadImage.src = "../static/img/tiphead.png"

                var tiphead = new Objects.Projectile(randomPosition["x"], randomPosition["y"], 12 / (Math.round(fps / generalAssumedFramesPerSecond)), 1, 0, canvas.width / 16, canvas.width / 16, tipheadImage, "tiphead", 5, fps * 2, false)
                tiphead.image = tipheadImage
                items.push(tiphead)
                
                attackStartFrame += 45 * (Math.ceil(fps / generalAssumedFramesPerSecond))
                attackAmount++

            }

            else {
                
                if(player.isInflated()) {
                    
                    player.deflate()
                }
                
                attackAmount = 0 
                currentAttack = 'Player'
            }
        }
    }

    else if(currentAttack == 'Taunt') {

        if(taunt() == "Done") {
            if (Dialouge.taunts[currentSpeech].includes("[final]")) {
                currentAttack = "Final"
            }
            else {
                currentAttack = attacks[Math.floor(Math.random() * attacks.length)]
            }
            attackStartFrame = currentFrame + 10 * (Math.round(fps / generalAssumedFramesPerSecond))
        }
    }

    else if(currentAttack == "Final") {

        if (write("Let's see you survive THIS!!", false, true, false) == "Done") {
            ctx.drawImage(creeper, (canvas.width) - (creeper.width), (canvas.height / 2) - (creeper.height / 2), creeper.width / 2, creeper.height / 2)
            if(write("OH NO! MY GREATEST ENEMY!!", false, true, false) == "Done") {
                ctx.drawImage(explosion, (canvas.width / 2) - canvas.width / 6, (canvas.height / 2) - canvas.width / 3, canvas.width / 3, canvas.width / 3)
                if(write("Guh! You... you... defeated me, no this CAN'T BE!", false, true, false) == "Done") {
                    if (write("Nooo!", false, true, false) == "Done") {
                        if (write("(You WON!)", false, true, false) == "Done") {
                            if (write("(You gained 10 Sigmos Coins, and... whatever this thing is.)", false, true, false) == "Done") {
                                isDone = true
                                location.href = "/home"
                                if (localStorage.getItem("sigmosCoins") == null || localStorage.getItem("sigmosCoins") == "NaN") {
                                    localStorage.setItem("sigmosCoins", 0)
                                }
                                localStorage.setItem("sigmosCoins", parseInt(localStorage.getItem("sigmosCoins")) + 10)
                                localStorage.setItem("hasBeatWyatt", true)
                                write("", false, false, false)
                                return
                            }
                        }
                    }
                }
            }
        }

    }
    

    else {
        
    }

}
