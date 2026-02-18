let x1, x2, y1, y2;

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

        

        // blocco sul terreno
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocita_y = 0;
            this.ground = true;
        }
    }

    morto(guerriero1, guerriero2) {
        x1 = guerriero1.x + guerriero1.img.width / 2;
        y1 = guerriero1.y + guerriero1.img.height / 2;
        x2 = guerriero2.x + guerriero2.img.width / 2;
        y2 = guerriero2.y + guerriero2.img.height / 2;

        let d = dist(x1, y1, x2, y2);
        return d <= (guerriero1.img.width / 2 + guerriero2.img.width / 2);
    }

    spostaSx() {
        this.x -= this.spostamento;
    }

    spostaDx() {
        this.x += this.spostamento;
    }

}
