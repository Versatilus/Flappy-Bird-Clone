// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/cXgA1d_E-jY

// P5 exported functions (eslint flags)
/* exported preload, setup, draw, keyPressed */

// Exported sprites (eslint flags)
/* exported birdSprite, pipeBodySprite, pipePeakSprite */

var MAX_BIRDS = 25; // two slots saved for best performers
var MUTATION_RATE = 0.1;
// var
var BIRD_SIZE = 64;
var brainTrust = { fittestOverall: null, fittestLastTurn: null };
var generation = 0,
  highestFitnessOverall = 0,
  highestFitnessLastTurn = 0,
  averageFitnessOverall = 0,
  averageFitnessLastTurn = 0,
  totalFitnessLastTurn = 0;
  currentBest = 0,
  currentAverage = 0,
  currentTotal = 0;
var pipes = [];
var nextPipe;
var lastPipe;
var parallax = 0.8;
var score = 0;
var maxScore = 0;
var birdSprite;
var pipeBodySprite;
var pipePeakSprite;
var bgImg;
var bgX;
var gameoverFrame = 0;
var isOver = false;

var touched = false;
var prevTouched = touched;

function addBird(brain = null) {
  let bird = new Bird();
  bird.brain = brain ? new NeuralNetwork(brain) : new NeuralNetwork(4, 16, 2);
  bird.brain.setActivationFunction({ func: (x) => (x > 0 ? x : 0) });
  // bird.brain.setActivationFunction({ func: (x) => (2/exp(-2*x)-1) });
  return bird;
}

function preload() {
  pipeBodySprite = loadImage('graphics/pipe_marshmallow_blue.png');
  pipePeakSprite = loadImage('graphics/pipe_marshmallow_blue.png');
  birdSprite = loadImage('graphics/train.png');
  bgImg = loadImage('graphics/background.png');
}

var birds;

function setup() {
  colorMode(HSB, 1, 1, 1, 1);
  createCanvas(800, 600).parent('container');
  reset();
  initializeDisplay();
}

function draw() {
  background(0);
  // Draw our background image, then move it at the same speed as the pipes
  image(bgImg, bgX, 0, bgImg.width, height);
  bgX -= pipes[0].speed * parallax;

  // this handles the "infinite loop" by checking if the right
  // edge of the image would be on the screen, if it is draw a
  // second copy of the image right next to it
  // once the second image gets to the 0 point, we can reset bgX to
  // 0 and go back to drawing just one image.
  if (bgX <= -bgImg.width + width) {
    image(bgImg, bgX + bgImg.width, 0, bgImg.width, height);
    if (bgX <= -bgImg.width) {
      bgX = 0;
    }
  }

  for (var i = pipes.length - 1; i >= 0; i--) {
    pipes[i].update();
    pipes[i].show();

    if (pipes[i].offscreen()) {
      pipes.splice(i, 1);
    }
  }
  let spacing = nextPipe.spacing;
  let pipeGapCenter = nextPipe.top + spacing * 0.5;
  let pipeX = nextPipe.x;
  let cw = canvas.width,
    ch = canvas.height;
    currentTotal=0;
  for (let bird of birds) {
    if (nextPipe.hits(bird) || lastPipe.hits(bird)) {
      bird.dead = true;
    }
    if (bird.dead === false) {
      let fitnessModifier;
      if(bird.y > pipeGapCenter){
        fitnessModifier = 2 * (1-(bird.y - pipeGapCenter)/(ch-bird.height*.5-pipeGapCenter))
        *(1-(pipeX-bird.x)/(cw-bird.x));
      }else{
        fitnessModifier = 2 * (1-(pipeGapCenter-bird.y)/(pipeGapCenter-bird.height*.5))
        *(1-(pipeX-bird.x)/(cw-bird.x));}
      bird.fitness += fitnessModifier * (2*score + 1);
      // bird.fitness += 1*(1+score);
      // if (frameCount%4===0) {
      let action = bird.brain.predict([
        bird.y / ch,
        pipeX / cw,
        nextPipe. top / ch,
        nextPipe.bottom / ch
        // pipeGapCenter / ch
        // constrain(bird.velocity/5-1,-1,1),
        // (bird.y-pipeGapCenter)/spacing
      ]);
      if (action[0] > action[1]) {
        // if (action[0] / action.reduce((a, b) => a + b, 0) > 0.5) {
        bird.up();
      }
      // }
      bird.update();
      bird.show();
      currentBest = bird.fitness>currentBest?bird.fitness:currentBest;
      currentTotal += bird.fitness;
    }
    currentAverage=currentTotal/birds.length;
  }
  // if ((frameCount - gameoverFrame) % 150 == 0) {
  if ((frameCount - gameoverFrame) % ~~(350/pipes[0].speed) == 0) {
    pipes.push(new Pipe());
  }
  let scratchPipe = findNextPipe();
  if (scratchPipe !== nextPipe) {
    score++;
    lastPipe = nextPipe;
    nextPipe = scratchPipe;
  }
  showScores();
  if (birds.every((x) => x.dead)) gameover();
  if (frameCount%6===0)  updateDisplay();
}

function showScores() {
  maxScore = max(score, maxScore);
  textSize(32);
  text('score: ' + score, 1, 32);
  text('record: ' + maxScore, 1, 64);
}

function gameover() {
  isOver = true;
  generation++;
  let lastHighest = 0;
  let lastFittest;
  totalFitnessLastTurn = 0;
  for (var i = 0, end = birds.length; i < end; i++) {
    let scratch = birds[i].fitness;
    totalFitnessLastTurn += scratch;
    if (lastHighest < scratch) {
      lastFittest = birds[i];
      lastHighest = scratch;
    }
  }
  brainTrust.fittestLastTurn = lastFittest.brain.copy();
  highestFitnessLastTurn = lastHighest;
  if (lastHighest >= highestFitnessOverall) {
    brainTrust.fittestOverall = brainTrust.fittestLastTurn.copy();
    highestFitnessOverall = lastHighest;
  }
  averageFitnessLastTurn = totalFitnessLastTurn / birds.length;
  averageFitnessOverall =
    (averageFitnessOverall + averageFitnessLastTurn) * 0.5;
  currentBest = 0;
  currentTotal = 0;
  reset();
}

function reset() {
  isOver = false;
  score = 0;
  bgX = 0;
  crossover();
  pipes = [];
  pipes.push(new Pipe());
  nextPipe = pipes[0];
  lastPipe = nextPipe;
  gameoverFrame = frameCount - 1;
  // loop();
}

function findNextPipe() {
  let scratch = null;
  let birdX = birds[0].x;
  let birdW = birds[0].width * 0.5 + 1;
  for (let pipe of pipes) {
    if (pipe.x + pipe.w + 1 > birdX - birdW) {
      if (scratch === null) scratch = pipe;
      if (scratch.x > pipe.x) scratch = pipe;
    }
  }
  return scratch;
}

function crossover() {
  let newBirds = [];
  if (birds) {
    let matingPool = [];
    let total = birds.reduce((a,b)=>a+exp(b.fitness), 0)
    for (let bird of birds) {
      for (
        let i = 0, end = ~~(exp(bird.fitness) / total * 1000) + 1;
        i < end;
        ++i
      ) {
        matingPool.push(bird);
      }
    }
    birds.sort((a, b) => b.fitness - a.fitness);
    newBirds.push(addBird(brainTrust.fittestOverall.copy()));
    newBirds.push(addBird(brainTrust.fittestLastTurn.copy()));
    for (let i = 0, end = ~~(birds.length * 0.8) - 2; i < end; ++i) {
      let partner = random(matingPool).brain.copy();
      scratch = addBird(birds[i].brain.copy());
      scratch.brain.combine(partner, 1 - (i + 1) / end);
      scratch.brain.mutate(0.1);
      newBirds.push(scratch);
    }
  }
  while (newBirds.length < MAX_BIRDS) {
    newBirds.push(addBird());
  }
  // newBirds.forEach((x, i, arr)s => (x.tint = [i / arr.length, 1, 1, 0.5]));
  birds = newBirds;
}
