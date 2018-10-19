function getScale(domain, range) {
  const slope = (range[1] - range[0]) / (domain[1] - domain[0]);
  const intercept = range[0] - slope * domain[0];

  function scale(val) {
    return slope * val + intercept;
  }

  scale.invert = function(val) {
    return (val - intercept) / slope;
  }

  return scale;
}

function getClipper(min, max, step) {
  return (val) => {
    const clippedValue = Math.round(val / step) * step;
    const fixed = Math.max(Math.log10(1 / step), 0);
    const fixedValue = clippedValue.toFixed(fixed); // fix floating point errors
    return Math.min(max, Math.max(min, parseFloat(fixedValue)));
  }
}

/**
 * @module gui-components
 */

/**
 * Versatile canvas based slider.
 *
 * @param {Object} options - Override default parameters.
 * @param {'jump'|'proportionnal'|'handle'} [options.mode='jump'] - Mode of the slider:
 *  - in 'jump' mode, the value is changed on 'touchstart' or 'mousedown', and
 *    on move.
 *  - in 'proportionnal' mode, the value is updated relatively to move.
 *  - in 'handle' mode, the slider can be grabbed only around its value.
 * @param {Function} [options.callback] - Callback to be executed when the value
 *  of the slider changes.
 * @param {Number} [options.width=200] - Width of the slider.
 * @param {Number} [options.height=30] - Height of the slider.
 * @param {Number} [options.min=0] - Minimum value.
 * @param {Number} [options.max=1] - Maximum value.
 * @param {Number} [options.step=0.01] - Step between each consecutive values.
 * @param {Number} [options.default=0] - Default value.
 * @param {String|Element} [options.container='body'] - CSS Selector or DOM
 *  element in which inserting the slider.
 * @param {String} [options.backgroundColor='#464646'] - Background color of the
 *  slider.
 * @param {String} [options.foregroundColor='steelblue'] - Foreground color of
 *  the slider.
 * @param {'horizontal'|'vertical'} [options.orientation='horizontal'] -
 *  Orientation of the slider.
 * @param {Array} [options.markers=[]] - List of values where markers should
 *  be displayed on the slider.
 * @param {Boolean} [options.showHandle=true] - In 'handle' mode, define if the
 *  draggable should be show or not.
 * @param {Number} [options.handleSize=20] - Size of the draggable zone.
 * @param {String} [options.handleColor='rgba(255, 255, 255, 0.7)'] - Color of the
 *  draggable zone (when `showHandle` is `true`).
 *
 * @example
 * import { Slider} from 'gui-components';
 *
 * const slider = new Slider({
 *   mode: 'jump',
 *   container: '#container',
 *   default: 0.6,
 *   markers: [0.5],
 *   callback: (value) => console.log(value),
 * });
 */
class Slider {
  constructor(options) {
    const defaults = {
      mode: 'jump',
      callback: value => {},
      width: 200,
      height: 30,
      min: 0,
      max: 1,
      step: 0.01,
      default: 0,
      container: 'body',
      backgroundColor: '#464646',
      foregroundColor: 'steelblue',
      orientation: 'horizontal',
      markers: [],

      // handle specific options
      showHandle: true,
      handleSize: 20,
      handleColor: 'rgba(255, 255, 255, 0.7)',
    };

    this.params = Object.assign({}, defaults, options);
    this._boundingClientRect = null;
    this._touchId = null;
    this._value = null;
    this._canvasWidth = null;
    this._canvasHeight = null;
    // for proportionnal mode
    this._currentMousePosition = { x: null, y: null };
    this._currentSliderPosition = null;

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove .bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);

    this._onResize = this._onResize.bind(this);


    this._createElement();

    // initialize
    this._resizeElement();
    this._setScales();
    this._bindEvents();
    this._onResize();
    this._updateValue(this.params.default, true, true);

    window.addEventListener('resize', this._onResize);
  }

  /**
   * Current value of the slider.
   *
   * @type {Number}
   */
  get value() {
    return this._value;
  }

  set value(val) {
    // don't trigger the callback when value is set from outside
    this._updateValue(val, true, false);
  }

  /**
   * Reset the slider to its default value.
   */
  reset() {
    this._updateValue(this.params.default);
  }

  /**
   * Resize the slider.
   *
   * @param {Number} width - New width of the slider.
   * @param {Number} height - New height of the slider.
   */
  resize(width, height) {
    this.params.width = width;
    this.params.height = height;

    this._resizeElement();
    this._setScales();
    this._onResize();
    this._updateValue(this._value, true, true);
  }

  _updateValue(value, silent = false, forceRender = false) {
    const { callback } = this.params;
    const clippedValue = this.clipper(value);

    // resize render but don't trigger callback
    if (clippedValue === this._value && forceRender === true)
      requestAnimationFrame(() => this._render(clippedValue));

    // trigger callback
    if (clippedValue !== this._value) {
      this._value = clippedValue;

      if (!silent)
        callback(clippedValue);

      requestAnimationFrame(() => this._render(clippedValue));
    }
  }

  _createElement() {
    const { container } = this.params;
    this.$canvas = document.createElement('canvas');
    this.ctx = this.$canvas.getContext('2d');

    if (container instanceof Element)
      this.$container = container;
    else
      this.$container = document.querySelector(container);

    this.$container.appendChild(this.$canvas);
  }

  _resizeElement() {
    const { width, height } = this.params;

    // logical and pixel size of the canvas
    this._pixelRatio = (function(ctx) {
    const dPR = window.devicePixelRatio || 1;
    const bPR = ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio || 1;

      return dPR / bPR;
    }(this.ctx));

    this._canvasWidth = width * this._pixelRatio;
    this._canvasHeight = height * this._pixelRatio;

    this.ctx.canvas.width = this._canvasWidth;
    this.ctx.canvas.height = this._canvasHeight;
    this.ctx.canvas.style.width = `${width}px`;
    this.ctx.canvas.style.height = `${height}px`;
  }

  _onResize() {
    this._boundingClientRect = this.$canvas.getBoundingClientRect();
  }

  _setScales() {
    const { orientation, width, height, min, max, step } = this.params;
    // define transfert functions
    const screenSize = orientation === 'horizontal' ?
      width : height;

    const canvasSize = orientation === 'horizontal' ?
      this._canvasWidth : this._canvasHeight;

    const domain = orientation === 'horizontal' ? [min, max] : [max, min];
    const screenRange = [0, screenSize];
    const canvasRange = [0, canvasSize];

    this.screenScale = getScale(domain, screenRange);
    this.canvasScale = getScale(domain, canvasRange);
    this.clipper = getClipper(min, max, step);
  }

  _bindEvents() {
    this.$canvas.addEventListener('mousedown', this._onMouseDown);
    this.$canvas.addEventListener('touchstart', this._onTouchStart);
  }

  _onStart(x, y) {
    let started = null;

    switch (this.params.mode) {
      case 'jump':
        this._updatePosition(x, y);
        started = true;
        break;
      case 'proportionnal':
        this._currentMousePosition.x = x;
        this._currentMousePosition.y = y;
        started = true;
        break;
      case 'handle':
        const orientation = this.params.orientation;
        const position = this.screenScale(this._value);
        const compare = orientation === 'horizontal' ? x : y;
        const delta = this.params.handleSize / 2;

        if (compare < position + delta && compare > position - delta) {
          this._currentMousePosition.x = x;
          this._currentMousePosition.y = y;
          started = true;
        } else {
          started = false;
        }
        break;
    }

    return started;
  }

  _onMove(x, y) {
    switch (this.params.mode) {
      case 'jump':
        break;
      case 'proportionnal':
      case 'handle':
        const deltaX = x - this._currentMousePosition.x;
        const deltaY = y - this._currentMousePosition.y;
        this._currentMousePosition.x = x;
        this._currentMousePosition.y = y;

        x = this.screenScale(this._value) + deltaX;
        y = this.screenScale(this._value) + deltaY;
        break;
    }

    this._updatePosition(x, y);
  }

  _onEnd() {
    switch (this.params.mode) {
      case 'jump':
        break;
      case 'proportionnal':
      case 'handle':
        this._currentMousePosition.x = null;
        this._currentMousePosition.y = null;
        break;
    }
  }

  // mouse events
  _onMouseDown(e) {
    const pageX = e.pageX;
    const pageY = e.pageY;
    const x = pageX - this._boundingClientRect.left;
    const y = pageY - this._boundingClientRect.top;

    if (this._onStart(x, y) === true) {
      window.addEventListener('mousemove', this._onMouseMove);
      window.addEventListener('mouseup', this._onMouseUp);
    }
  }

  _onMouseMove(e) {
    e.preventDefault(); // prevent text selection

    const pageX = e.pageX;
    const pageY = e.pageY;
    let x = pageX - this._boundingClientRect.left;;
    let y = pageY - this._boundingClientRect.top;;

    this._onMove(x, y);
  }

  _onMouseUp(e) {
    this._onEnd();

    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
  }

  // touch events
  _onTouchStart(e) {
    if (this._touchId !== null) return;

    const touch = e.touches[0];
    this._touchId = touch.identifier;

    const pageX = touch.pageX;
    const pageY = touch.pageY;
    const x = pageX - this._boundingClientRect.left;
    const y = pageY - this._boundingClientRect.top;

    if (this._onStart(x, y) === true) {
      window.addEventListener('touchmove', this._onTouchMove);
      window.addEventListener('touchend', this._onTouchEnd);
      window.addEventListener('touchcancel', this._onTouchEnd);
    }
  }

  _onTouchMove(e) {
    e.preventDefault(); // prevent text selection

    const touches = Array.from(e.touches);
    const touch = touches.filter((t) => t.identifier === this._touchId)[0];

    if (touch) {
      const pageX = touch.pageX;
      const pageY = touch.pageY;
      const x = pageX - this._boundingClientRect.left;
      const y = pageY - this._boundingClientRect.top;

      this._onMove(x, y);
    }
  }

  _onTouchEnd(e) {
    const touches = Array.from(e.touches);
    const touch = touches.filter((t) => t.identifier === this._touchId)[0];

    if (touch === undefined) {
      this._onEnd();
      this._touchId = null;

      window.removeEventListener('touchmove', this._onTouchMove);
      window.removeEventListener('touchend', this._onTouchEnd);
      window.removeEventListener('touchcancel', this._onTouchEnd);

    }
  }

  _updatePosition(x, y) {
    const { orientation, height } = this.params;
    const position = orientation === 'horizontal' ? x : y;
    const value = this.screenScale.invert(position);

    this._updateValue(value, false, true);
  }

  _render(clippedValue) {
    const { backgroundColor, foregroundColor, orientation } = this.params;
    const canvasPosition = Math.round(this.canvasScale(clippedValue));
    const width = this._canvasWidth;
    const height = this._canvasHeight;
    const ctx = this.ctx;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // foreground
    ctx.fillStyle = foregroundColor;

    if (orientation === 'horizontal')
      ctx.fillRect(0, 0, canvasPosition, height);
    else
      ctx.fillRect(0, canvasPosition, width, height);

    // markers
    const markers = this.params.markers;

    for (let i = 0; i < markers.length; i++) {
      const marker = markers[i];
      const position = this.canvasScale(marker);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();

      if (orientation === 'horizontal') {
        ctx.moveTo(position - 0.5, 1);
        ctx.lineTo(position - 0.5, height - 1);
      } else {
        ctx.moveTo(1, height - position + 0.5);
        ctx.lineTo(width - 1, height - position + 0.5);
      }

      ctx.closePath();
      ctx.stroke();
    }

    // handle mode
    if (this.params.mode === 'handle' && this.params.showHandle) {
      const delta = this.params.handleSize * this._pixelRatio / 2;
      const start = canvasPosition - delta;
      const end = canvasPosition + delta;

      ctx.globalAlpha = 1;
      ctx.fillStyle = this.params.handleColor;

      if (orientation === 'horizontal') {
        ctx.fillRect(start, 0, end - start, height);
      } else {
        ctx.fillRect(0, start, width, end - start);
      }
    }

    ctx.restore();
  }
}

export default Slider;
