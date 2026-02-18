let player;
let player_s;
let pista;
let bandierina;
let bandierine = [];
let maxBandierine = 5;
let bandierinaW = 70;
let safeOffsetX = 400;        // distanza minima orizzontale
let safeOffsetY = 250;        // distanza minima verticale
let cuore;
let coppa;

let viteMax = 5;
let vite = 5;

let skierSpeedX;              // negativa = sinistra, positiva = destra

let lastLifeLossFrame = 0;
let lifeLossCooldown = 20;    // ~0.4 secondi

let pistaOffsetY = 0;
let pistaSpeed = 6;           // velocità scorrimento pista

let canzone;
let parti;

let playerX = 300;            // posizione orizzontale dello sciatore
let playerSpeed = 8;

let playerDir = "right";
let playerW = 120;

let x_sx_gameover_restart = 482;
let x_dx_gameover_restart = 948;
let y_so_gameover_restart = 275;
let y_st_gameover_restart = 354;

let x_sx_gameover_exit = 482;
let x_dx_gameover_exit = 948;
let y_so_gameover_exit = 377;
let y_st_gameover_exit = 450;

let schemaAttuale;
  //-2: start
  //-1: tutorial
  //0: pausa
  //1: gioco
  //2: gameOver
let oldSchema;

let start_image;
let pause_image;
let tutorial_image;
let game_over;

let x_sx = 431;
let x_dx = 1048;
let y_so = 226;
let y_st = 429;

let x_sx_pausa_riprendi = 483;
let x_dx_pausa_riprendi = 941;
let y_so_pausa_riprendi = 282;
let y_st_pausa_riprendi = 356;

let x_sx_pausa_esci = 483;
let x_dx_pausa_esci = 941;
let y_so_pausa_esci = 378;
let y_st_pausa_esci = 453;

let video;
let bodyPose;
let poses = [];
let connections;

let aggiornamentiPista = 0;
let vittoriaMostrata = false;

function preload(){
    bodyPose = ml5.bodyPose();
    player = loadImage('./img/sciatore.png');
    pista = loadImage('./img/prova.png');
    start_image = loadImage('./img/start_image.png');
    pause_image = loadImage('./img/pause.jpg');
    tutorial_image = loadImage('./img/tutorial.png');
    game_over = loadImage('./img/game_over.jpg');
    canzone = loadSound('./img/lavoro.mp3');
    player_s = loadImage('./img/sciatore_sx.png');
    parti = false;
    bandierina = loadImage('./img/bandierina.png');
    cuore = loadImage('./img/cuore.png');
    coppa = loadImage('./img/coppa.jpeg');
}

function setup(){
    createCanvas(start_image.width, start_image.height);
    frameRate(50);
    //player = new Player(player, playerX, 500);
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();
    bodyPose.detectStart(video, gotPoses);
    connections = bodyPose.getSkeleton();
    schemaAttuale = -2;
    oldSchema = schemaAttuale;
}

function draw() {
  if(schemaAttuale == -2)
    image(start_image, 0, 0);
  else if (schemaAttuale == -1){
    background(tutorial_image);
  } else if(schemaAttuale == 0){
    background(pause_image);
  } else if(schemaAttuale == 1){
    background(pista);
    drawScrollingPista();
    updatePlayerFromPose();
    updateAndDrawBandierine();
    drawVite();
    checkDribbling();

    if (playerDir === "left") {
      image(player_s, playerX, 500, playerW, player_s.height * (playerW / player_s.width));
    } else {
      image(player, playerX, 500, playerW, player.height * (playerW / player.width));
    }

    if (vittoriaMostrata) {
      mostraVittoria();
    }

  } else if(schemaAttuale == 2){
    background(game_over);
  }

  let camW = 250;
  let camH = 200;
  let offX = width - camW - 10;
  let offY = height - camH - 10;
  image(video, offX, offY, camW, camH);

  // Draw the skeleton connections
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < connections.length; j++) {
      let pointAIndex = connections[j][0];
      let pointBIndex = connections[j][1];
      let pointA = pose.keypoints[pointAIndex];
      let pointB = pose.keypoints[pointBIndex];
      if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
        stroke(255, 0, 0);
        strokeWeight(2);
        let ax = offX + (pointA.x / video.width) * camW;
        let ay = offY + (pointA.y / video.height) * camH;
        let bx = offX + (pointB.x / video.width) * camW;
        let by = offY + (pointB.y / video.height) * camH;
        line(ax, ay, bx, by);
      }
    }
  }

  // Draw all the tracked landmark points
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      if (keypoint.confidence > 0.1) {
        fill(0, 255, 0);
        noStroke();
        let x = offX + (keypoint.x / video.width) * camW;
        let y = offY + (keypoint.y / video.height) * camH;
        circle(x, y, 10);
      }
    }
  }
}

function gotPoses(results) {
  poses = results;
}

function musica(){}

function mouseClicked() {
  if (!parti && schemaAttuale == -2) {
    canzone.play(); parti = true
  }

  if(schemaAttuale == -2){
    if(mouseX >= x_sx && mouseX <= x_dx && mouseY >= y_so && mouseY <= y_st){
      schemaAttuale = -1;
      setTimeout(() => {
        schemaAttuale = 1;
      }, 7000);
    }
    
  } else if(schemaAttuale == 2){
      if(mouseX > x_sx_gameover_restart && mouseX < x_dx_gameover_restart && mouseY > y_so_gameover_restart && mouseY < y_st_gameover_restart){
          schemaAttuale = 1;
          vite = 5;
        }
      else{
        if(mouseX > x_sx_gameover_exit && mouseX < x_dx_gameover_exit && mouseY > y_so_gameover_exit && mouseY < y_st_gameover_exit){
          schemaAttuale = -2;
          vite = 5;
        }
      }
  } else if(schemaAttuale == 0){
    if(mouseX > x_sx_pausa_riprendi && mouseX < x_dx_pausa_riprendi && mouseY > y_so_pausa_riprendi && mouseY < y_st_pausa_riprendi){
        schemaAttuale = 1;
      }
      if(mouseX > x_sx_pausa_esci && mouseX < x_dx_pausa_esci && mouseY > y_so_pausa_esci && mouseY < y_st_pausa_esci){
        schemaAttuale = -2;
      }
  }
}

function keyPressed(){
  if (key == 'p' || key == "Escape") {
    if (schemaAttuale != 0) {
      oldSchema = schemaAttuale;
      schemaAttuale = 0;
    } else {
      schemaAttuale = oldSchema;
    }
  }
}

function updatePlayerFromPose() {
  if (poses.length === 0) return;
  let pose = poses[0];
  let nose = pose.keypoints.find(k => k.name === "nose");
  if (!nose || nose.confidence < 0.2) return;
  let noseX = nose.x;
  let center = video.width / 2;
  let deadZone = 40;

  let oldX = playerX;   // salva posizione precedente

  if (noseX < center - deadZone) {
    playerX -= playerSpeed;
    playerDir = "left";
  } else if (noseX > center + deadZone) {
    playerX += playerSpeed;
    playerDir = "right";
  }

  skierSpeedX = playerX - oldX;   // calcola la velocità corrente

  playerX = constrain(playerX, 0, width - playerW);
}


function drawScrollingPista() {
  pistaOffsetY += pistaSpeed;
  if (pistaOffsetY >= height) {
    pistaOffsetY = 0;
  }
  image(pista, 0, pistaOffsetY - height, width, height);    
  image(pista, 0, pistaOffsetY, width, height);

  aggiornamentiPista++;

  if (aggiornamentiPista >= 5000 && !vittoriaMostrata) {
    vittoriaMostrata = true;
  }
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
      let dx = abs(x - b.x);
      let dy = abs(y - b.y);
      if (dx < safeOffsetX) {
        valid = false;
        break;
      }
      if (dy < safeOffsetY) {
        valid = false;
        break;
      }
    }
    tries++;
  }

  if (valid) {
    bandierine.push({
      x: x,
      y: y,
      checked: false
    });
  }
}

function updateAndDrawBandierine() {
  for (let i = bandierine.length - 1; i >= 0; i--) {
    let b = bandierine[i];
    b.y += pistaSpeed;
    image(bandierina, b.x, b.y, bandierinaW, 90);
    if (b.y > height + 50) {
      bandierine.splice(i, 1);
    }
  }
  if (bandierine.length < maxBandierine && frameCount % 40 === 0) {
    spawnBandierina();
  }
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
      let skierCenter = playerX + playerW / 2;
      let bandCenter = b.x + bandierinaW / 2;
      let staAndandoASinistra = skierSpeedX < 0;
      let staAndandoADestra = skierSpeedX > 0;
      let passedWrongSide = false;
      // Caso 1: va a sinistra → DEVE stare a sinistra della bandierina
      if (staAndandoASinistra) {
        if (skierCenter > bandCenter) {
          passedWrongSide = true;
        }
      }
      // Caso 2: va a destra → DEVE stare a destra della bandierina
      if (staAndandoADestra) {
        if (skierCenter < bandCenter) {
          passedWrongSide = true;
        }
      }
      if (passedWrongSide) {
        loseLife();
      }
    }
  }
}

function loseLife() {
  if (frameCount - lastLifeLossFrame < lifeLossCooldown) return;
  lastLifeLossFrame = frameCount;
  vite--;
  if (vite == 0) {
    schemaAttuale = 2;
  }
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