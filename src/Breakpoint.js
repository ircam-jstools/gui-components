class Breakpoint {
  constructor(options) {
    const defaults = {
      callback: value => {},
      width: 300,
      height: 150,
      container: 'body',
      default: [],
      radius: 4,
    };

    this.params = Object.assign({}, defaults, options);

    this._values = {
      norm: [],
      logical: [],
      displayed: [],
    }

    this._createElement();

    // initialize
    this._resizeElement();

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    this._onResize = this._onResize.bind(this);

    this._onResize();
    this._bindEvents();

    window.addEventListener('resize', this._onResize);
  }

  get values() {

  }

  set values(values) {

  }

  /** @note - same as Slider */
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

  /** @note - same as Slider */
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

  resize(width, height) {

    // update this.dots.displayed according to new width and height
  }

  /** @note - same as Slider */
  _onResize() {
    this._boundingClientRect = this.$canvas.getBoundingClientRect();
  }

  _bindEvents() {
    this.$canvas.addEventListener('mousedown', this._onMouseDown);
  }

  _onMouseDown(e)  {
    const pageX = e.pageX;
    const pageY = e.pageY;
    const x = pageX - this._boundingClientRect.left;
    const y = pageY - this._boundingClientRect.top;

    if (this._testHit(x, y)) {
      // bind mousemove and mouseup
      console.log('hit');
    } else {
      // create a new point
      console.log('create dot');
      this._createDot(x, y);
    }
  }

  _onMouseMove() {

  }

  _onMouseUp() {

  }

  // test if given x, y (in pixels) match some already displayed values
  _testHit(x, y) {
    const displayedValues = this._values.displayed;
    const radius = this.params.radius;

    for (let i = 0; i < displayedValues.length; i++) {
      const dot = displayedValues[i];
      const dx = dot[0] - x;
      const dy = dot[1] - y;
      const mag = Math.sqrt(dx * dx + dy * dy);

      if (mag <= radius)
        return true;
    }

    return false;
  }

  _createDot(x, y) {
    const normX = x / this.params.width;
    const normY = y / this.p$arams.height;
  }
}

export default Breakpoint;
