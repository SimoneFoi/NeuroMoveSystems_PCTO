// ------------------- CLASSE PLAYER -------------------
class Player {
    constructor(imgIniziale, x, y) {
        this.spostamento = 20;
        this.img = imgIniziale;
        this.x = x;
        this.y = y;
        this.groundY = y;
        this.velocita_y = 0;
        this.gravity = 10;
        this.salto = 80;
        this.ground = true;
    }

    jump() {
        if (this.ground) { 
            this.ground = false;
            this.velocita_y = -this.salto;
        }
    }

    discesa() {
        if (!this.ground) {
            this.velocita_y += this.gravity;
            this.y += this.velocita_y;
        }
        if (microbitCommand === "SINISTRA") this.x -= this.spostamento;
        if (microbitCommand === "DESTRA") this.x += this.spostamento;

        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocita_y = 0;
            this.ground = true;
        }
    }
}

