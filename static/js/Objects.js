export class Player {
    constructor(x, y, health, speed, sizeX, sizeY, image) {
        this.x = x 
        this.y = y 
        this.health = health 
        this.speed = speed 
        this.sizeX = sizeX 
        this.sizeY = sizeY 
        this.image = image 
        this.boundingBox = null 
        this.inflated = false 
        this.inflationValue = 1.1 
        this.inflationFactor = 0 
    }

    inflate() {

        if (this.inflated) {
            return 
        }

        this.sizeX *= this.inflationValue 
        this.sizeY *= this.inflationValue 
        
        if(this.y + (this.sizeY / 2) >= this.boundingBox.getMiddle()[1]) {
            this.y -= this.sizeY / 6
        }

        else {
            this.y += this.sizeY / 6
        }
        this.inflationFactor++
        this.inflated = true 
    }

    deflate() {
        this.sizeX /= this.inflationValue 
        this.sizeY /= this.inflationValue 
        //this.speed *= 2.5 
        if(this.y + (this.sizeY / 2) >= this.boundingBox.getMiddle()[1]) {
            this.y -= this.sizeY / 6
        }

        else {
            this.y += this.sizeY / 6
        }
        
        this.inflationFactor--
        this.inflated = false 
    }

    draw(ctx) {
        if (this.image && this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.sizeX, this.sizeY) 
        }
    }

    takeDamage(amount) {
        this.health -= amount 
        if (this.health < 0) {
            this.health = 0 
        }
        return this.health 
    }

    getHealth() {
        return this.health 
    }

    healHeath(amount) {
        this.health += amount 
        return this.health 
    }

    move(dx, dy) {

        if (this.boundingBox) {
            var bounds = this.boundingBox.getBounds() 

            if ((this.x + dx * this.speed < bounds.left) || this.x + dx * this.speed + this.sizeX > bounds.right) {
                dx *= 0 
            }

            if (this.y + dy * this.speed < bounds.top || this.y + dy * this.speed + this.sizeY > bounds.bottom) {
                dy *= 0 
            }
        }

        this.x += dx * this.speed 
        this.y += dy * this.speed 
    }

    setBoundingBox(boundingBox) {
        this.boundingBox = boundingBox 
    }

    getBoundingBox() {
        return this.boundingBox 
    }

    getPosition() {
        return {x: this.x, y: this.y}
    }

    isColliding(other) {

        var playerBounds = {
            left: this.x,
            right: (this.x + this.sizeX),
            top: this.y,
            bottom: (this.y + this.sizeY)
        } 

        var otherBounds = {
            left: other.x,
            right: (other.x + other.sizeX),
            top: other.y,
            bottom: (other.y + other.sizeY)
        } 
        
        return !(playerBounds.right < otherBounds.left || playerBounds.left > otherBounds.right || playerBounds.bottom < otherBounds.top || playerBounds.top > otherBounds.bottom) 
    }

    moveTo(x, y) {
        this.x = x - (player.sizeX / 2)
        this.y = y - (player.sizeY / 2)
    }

    isInflated() {
        return this.inflated 
    }

    updateSpeed(speed, fps) {

        if(this.inflationFactor < 0) {
            this.speed = speed * (5 * (this.inflationFactor * -1))
        }

        else if(this.inflationFactor > 0) {
            this.speed = speed / (5 * (this.inflationFactor))
        }

        else {
            this.speed = speed
        }
        
    }


}

export class Projectile {
    constructor(x, y, speed, directionX, directionY, sizeX, sizeY, image, id, damage, decayTime = 9999999, destroyOnDeath = false) {
        this.id = id 
        this.x = x 
        this.y = y 
        this.speed = speed 
        this.directionX = directionX 
        this.directionY = directionY 
        this.sizeX = sizeX 
        this.sizeY = sizeY 
        this.image = image 
        this.damage = damage 
        this.decayTime = decayTime 
        this.destroyOnDeath = false 
    }

    update() {
        this.x += this.speed * this.directionX 
        this.y += this.speed * this.directionY 
        this.decayTime = this.decayTime - 1
        if(this.decayTime == 0 && this.destroyOnDeath) {
            this.destroy()
        }
    }

    getDecayTime() {
        return this.decayTime 
    }

    getPosition() {
        return { x: this.x, y: this.y } 
    }

    getDirection() {
        return {x: this.directionX, y: this.directionY}
    }

    draw(ctx) {
        if (this.image && this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.sizeX, this.sizeY) 
        }
    }

    getId() {
        return this.id 
    }

    destroy() {
        this.x = -1000 
        this.y = -1000 
        this.speed = 0 
    }

    getDamage() {
        return this.damage 
    }

    changeDirection(x, y){
        this.directionX = x
        this.directionY = y
    }


}

export class Platform {
    constructor(x, y, width, height) {
        this.x = x 
        this.y = y 
        this.width = width 
        this.height = height 
    }

    move(dx, dy) {
        this.x += dx 
        this.y += dy 
    }
    
    getBounds() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height
        } 
    }
}

export class BoundingBox {
    
    constructor(x, y, sizeX, sizeY) {
        this.x = x 
        this.y = y 
        this.sizeX = sizeX 
        this.sizeY = sizeY 
    }

    getBounds() {
        return {
            left: this.x,
            right: this.x + this.sizeX,
            top: this.y,
            bottom: this.y + this.sizeY
        } 
    }

    draw(ctx) {
        ctx.strokeStyle = "white" 
        ctx.lineWidth = 2 
        ctx.strokeRect(this.x, this.y, this.sizeX, this.sizeY) 
    }

    getMiddle() {
        return [
            this.x + this.sizeX / 2,
            this.y + this.sizeY / 2
        ]
    }

}

export class Enemy {

    constructor(x, y, sizeX, sizeY, health, image) {
        this.x = x 
        this.y = y 
        this.sizeX = sizeX 
        this.sizeY = sizeY 
        this.health = health 
        this.image = image 
    }

    takeDamage(amount) {
        this.health -= amount 
        if (this.health < 0) {
            this.health = 0 
        }
        return this.health 
    }

    getHealth() {
        return this.health 
    }

    healHeath(amount) {
        this.health += amount 
        return this.health 
    }

    move(dx, dy) {
        this.x += dx * this.speed 
        this.y += dy * this.speed 
    }

    draw(ctx) {
        if (this.image && this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.sizeX, this.sizeY) 
        }
    }
}

