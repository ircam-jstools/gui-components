import { Matrix } from 'gui-components';
import * as masters from 'waves-masters'

const numSteps = 16;
const tempo = 240;
const period = 60 / tempo;

const $container = document.querySelector('#container');
const width = $container.getBoundingClientRect().width;

const displayBeatMatrix = new Matrix({
  container: $container,
  numCols: numSteps,
  numRows: 1,
  width: width,
  height: 10,
});

const controlMatrix = new Matrix({
  container: $container,
  numCols: numSteps,
  numRows: 24,
  width: width,
  height: 300,
});

window.addEventListener('resize', () => {
  const width = $container.getBoundingClientRect().width;

  displayBeatMatrix.resize(width, null);
  controlMatrix.resize(width, null);
});

const audioContext = new AudioContext();
const scheduler = new masters.Scheduler(() => {
  return audioContext.currentTime;
});

class DisplayBeatEngine extends masters.TimeEngine {
  constructor(period) {
    super();

    this.period = period;
    this.step = -1;
  }

  advanceTime(time) {
    if (this.step >= 0) {
      displayBeatMatrix.setCellValue(this.step, 0, 0);
    }

    this.step = (this.step + 1) % numSteps;
    displayBeatMatrix.setCellValue(this.step, 0, 1);

    return time + this.period;
  }
}

class GridEngine extends masters.TimeEngine {
  constructor(period, score) {
    super();

    this.period = period;
    this.score = score; // score is a reference
    this.step = -1;
  }

  advanceTime(time) {
    this.step = (this.step + 1) % numSteps;
    const col = this.score[this.step];

    for (let i = 0; i < col.length; i++) {
      if (col[i] !== 0) {
        const invI = (col.length - 1) - i;
        const env = audioContext.createGain();
        env.connect(audioContext.destination);

        const sine = audioContext.createOscillator();
        sine.frequency.value = 220 * Math.pow(2, invI/12); // ???
        sine.connect(env);

        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(1, time + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, time + 0.1)

        sine.start(time);
        sine.stop(time + 0.1);
      }
    }

    return time + this.period;
  }
}

const displayBeatEngine = new DisplayBeatEngine(period);
const gridEngine = new GridEngine(period, controlMatrix.value);
scheduler.add(displayBeatEngine);
scheduler.add(gridEngine);

const $reset = document.querySelector('#reset');
$reset.addEventListener('click', () => controlMatrix.reset());


