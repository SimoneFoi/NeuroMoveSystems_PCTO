let microBit

let schema; let ultimoSchema
const SCHEMI = Object.freeze({
    accoppia: -2,
    tutorial: -1,
    home: 0,
    gioco: 1,
    gameover: 2,
    pausa: 3,
})

let playerImgSx; let playerImgDx
let playerWidth; let playerHeight
let xInizio; let yInizio
let vite = 5; let viteMax = 5; let cuoreImg

let pistaImg; let pistaOffsetY = 0; let pistaSpeed = 6

let bandImg; let bandWidth = 70; let bandHeight = 90
const bandierine = []; let maxBand = 5

let startImg; let pausaImg; let gameOverImg; let tutorialImg

function preload() {
    playerImgDx = loadImage("./img/sciatore.png")
    playerImgSx = loadImage("./img/sciatore_sx.png")
    playerWidth = 120; 
    playerHeight = playerImgDx.height * (playerWidth / playerImgDx.width)
    cuoreImg = loadImage("./img/cuore.png")

    pistaImg = loadImage("./img/prova.png")
    bandImg = loadImage("./img/bandierina.png")

    startImg = loadImage("./img/start_image.png")
    pausaImg = loadImage("./img/pause.jpg")
    gameOverImg = loadImage("./img/game_over.jpg")
    tutorialImg = loadImage("./img/tutorial.png")

}

function setup() {
    createCanvas(startImg.width, startImg.height)
    frameRate(50)
    background(startImg)
    schema = SCHEMI.accoppia
    
    xInizio = startImg.width/2 - playerImgDx.width/2
    yInizio = startImg.height - playerImgDx.height/2
    player = new Player(playerImgDx, playerImgSx, xInizio, yInizio)

    microBit = new uBitWebBluetooth();

}

function draw() {
    if (schema == SCHEMI.accoppia) {

    } else if (schema == SCHEMI.home) {
        background(startImg)
    } else if (schema == SCHEMI.gioco) {
        background(pistaImg)
        pistaScorre()
        disegnaBandiere()
        disegnaVite()
        controllaDribbling()

        image(player.imgShow, player.x, player.y, playerWidth, playerHeight)

        let forzaX = microBit.getAccelerometer().x
        if (forzaX > 450) player.muoviSx()
        else if (forzaX < -450) player.muoviDx(startImg)

    } else if (schema == SCHEMI.gameover) {
        background(gameOverImg)
    } else if (schema == SCHEMI.pausa) {
        background(pausaImg)
    }
}

function keyPressed() {
    if (schema == SCHEMI.home) {
        schema = SCHEMI.gioco
    }
    if (keyCode == ESCAPE) {
        if (schema == SCHEMI.gioco) {
            schema = SCHEMI.pausa
        } else if (schema == SCHEMI.pausa) {
            schema = SCHEMI.gioco
        }
    }
}

function mouseClicked() {
    if (schema == SCHEMI.accoppia) {
        microBit.searchDevice()
        schema = SCHEMI.home
    } else if (schema == SCHEMI.home) {
        schema = SCHEMI.gioco
    } else if (schema == SCHEMI.gameover) {
        schema = SCHEMI.home
        vite = viteMax
        bandierine.splice(0, 5)
        player.x = xInizio
    } else if (schema == SCHEMI.pausa) {
        schema = SCHEMI.gioco
    }
}

function pistaScorre() {
    pistaOffsetY += pistaSpeed;
    if (pistaOffsetY >= height) pistaOffsetY = 0;
    image(pistaImg, 0, pistaOffsetY - height, width, height);    
    image(pistaImg, 0, pistaOffsetY, width, height);
}

function spawnaBandiera() {
    let minPistaX = 200; let maxPistaX = 1100 - bandWidth
    let minPistaY = -600; let maxPistaY = -100

    let prove = 0;
    let proveMax = 30;
    let x, y;
    let valido = false;
    while (!valido && prove < proveMax) {
        x = random(minPistaX, maxPistaX);
        y = random(minPistaY, maxPistaY);
        valido = true;
        prove++;
    }
    if (valido) bandierine.push(new Bandiera(x, y));
}

function disegnaBandiere() {
    for (let k = bandierine.length - 1; k >= 0; k--) {
        let b = bandierine[k]

        b.y += pistaSpeed
        image(bandImg, b.x, b.y, bandWidth, bandHeight)

        if (b.y > height + 50) { bandierine.splice(k, 1) }
    }
    if (bandierine.length < maxBand && frameCount % 40 == 0) spawnaBandiera()
}

function disegnaVite() {
    for (let k = 0; k < vite; k++) {
        let x = width - 10 - ((k+1) * (cuoreImg.width + 5))
        let y = 10
        image(cuoreImg, x, y)
    }
}

function controllaDribbling() {
    for (let k = bandierine.length - 1; k >= 0; k--) {
        let b = bandierine[k];
        if (!b.check && b.y > player.y - bandImg.height) {
            b.check = true;
            let centroSci = player.x + playerWidth / 2;
            let centroBand = b.x + bandWidth / 2;
            let latoSbagliato = false;

            if (player.imgShow == player.imgSx && centroSci > centroBand) latoSbagliato = true;
            if (player.imgShow == player.imgDx && centroSci < centroBand) latoSbagliato = true;

            if (latoSbagliato) { // perdi una vita
                vite--
                if (vite <= 0) schema = SCHEMI.gameover
            }
        }
    }
}