import { Slider } from '../../../dist/index';

// jump
const $feedbackJump = document.querySelector('#feedback-jump');

const sliderJump = new Slider({
  mode: 'jump',
  container: '#slider-jump',
  min: 0,
  max: 1,
  default: 0.6,
  step: 0.001,
  backgroundColor: '#464646',
  foregroundColor: 'steelblue',
  markers: [0.7],
  orientation: 'horizontal', // 'vertical'
  width: 400,
  height: 30,
  callback: (val) => $feedbackJump.textContent = val,
});

// make sure callback is not triggered when updating manually
setTimeout(() => {
  const oldCallback = sliderJump.params.callback;
  const testValue = 1;
  sliderJump.params.callback = (value) => {
    if (value == testValue)
      throw new Error('`slider.value = newValue` should be silent');
  }

  sliderJump.value = testValue;
  sliderJump.params.callback = oldCallback;
}, 500);

// proportionnal
const $feedbackProportionnal = document.querySelector('#feedback-proportionnal');

const sliderProportionnal = new Slider({
  mode: 'proportionnal',
  container: '#slider-proportionnal',
  min: -50,
  max: 50,
  default: 20,
  step: 0.1,
  backgroundColor: '#464646',
  foregroundColor: 'steelblue',
  markers: [0],
  orientation: 'vertical', // 'vertical'
  width: 30,
  height: 300,
  callback: (val) => $feedbackProportionnal.textContent = val,
});

// handle
const $feedbackHandle = document.querySelector('#feedback-handle');

const sliderHandle = new Slider({
  mode: 'handle',
  container: '#slider-handle',
  min: -50,
  max: 50,
  default: 20,
  step: 0.1,
  backgroundColor: '#464646',
  foregroundColor: 'steelblue',
  markersColor: 'orange',
  markers: [0],
  orientation: 'horizontal', // 'vertical'
  width: 300,
  height: 300,

  // handle specific params
  showHandle: true,
  handleSize: 20,
  handleColor: 'rgba(255, 255, 255, 0.3)',
  callback: (val) => $feedbackHandle.textContent = val,
});

