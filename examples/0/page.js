var generationElement;
var blElement;
var boElement;
var alElement;
var aoElement;
var btElement;
var atElement;
function initializeDisplay() {
  generationElement = select('#generation');
  blElement = select('#bl');
  boElement = select('#bo');
  alElement = select('#al');
  aoElement = select('#ao');
  btElement = select('#bt');
  atElement = select('#at');

}
function updateDisplay() {
    generationElement.html(generation);
    blElement.html(nf(highestFitnessLastTurn,0,2));
    boElement.html(nf(highestFitnessOverall,0,2));
    alElement.html(nf(averageFitnessLastTurn,0,2));
    aoElement.html(nf(averageFitnessOverall,0,2));
    btElement.html(nf(currentBest,0,2));
    atElement.html(nf(currentAverage,0,2));
}
