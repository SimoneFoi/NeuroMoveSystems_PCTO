// ------------------- VARIABILI GLOBALI -------------------
let player;
let player_s;
let pista;
let bandierina;
let bandierine = [];
let maxBandierine = 5;
let bandierinaW = 70;
let safeOffsetX = 400;        
let safeOffsetY = 250;        
let cuore;
let coppa;

let viteMax = 5;
let vite = 5;

let pistaOffsetY = 0;
let pistaSpeed = 6;           

let canzone;
let parti;

let playerW = 120;
let playerDir = "right";
let playerX = 300;

let schemaAttuale;
let oldSchema;

let start_image;
let pause_image;
let tutorial_image;
let game_over;

let vittoriaMostrata = false;
let microbitCommand = "PIATTO"; // stato iniziale

let port;
let reader;

// ------------------- PRELOAD -------------------
function preload() {
    player = loadImage('./img/sciatore.png');
    player_s = loadImage('./img/sciatore_sx.png');
    pista = loadImage('./img/prova.png');
    start_image = loadImage('./img/start_image.png');
    pause_image = loadImage('./img/pause.jpg');
    tutorial_image = loadImage('./img/tutorial.png');
    game_over = loadImage('./img/game_over.jpg');
    bandierina = loadImage('./img/bandierina.png');
    cuore = loadImage('./img/cuore.png');
    coppa = loadImage('./img/coppa.jpeg');
    canzone = loadSound('./img/lavoro.mp3');
    parti = false;
}

// ------------------- SETUP -------------------
function setup() {
    createCanvas(start_image.width, start_image.height);
    frameRate(50);

    player = new Player(player, playerX, 500);

    schemaAttuale = -2;
    oldSchema = schemaAttuale;

    // pulsante per connettere Micro:bit
    let btn = createButton("Connetti Micro:bit");
    btn.position(10, 10);
    btn.mousePressed(connectMicrobit);
}

// ------------------- CONNESSIONE MICRO:BIT -------------------
async function connectMicrobit() {
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        reader = textDecoder.readable.getReader();

        readMicrobit();
        console.log("Micro:bit connesso!");
    } catch (err) {
        console.error("Errore connessione Micro:bit:", err);
    }
}

// legge i dati dal microbit
async function readMicrobit() {
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;
        const lines = value.trim().split("\n");
        for (let line of lines) {
            line = line.trim();
            if (line === "SINISTRA" || line === "DESTRA" || line === "PIATTO") {
                microbitCommand = line;
            }
        }
    }
}

// ------------------- DRAW -------------------
function draw() {
    if (schemaAttuale == -2) {
        image(start_image, 0, 0);
    } else if (schemaAttuale == -1) {
        background(tutorial_image);
    } else if (schemaAttuale == 0) {
        background(pause_image);
    } else if (schemaAttuale == 1) {
        background(pista);

        drawScrollingPista();
        player.discesa();               //aggiorna giocatore secondo Micro:bit
        updateAndDrawBandierine();
        drawVite();
        checkDribbling();

        // direzione giocatore
        if (microbitCommand === "SINISTRA") playerDir = "left";
        else if (microbitCommand === "DESTRA") playerDir = "right";

        if (playerDir === "left") {
            image(player_s, player.x, player.y, playerW, player_s.height * (playerW / player_s.width));
        } else {
            image(player.img, player.x, player.y, playerW, player.img.height * (playerW / player.img.width));
        }

        if (vittoriaMostrata) mostraVittoria();

    } else if (schemaAttuale == 2) {
        background(game_over);
    }
}

// ------------------- FUNZIONI DI GIOCO -------------------
function drawScrollingPista() {
    pistaOffsetY += pistaSpeed;
    if (pistaOffsetY >= height) pistaOffsetY = 0;
    image(pista, 0, pistaOffsetY - height, width, height);    
    image(pista, 0, pistaOffsetY, width, height);
}

function spawnBandierina() {
    let pistaMinX = 200;
    let pistaMaxX = 1100 - bandierinaW;
    let tries = 0;
    let maxTries = 30;
    let x, y;
    let valid = false;
    while (!valid && tries < maxTries) {
        x = random(pistaMinX, pistaMaxX);
        y = random(-600, -100);
        valid = true;
        for (let b of bandierine) {
            if (abs(x - b.x) < safeOffsetX || abs(y - b.y) < safeOffsetY) {
                valid = false;
                break;
            }
        }
        tries++;
    }
    if (valid) bandierine.push({ x: x, y: y, checked: false });
}

function updateAndDrawBandierine() {
    for (let i = bandierine.length - 1; i >= 0; i--) {
        let b = bandierine[i];
        b.y += pistaSpeed;
        image(bandierina, b.x, b.y, bandierinaW, 90);
        if (b.y > height + 50) bandierine.splice(i, 1);
    }
    if (bandierine.length < maxBandierine && frameCount % 40 === 0) spawnBandierina();
}

function drawVite() {
    for (let i = 0; i < vite; i++) {
        let x = width - 10 - (i + 1) * (cuore.width + 5);
        let y = 10;
        image(cuore, x, y, cuore.width, cuore.width);
    }
}

function checkDribbling() {
    for (let i = bandierine.length - 1; i >= 0; i--) {
        let b = bandierine[i];
        if (!b.checked && b.y > 500) {
            b.checked = true;
            let skierCenter = player.x + playerW / 2;
            let bandCenter = b.x + bandierinaW / 2;
            let passedWrongSide = false;
            if (microbitCommand === "SINISTRA" && skierCenter > bandCenter) passedWrongSide = true;
            if (microbitCommand === "DESTRA" && skierCenter < bandCenter) passedWrongSide = true;
            if (passedWrongSide) loseLife();
        }
    }
}

function loseLife() {
    vite--;
    if (vite <= 0) schemaAttuale = 2;
}

function mostraVittoria() {
    let coppaW = 300;
    let coppaH = coppa.height * (coppaW / coppa.width);
    image(coppa, width / 2 - coppaW / 2, height / 2 - coppaH / 2 - 50, coppaW, coppaH);

    textAlign(CENTER, CENTER);
    textSize(64);
    fill(255, 215, 0);
    stroke(0);
    strokeWeight(4);
    text("HAI VINTO!", width / 2, height / 2 + coppaH / 2);
}

function mouseClicked() {
  // Avvia musica se non partita
  if (!parti && schemaAttuale == -2) {
    canzone.play(); 
    parti = true;
  }

  if (schemaAttuale == -2) {
    if (mouseX >= 431 && mouseX <= 1048 && mouseY >= 226 && mouseY <= 429) {
      schemaAttuale = -1; // tutorial
      setTimeout(() => {
        schemaAttuale = 1; // inizia gioco dopo tutorial
      }, 7000);
    }
  }

  else if (schemaAttuale == 2) {
    if (mouseX > 482 && mouseX < 948 && mouseY > 275 && mouseY < 354) {
      schemaAttuale = 1;
      vite = 5;
    }
    else if (mouseX > 482 && mouseX < 948 && mouseY > 377 && mouseY < 450) {
      schemaAttuale = -2;
      vite = 5;
    }
  }

  else if (schemaAttuale == 0) {
    if (mouseX > 483 && mouseX < 941 && mouseY > 282 && mouseY < 356) {
      schemaAttuale = 1;
    }
    if (mouseX > 483 && mouseX < 941 && mouseY > 378 && mouseY < 453) {
      schemaAttuale = -2;
    }
  }
}

function keyPressed(){
  if (key == 'p' || key == "Escape") {
    if (schemaAttuale != 0) {
      oldSchema = schemaAttuale;
      schemaAttuale = 0; // pausa
    } else {
      schemaAttuale = oldSchema; // torna al gioco
    }
  }
}
