class Player {
    constructor(imgDx, imgSx, x, y) {
        this.imgDx = imgDx
        this.imgSx = imgSx
        this.imgShow = this.imgDx

        this.x = x
        this.y = y

        this.spostX = 15
    }

    muoviDx(sfondo) {
        this.x += this.spostX
        this.imgShow = this.imgDx
        if (this.x > sfondo.width - this.imgShow.width) this.x = sfondo.width - this.imgShow.width
    }
    muoviSx() {
        this.x -= this.spostX
        this.imgShow = this.imgSx
        if (this.x < 50) this.x = 50
    }
}