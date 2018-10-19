(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseComponent = function () {
  function BaseComponent(options) {
    _classCallCheck(this, BaseComponent);
  }

  // base components


  _createClass(BaseComponent, [{
    key: 'setParameter',
    value: function setParameter(name, value) {
      // ...
    }
  }, {
    key: 'reset',
    value: function reset() {
      throw new Error('not implemented');
    }
  }, {
    key: 'resize',
    value: function resize(width, height) {
      throw new Error('not implemented');
    }
  }, {
    key: 'value',
    get: function get() {
      throw new Error('not implemented');
    },
    set: function set(val) {
      throw new Error('not implemented');
    }
  }]);

  return BaseComponent;
}();

exports.default = BaseComponent;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Breakpoint = function () {
  function Breakpoint(options) {
    _classCallCheck(this, Breakpoint);

    var defaults = {
      callback: function callback(value) {},
      width: 300,
      height: 150,
      container: 'body',
      default: [],
      radius: 4
    };

    this.params = Object.assign({}, defaults, options);

    this._values = {
      norm: [],
      logical: [],
      displayed: []
    };

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

  _createClass(Breakpoint, [{
    key: '_createElement',


    /** @note - same as Slider */
    value: function _createElement() {
      var container = this.params.container;

      this.$canvas = document.createElement('canvas');
      this.ctx = this.$canvas.getContext('2d');

      if (container instanceof Element) this.$container = container;else this.$container = document.querySelector(container);

      this.$container.appendChild(this.$canvas);
    }

    /** @note - same as Slider */

  }, {
    key: '_resizeElement',
    value: function _resizeElement() {
      var _params = this.params,
          width = _params.width,
          height = _params.height;

      // logical and pixel size of the canvas

      this._pixelRatio = function (ctx) {
        var dPR = window.devicePixelRatio || 1;
        var bPR = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;

        return dPR / bPR;
      }(this.ctx);

      this._canvasWidth = width * this._pixelRatio;
      this._canvasHeight = height * this._pixelRatio;

      this.ctx.canvas.width = this._canvasWidth;
      this.ctx.canvas.height = this._canvasHeight;
      this.ctx.canvas.style.width = width + 'px';
      this.ctx.canvas.style.height = height + 'px';
    }
  }, {
    key: 'resize',
    value: function resize(width, height) {}

    // update this.dots.displayed according to new width and height


    /** @note - same as Slider */

  }, {
    key: '_onResize',
    value: function _onResize() {
      this._boundingClientRect = this.$canvas.getBoundingClientRect();
    }
  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      this.$canvas.addEventListener('mousedown', this._onMouseDown);
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(e) {
      var pageX = e.pageX;
      var pageY = e.pageY;
      var x = pageX - this._boundingClientRect.left;
      var y = pageY - this._boundingClientRect.top;

      if (this._testHit(x, y)) {
        // bind mousemove and mouseup
        console.log('hit');
      } else {
        // create a new point
        console.log('create dot');
        this._createDot(x, y);
      }
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove() {}
  }, {
    key: '_onMouseUp',
    value: function _onMouseUp() {}

    // test if given x, y (in pixels) match some already displayed values

  }, {
    key: '_testHit',
    value: function _testHit(x, y) {
      var displayedValues = this._values.displayed;
      var radius = this.params.radius;

      for (var i = 0; i < displayedValues.length; i++) {
        var dot = displayedValues[i];
        var dx = dot[0] - x;
        var dy = dot[1] - y;
        var mag = Math.sqrt(dx * dx + dy * dy);

        if (mag <= radius) return true;
      }

      return false;
    }
  }, {
    key: '_createDot',
    value: function _createDot(x, y) {
      var normX = x / this.params.width;
      var normY = y / this.p$arams.height;
    }
  }, {
    key: 'values',
    get: function get() {},
    set: function set(values) {}
  }]);

  return Breakpoint;
}();

exports.default = Breakpoint;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseComponent2 = require('./BaseComponent');

var _BaseComponent3 = _interopRequireDefault(_BaseComponent2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ns = 'http://www.w3.org/2000/svg';

var Matrix = function (_BaseComponent) {
  _inherits(Matrix, _BaseComponent);

  function Matrix(options) {
    _classCallCheck(this, Matrix);

    var _this = _possibleConstructorReturn(this, (Matrix.__proto__ || Object.getPrototypeOf(Matrix)).call(this));

    var defaults = {
      callback: function callback() {},
      container: 'body',
      numCols: 4,
      numRows: 4,
      width: 400,
      height: 400,
      trigger: 'touch' // 'aftertouch'
    };

    _this.params = Object.assign({}, defaults, options);

    _this._$svg = null;
    _this._$cells = null;

    _this._onMouseDown = _this._onMouseDown.bind(_this);
    _this._onMouseMove = _this._onMouseMove.bind(_this);
    _this._onMouseUp = _this._onMouseUp.bind(_this);

    _this._createValue();
    _this._createElement();
    _this._render();
    return _this;
  }

  _createClass(Matrix, [{
    key: 'setCellValue',
    value: function setCellValue(x, y, value) {
      this._values[x][y] = value;
      // dispatch value
      this.params.callback(this._values);
      this._render();
    }
  }, {
    key: 'toggleCell',
    value: function toggleCell(x, y) {
      var value = this._values[x][y];
      this.setCellValue(x, y, 1 - value);
    }
  }, {
    key: 'setParameter',
    value: function setParameter(name, value) {
      // ...
    }
  }, {
    key: 'reset',
    value: function reset() {
      var _params = this.params,
          numCols = _params.numCols,
          numRows = _params.numRows;


      for (var x = 0; x < numCols; x++) {
        for (var y = 0; y < numRows; y++) {
          this._values[x][y] = 0;
        }
      }

      this.params.callback(this._values);
      this._render();
    }
  }, {
    key: 'resize',
    value: function resize() {}
  }, {
    key: '_resize',
    value: function _resize(width, height) {
      var _params2 = this.params,
          container = _params2.container,
          numCols = _params2.numCols,
          numRows = _params2.numRows;


      var cellWidth = width / numCols;
      var cellHeight = height / numRows;

      for (var x = 0; x < numCols; x++) {
        for (var y = 0; y < numRows; y++) {
          var $cell = this._$cells[x][y];
          $cell.setAttribute('width', cellWidth);
          $cell.setAttribute('height', cellHeight);
          $cell.setAttribute('x', cellWidth * x);
          $cell.setAttribute('y', cellHeight * y);
        }
      }
    }
  }, {
    key: '_createValue',
    value: function _createValue() {
      var _params3 = this.params,
          numCols = _params3.numCols,
          numRows = _params3.numRows;


      this._values = [];
      // define if row first or colFirst
      for (var x = 0; x < numCols; x++) {
        var col = [];

        for (var y = 0; y < numRows; y++) {
          col[y] = 0;
        }

        this._values[x] = col;
      }
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(e) {
      this._$svg.addEventListener('mousemove', this._onMouseMove);
      window.addEventListener('mouseup', this._onMouseUp);

      var $cell = e.target;
      var _$cell$dataset = $cell.dataset,
          x = _$cell$dataset.x,
          y = _$cell$dataset.y;


      this.toggleCell(x, y);
      this._$lastCell = $cell;
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(e) {
      var $cell = e.target;

      if (this._$lastCell !== $cell) {
        var _$cell$dataset2 = $cell.dataset,
            x = _$cell$dataset2.x,
            y = _$cell$dataset2.y;


        this.toggleCell(x, y);
        this._$lastCell = $cell;
      }
    }
  }, {
    key: '_onMouseUp',
    value: function _onMouseUp() {
      this._$svg.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('mouseup', this._onMouseUp);
    }
  }, {
    key: '_createElement',
    value: function _createElement() {
      var _params4 = this.params,
          container = _params4.container,
          numCols = _params4.numCols,
          numRows = _params4.numRows,
          width = _params4.width,
          height = _params4.height;

      this._$svg = document.createElementNS(ns, 'svg');
      this._$svg.setAttributeNS(null, 'shape-rendering', 'optimizeSpeed');
      this._$svg.setAttribute('xmlns:xhtml', 'http://www.w3.org/1999/xhtml');

      this._$svg.style.width = width + 'px';
      this._$svg.style.height = height + 'px';
      this._$cells = [];

      for (var x = 0; x < numCols; x++) {
        var $coll = [];

        for (var y = 0; y < numRows; y++) {
          var $cell = document.createElementNS(ns, 'rect');
          // $cell.style.stroke = '#787878';
          $cell.setAttributeNS(null, 'stroke', '#787878');
          $cell.dataset.x = x;
          $cell.dataset.y = y;

          $coll[y] = $cell;
          this._$svg.appendChild($cell);
        }

        this._$cells[x] = $coll;
      }

      this._resize(width, height);

      var $container = document.querySelector(container);
      $container.appendChild(this._$svg);

      this._$svg.addEventListener('mousedown', this._onMouseDown);
    }
  }, {
    key: '_render',
    value: function _render() {
      var _params5 = this.params,
          numCols = _params5.numCols,
          numRows = _params5.numRows;


      for (var x = 0; x < numCols; x++) {
        for (var y = 0; y < numRows; y++) {
          var $cell = this._$cells[x][y];
          var value = this._values[x][y];

          if (value > 0) {
            $cell.setAttributeNS(null, 'fill', '#ffffff');
            $cell.setAttributeNS(null, 'fill-opacity', value);
          } else {
            $cell.setAttributeNS(null, 'fill', '#000000');
            $cell.setAttributeNS(null, 'fill-opacity', 1);
          }
        }
      }
    }
  }, {
    key: 'value',
    get: function get() {
      return this._values;
    }

    // maybe should work as reference
    ,
    set: function set(value) {
      this._values = _values;
    }
  }]);

  return Matrix;
}(_BaseComponent3.default);

exports.default = Matrix;

},{"./BaseComponent":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function getScale(domain, range) {
  var slope = (range[1] - range[0]) / (domain[1] - domain[0]);
  var intercept = range[0] - slope * domain[0];

  function scale(val) {
    return slope * val + intercept;
  }

  scale.invert = function (val) {
    return (val - intercept) / slope;
  };

  return scale;
}

function getClipper(min, max, step) {
  return function (val) {
    var clippedValue = Math.round(val / step) * step;
    var fixed = Math.max(Math.log10(1 / step), 0);
    var fixedValue = clippedValue.toFixed(fixed); // fix floating point errors
    return Math.min(max, Math.max(min, parseFloat(fixedValue)));
  };
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

var Slider = function () {
  function Slider(options) {
    _classCallCheck(this, Slider);

    var defaults = {
      mode: 'jump',
      callback: function callback(value) {},
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
      handleColor: 'rgba(255, 255, 255, 0.7)'
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
    this._onTouchMove = this._onTouchMove.bind(this);
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


  _createClass(Slider, [{
    key: 'reset',


    /**
     * Reset the slider to its default value.
     */
    value: function reset() {
      this._updateValue(this.params.default);
    }

    /**
     * Resize the slider.
     *
     * @param {Number} width - New width of the slider.
     * @param {Number} height - New height of the slider.
     */

  }, {
    key: 'resize',
    value: function resize(width, height) {
      this.params.width = width;
      this.params.height = height;

      this._resizeElement();
      this._setScales();
      this._onResize();
      this._updateValue(this._value, true, true);
    }
  }, {
    key: '_updateValue',
    value: function _updateValue(value) {
      var _this = this;

      var silent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var forceRender = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var callback = this.params.callback;

      var clippedValue = this.clipper(value);

      // resize render but don't trigger callback
      if (clippedValue === this._value && forceRender === true) requestAnimationFrame(function () {
        return _this._render(clippedValue);
      });

      // trigger callback
      if (clippedValue !== this._value) {
        this._value = clippedValue;

        if (!silent) callback(clippedValue);

        requestAnimationFrame(function () {
          return _this._render(clippedValue);
        });
      }
    }
  }, {
    key: '_createElement',
    value: function _createElement() {
      var container = this.params.container;

      this.$canvas = document.createElement('canvas');
      this.ctx = this.$canvas.getContext('2d');

      if (container instanceof Element) this.$container = container;else this.$container = document.querySelector(container);

      this.$container.appendChild(this.$canvas);
    }
  }, {
    key: '_resizeElement',
    value: function _resizeElement() {
      var _params = this.params,
          width = _params.width,
          height = _params.height;

      // logical and pixel size of the canvas

      this._pixelRatio = function (ctx) {
        var dPR = window.devicePixelRatio || 1;
        var bPR = ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;

        return dPR / bPR;
      }(this.ctx);

      this._canvasWidth = width * this._pixelRatio;
      this._canvasHeight = height * this._pixelRatio;

      this.ctx.canvas.width = this._canvasWidth;
      this.ctx.canvas.height = this._canvasHeight;
      this.ctx.canvas.style.width = width + 'px';
      this.ctx.canvas.style.height = height + 'px';
    }
  }, {
    key: '_onResize',
    value: function _onResize() {
      this._boundingClientRect = this.$canvas.getBoundingClientRect();
    }
  }, {
    key: '_setScales',
    value: function _setScales() {
      var _params2 = this.params,
          orientation = _params2.orientation,
          width = _params2.width,
          height = _params2.height,
          min = _params2.min,
          max = _params2.max,
          step = _params2.step;
      // define transfert functions

      var screenSize = orientation === 'horizontal' ? width : height;

      var canvasSize = orientation === 'horizontal' ? this._canvasWidth : this._canvasHeight;

      var domain = orientation === 'horizontal' ? [min, max] : [max, min];
      var screenRange = [0, screenSize];
      var canvasRange = [0, canvasSize];

      this.screenScale = getScale(domain, screenRange);
      this.canvasScale = getScale(domain, canvasRange);
      this.clipper = getClipper(min, max, step);
    }
  }, {
    key: '_bindEvents',
    value: function _bindEvents() {
      this.$canvas.addEventListener('mousedown', this._onMouseDown);
      this.$canvas.addEventListener('touchstart', this._onTouchStart);
    }
  }, {
    key: '_onStart',
    value: function _onStart(x, y) {
      var started = null;

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
          var orientation = this.params.orientation;
          var position = this.screenScale(this._value);
          var compare = orientation === 'horizontal' ? x : y;
          var delta = this.params.handleSize / 2;

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
  }, {
    key: '_onMove',
    value: function _onMove(x, y) {
      switch (this.params.mode) {
        case 'jump':
          break;
        case 'proportionnal':
        case 'handle':
          var deltaX = x - this._currentMousePosition.x;
          var deltaY = y - this._currentMousePosition.y;
          this._currentMousePosition.x = x;
          this._currentMousePosition.y = y;

          x = this.screenScale(this._value) + deltaX;
          y = this.screenScale(this._value) + deltaY;
          break;
      }

      this._updatePosition(x, y);
    }
  }, {
    key: '_onEnd',
    value: function _onEnd() {
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

  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(e) {
      var pageX = e.pageX;
      var pageY = e.pageY;
      var x = pageX - this._boundingClientRect.left;
      var y = pageY - this._boundingClientRect.top;

      if (this._onStart(x, y) === true) {
        window.addEventListener('mousemove', this._onMouseMove);
        window.addEventListener('mouseup', this._onMouseUp);
      }
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(e) {
      e.preventDefault(); // prevent text selection

      var pageX = e.pageX;
      var pageY = e.pageY;
      var x = pageX - this._boundingClientRect.left;;
      var y = pageY - this._boundingClientRect.top;;

      this._onMove(x, y);
    }
  }, {
    key: '_onMouseUp',
    value: function _onMouseUp(e) {
      this._onEnd();

      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('mouseup', this._onMouseUp);
    }

    // touch events

  }, {
    key: '_onTouchStart',
    value: function _onTouchStart(e) {
      if (this._touchId !== null) return;

      var touch = e.touches[0];
      this._touchId = touch.identifier;

      var pageX = touch.pageX;
      var pageY = touch.pageY;
      var x = pageX - this._boundingClientRect.left;
      var y = pageY - this._boundingClientRect.top;

      if (this._onStart(x, y) === true) {
        window.addEventListener('touchmove', this._onTouchMove);
        window.addEventListener('touchend', this._onTouchEnd);
        window.addEventListener('touchcancel', this._onTouchEnd);
      }
    }
  }, {
    key: '_onTouchMove',
    value: function _onTouchMove(e) {
      var _this2 = this;

      e.preventDefault(); // prevent text selection

      var touches = Array.from(e.touches);
      var touch = touches.filter(function (t) {
        return t.identifier === _this2._touchId;
      })[0];

      if (touch) {
        var pageX = touch.pageX;
        var pageY = touch.pageY;
        var x = pageX - this._boundingClientRect.left;
        var y = pageY - this._boundingClientRect.top;

        this._onMove(x, y);
      }
    }
  }, {
    key: '_onTouchEnd',
    value: function _onTouchEnd(e) {
      var _this3 = this;

      var touches = Array.from(e.touches);
      var touch = touches.filter(function (t) {
        return t.identifier === _this3._touchId;
      })[0];

      if (touch === undefined) {
        this._onEnd();
        this._touchId = null;

        window.removeEventListener('touchmove', this._onTouchMove);
        window.removeEventListener('touchend', this._onTouchEnd);
        window.removeEventListener('touchcancel', this._onTouchEnd);
      }
    }
  }, {
    key: '_updatePosition',
    value: function _updatePosition(x, y) {
      var _params3 = this.params,
          orientation = _params3.orientation,
          height = _params3.height;

      var position = orientation === 'horizontal' ? x : y;
      var value = this.screenScale.invert(position);

      this._updateValue(value, false, true);
    }
  }, {
    key: '_render',
    value: function _render(clippedValue) {
      var _params4 = this.params,
          backgroundColor = _params4.backgroundColor,
          foregroundColor = _params4.foregroundColor,
          orientation = _params4.orientation;

      var canvasPosition = Math.round(this.canvasScale(clippedValue));
      var width = this._canvasWidth;
      var height = this._canvasHeight;
      var ctx = this.ctx;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // foreground
      ctx.fillStyle = foregroundColor;

      if (orientation === 'horizontal') ctx.fillRect(0, 0, canvasPosition, height);else ctx.fillRect(0, canvasPosition, width, height);

      // markers
      var markers = this.params.markers;

      for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        var position = this.canvasScale(marker);
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
        var delta = this.params.handleSize * this._pixelRatio / 2;
        var start = canvasPosition - delta;
        var end = canvasPosition + delta;

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
  }, {
    key: 'value',
    get: function get() {
      return this._value;
    },
    set: function set(val) {
      // don't trigger the callback when value is set from outside
      this._updateValue(val, true, false);
    }
  }]);

  return Slider;
}();

exports.default = Slider;

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Slider = require('./Slider');

Object.defineProperty(exports, 'Slider', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Slider).default;
  }
});

var _Breakpoint = require('./Breakpoint');

Object.defineProperty(exports, 'Breakpoint', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Breakpoint).default;
  }
});

var _Matrix = require('./Matrix');

Object.defineProperty(exports, 'Matrix', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Matrix).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./Breakpoint":2,"./Matrix":3,"./Slider":4}],6:[function(require,module,exports){
'use strict';

var _index = require('../../../dist/index');

// jump
var $feedbackJump = document.querySelector('#feedback-jump');

var sliderJump = new _index.Slider({
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
  callback: function callback(val) {
    return $feedbackJump.textContent = val;
  }
});

// make sure callback is not triggered when updating manually
setTimeout(function () {
  var oldCallback = sliderJump.params.callback;
  var testValue = 1;
  sliderJump.params.callback = function (value) {
    if (value == testValue) throw new Error('`slider.value = newValue` should be silent');
  };

  sliderJump.value = testValue;
  sliderJump.params.callback = oldCallback;
}, 500);

// proportionnal
var $feedbackProportionnal = document.querySelector('#feedback-proportionnal');

var sliderProportionnal = new _index.Slider({
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
  callback: function callback(val) {
    return $feedbackProportionnal.textContent = val;
  }
});

// handle
var $feedbackHandle = document.querySelector('#feedback-handle');

var sliderHandle = new _index.Slider({
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
  callback: function callback(val) {
    return $feedbackHandle.textContent = val;
  }
});

},{"../../../dist/index":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9kaXN0L2luZGV4LmpzIiwiLi4vLi4vZGlzdC9NYXRyaXguanMiLCJkaXN0L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztJQ0NNLGE7QUFDSix5QkFBWSxPQUFaLEVBQXFCO0FBQUE7QUFFcEI7O0FBRUQ7Ozs7O2lDQVNhLEksRUFBTSxLLEVBQU87QUFDeEI7QUFDRDs7OzRCQUVPO0FBQ04sWUFBTSxJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUFOO0FBQ0Q7OzsyQkFFTSxLLEVBQU8sTSxFQUFRO0FBQ3BCLFlBQU0sSUFBSSxLQUFKLENBQVUsaUJBQVYsQ0FBTjtBQUNEOzs7d0JBbEJXO0FBQ1YsWUFBTSxJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUFOO0FBQ0QsSztzQkFFUyxHLEVBQUs7QUFDYixZQUFNLElBQUksS0FBSixDQUFVLGlCQUFWLENBQU47QUFDRDs7Ozs7O2tCQWVZLGE7Ozs7Ozs7Ozs7Ozs7SUE1QlQsVTtBQUNKLHNCQUFZLE9BQVosRUFBcUI7QUFBQTs7QUFDbkIsUUFBTSxXQUFXO0FBQ2YsZ0JBQVUseUJBQVMsQ0FBRSxDQUROO0FBRWYsYUFBTyxHQUZRO0FBR2YsY0FBUSxHQUhPO0FBSWYsaUJBQVcsTUFKSTtBQUtmLGVBQVMsRUFMTTtBQU1mLGNBQVE7QUFOTyxLQUFqQjs7QUFTQSxTQUFLLE1BQUwsR0FBYyxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLFFBQWxCLEVBQTRCLE9BQTVCLENBQWQ7O0FBRUEsU0FBSyxPQUFMLEdBQWU7QUFDYixZQUFNLEVBRE87QUFFYixlQUFTLEVBRkk7QUFHYixpQkFBVztBQUhFLEtBQWY7O0FBTUEsU0FBSyxjQUFMOztBQUVBO0FBQ0EsU0FBSyxjQUFMOztBQUVBLFNBQUssWUFBTCxHQUFvQixLQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBcEI7QUFDQSxTQUFL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O0FBQzNCLFNBQU8sR0FadUI7QUFhOUIsVUFBUSxHQWJzQjs7QUFlOUI7QUFDQSxjQUFZLElBaEJrQjtBQWlCOUIsY0FBWSxFQWpCa0I7QUFrQjlCLGVBQWEsMEJBbEJpQjtBQW1COUIsWUFBVSxrQkFBQyxHQUFEO0FBQUEsV0FBUyxnQkFBZ0IsV0FBaEIsR0FBOEIsR0FBdkM7QUFBQTtBQW5Cb0IsQ0FBWCxDQUFyQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBtb2R1bGUgZ3VpLWNvbXBvbmVudHNcbiAqL1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTbGlkZXIgfSBmcm9tICcuL1NsaWRlcic7XG5leHBvcnQgeyBkZWZhdWx0IGFzIEJyZWFrcG9pbnQgfSBmcm9tICcuL0JyZWFrcG9pbnQnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBNYXRyaXggfSBmcm9tICcuL01hdHJpeCc7XG4iLCJpbXBvcnQgQmFzZUNvbXBvbmVudCBmcm9tICcuL0Jhc2VDb21wb25lbnQnO1xuXG5cbmNvbnN0IG5zID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztcblxuXG5jbGFzcyBNYXRyaXggZXh0ZW5kcyBCYXNlQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKCk7XG5cbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB7fSxcbiAgICAgIGNvbnRhaW5lcjogJ2JvZHknLFxuICAgICAgbnVtQ29sczogNCxcbiAgICAgIG51bVJvd3M6IDQsXG4gICAgICB3aWR0aDogNDAwLFxuICAgICAgaGVpZ2h0OiA0MDAsXG4gICAgICB0cmlnZ2VyOiAndG91Y2gnLCAvLyAnYWZ0ZXJ0b3VjaCdcbiAgICB9XG5cbiAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgIHRoaXMuXyRzdmcgPSBudWxsO1xuICAgIHRoaXMuXyRjZWxscyA9IG51bGw7XG5cbiAgICB0aGlzLl9vbk1vdXNlRG93biA9IHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Nb3VzZU1vdmUgPSB0aGlzLl9vbk1vdXNlTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uTW91c2VVcCA9IHRoaXMuX29uTW91c2VVcC5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5fY3JlYXRlVmFsdWUoKTtcbiAgICB0aGlzLl9jcmVhdGVFbGVtZW50KCk7XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlcztcbiAgfVxuXG4gIC8vIG1heWJlIHNob3VsZCB3b3JrIGFzIHJlZmVyZW5jZVxuICBzZXQgdmFsdWUodmFsdWUpIHtcbiAgICB0aGlzLl92YWx1ZXMgPSBfdmFsdWVzO1xuICB9XG5cbiAgc2V0Q2VsbFZhbHVlKHgsIHksIHZhbHVlKSB7XG4gICAgdGhpcy5fdmFsdWVzW3hdW3ldID0gdmFsdWU7XG4gICAgLy8gZGlzcGF0Y2ggdmFsdWVcbiAgICB0aGlzLnBhcmFtcy5jYWxsYmFjayh0aGlzLl92YWx1ZXMpO1xuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgdG9nZ2xlQ2VsbCh4LCB5KSB7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLl92YWx1ZXNbeF1beV07XG4gICAgdGhpcy5zZXRDZWxsVmFsdWUoeCwgeSwgMSAtIHZhbHVlKTtcbiAgfVxuXG4gIHNldFBhcmFtZXRlcihuYW1lLCB2YWx1ZSkge1xuICAgIC8vIC4uLlxuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgY29uc3QgeyBudW1Db2xzLCBudW1Sb3dzIH0gPSB0aGlzLnBhcmFtcztcblxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgbnVtQ29sczsgeCsrKSB7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IG51bVJvd3M7IHkrKykge1xuICAgICAgICB0aGlzLl92YWx1ZXNbeF1beV0gPSAwO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucGFyYW1zLmNhbGxiYWNrKHRoaXMuX3ZhbHVlcyk7XG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICByZXNpemUoKSB7XG5cbiAgfVxuXG4gIF9yZXNpemUod2lkdGgsIGhlaWdodCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyLCBudW1Db2xzLCBudW1Sb3dzIH0gPSB0aGlzLnBhcmFtcztcblxuICAgIGNvbnN0IGNlbGxXaWR0aCA9IHdpZHRoIC8gbnVtQ29scztcbiAgICBjb25zdCBjZWxsSGVpZ2h0ID0gaGVpZ2h0IC8gbnVtUm93cztcblxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgbnVtQ29sczsgeCsrKSB7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IG51bVJvd3M7IHkrKykge1xuICAgICAgICBjb25zdCAkY2VsbCA9IHRoaXMuXyRjZWxsc1t4XVt5XTtcbiAgICAgICAgJGNlbGwuc2V0QXR0cmlidXRlKCd3aWR0aCcsIGNlbGxXaWR0aCk7XG4gICAgICAgICRjZWxsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgY2VsbEhlaWdodCk7XG4gICAgICAgICRjZWxsLnNldEF0dHJpYnV0ZSgneCcsIGNlbGxXaWR0aCAqIHgpO1xuICAgICAgICAkY2VsbC5zZXRBdHRyaWJ1dGUoJ3knLCBjZWxsSGVpZ2h0ICogeSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZVZhbHVlKCkge1xuICAgIGNvbnN0IHsgbnVtQ29scywgbnVtUm93cyB9ID0gdGhpcy5wYXJhbXM7XG5cbiAgICB0aGlzLl92YWx1ZXMgPSBbXTtcbiAgICAvLyBkZWZpbmUgaWYgcm93IGZpcnN0IG9yIGNvbEZpcnN0XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBudW1Db2xzOyB4KyspIHtcbiAgICAgIGNvbnN0IGNvbCA9IFtdO1xuXG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IG51bVJvd3M7IHkrKykge1xuICAgICAgICBjb2xbeV0gPSAwO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl92YWx1ZXNbeF0gPSBjb2w7XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VEb3duKGUpIHtcbiAgICB0aGlzLl8kc3ZnLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCk7XG5cbiAgICBjb25zdCAkY2VsbCA9IGUudGFyZ2V0O1xuICAgIGNvbnN0IHsgeCwgeSB9ID0gJGNlbGwuZGF0YXNldDtcblxuICAgIHRoaXMudG9nZ2xlQ2VsbCh4LCB5KTtcbiAgICB0aGlzLl8kbGFzdENlbGwgPSAkY2VsbDtcbiAgfVxuXG4gIF9vbk1vdXNlTW92ZShlKSB7XG4gICAgY29uc3QgJGNlbGwgPSBlLnRhcmdldDtcblxuICAgIGlmICh0aGlzLl8kbGFzdENlbGwgIT09ICRjZWxsKSB7XG4gICAgICBjb25zdCB7IHgsIHkgfSA9ICRjZWxsLmRhdGFzZXQ7XG5cbiAgICAgIHRoaXMudG9nZ2xlQ2VsbCh4LCB5KTtcbiAgICAgIHRoaXMuXyRsYXN0Q2VsbCA9ICRjZWxsO1xuICAgIH1cblxuICB9XG5cbiAgX29uTW91c2VVcCgpIHtcbiAgICB0aGlzLl8kc3ZnLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCk7XG4gIH1cblxuICBfY3JlYXRlRWxlbWVudCgpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciwgbnVtQ29scywgbnVtUm93cywgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5wYXJhbXM7XG4gICAgdGhpcy5fJHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgJ3N2ZycpO1xuICAgIHRoaXMuXyRzdmcuc2V0QXR0cmlidXRlTlMobnVsbCwgJ3NoYXBlLXJlbmRlcmluZycsICdvcHRpbWl6ZVNwZWVkJyk7XG4gICAgdGhpcy5fJHN2Zy5zZXRBdHRyaWJ1dGUoJ3htbG5zOnhodG1sJywgJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnKTtcblxuICAgIHRoaXMuXyRzdmcuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gICAgdGhpcy5fJHN2Zy5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuICAgIHRoaXMuXyRjZWxscyA9IFtdO1xuXG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBudW1Db2xzOyB4KyspIHtcbiAgICAgIGNvbnN0ICRjb2xsID0gW107XG5cbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgbnVtUm93czsgeSsrKSB7XG4gICAgICAgIGNvbnN0ICRjZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCAncmVjdCcpO1xuICAgICAgICAvLyAkY2VsbC5zdHlsZS5zdHJva2UgPSAnIzc4Nzg3OCc7XG4gICAgICAgICRjZWxsLnNldEF0dHJpYnV0ZU5TKG51bGwsICdzdHJva2UnLCAnIzc4Nzg3OCcpO1xuICAgICAgICAkY2VsbC5kYXRhc2V0LnggPSB4O1xuICAgICAgICAkY2VsbC5kYXRhc2V0LnkgPSB5O1xuXG4gICAgICAgICRjb2xsW3ldID0gJGNlbGw7XG4gICAgICAgIHRoaXMuXyRzdmcuYXBwZW5kQ2hpbGQoJGNlbGwpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl8kY2VsbHNbeF0gPSAkY29sbDtcbiAgICB9XG5cbiAgICB0aGlzLl9yZXNpemUod2lkdGgsIGhlaWdodCk7XG5cbiAgICBjb25zdCAkY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXIpO1xuICAgICRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fJHN2Zyk7XG5cbiAgICB0aGlzLl8kc3ZnLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duKTtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgY29uc3QgeyBudW1Db2xzLCBudW1Sb3dzIH0gPSB0aGlzLnBhcmFtcztcblxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgbnVtQ29sczsgeCsrKSB7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IG51bVJvd3M7IHkrKykge1xuICAgICAgICBjb25zdCAkY2VsbCA9IHRoaXMuXyRjZWxsc1t4XVt5XTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl92YWx1ZXNbeF1beV07XG5cbiAgICAgICAgaWYgKHZhbHVlID4gMCkge1xuICAgICAgICAgICRjZWxsLnNldEF0dHJpYnV0ZU5TKG51bGwsICdmaWxsJywgJyNmZmZmZmYnKTtcbiAgICAgICAgICAkY2VsbC5zZXRBdHRyaWJ1dGVOUyhudWxsLCAnZmlsbC1vcGFjaXR5JywgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRjZWxsLnNldEF0dHJpYnV0ZU5TKG51bGwsICdmaWxsJywgJyMwMDAwMDAnKTtcbiAgICAgICAgICAkY2VsbC5zZXRBdHRyaWJ1dGVOUyhudWxsLCAnZmlsbC1vcGFjaXR5JywgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWF0cml4O1xuIiwiaW1wb3J0IHsgU2xpZGVyIH0gZnJvbSAnLi4vLi4vLi4vZGlzdC9pbmRleCc7XG5cbi8vIGp1bXBcbmNvbnN0ICRmZWVkYmFja0p1bXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmVlZGJhY2stanVtcCcpO1xuXG5jb25zdCBzbGlkZXJKdW1wID0gbmV3IFNsaWRlcih7XG4gIG1vZGU6ICdqdW1wJyxcbiAgY29udGFpbmVyOiAnI3NsaWRlci1qdW1wJyxcbiAgbWluOiAwLFxuICBtYXg6IDEsXG4gIGRlZmF1bHQ6IDAuNixcbiAgc3RlcDogMC4wMDEsXG4gIGJhY2tncm91bmRDb2xvcjogJyM0NjQ2NDYnLFxuICBmb3JlZ3JvdW5kQ29sb3I6ICdzdGVlbGJsdWUnLFxuICBtYXJrZXJzOiBbMC43XSxcbiAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJywgLy8gJ3ZlcnRpY2FsJ1xuICB3aWR0aDogNDAwLFxuICBoZWlnaHQ6IDMwLFxuICBjYWxsYmFjazogKHZhbCkgPT4gJGZlZWRiYWNrSnVtcC50ZXh0Q29udGVudCA9IHZhbCxcbn0pO1xuXG4vLyBtYWtlIHN1cmUgY2FsbGJhY2sgaXMgbm90IHRyaWdnZXJlZCB3aGVuIHVwZGF0aW5nIG1hbnVhbGx5XG5zZXRUaW1lb3V0KCgpID0+IHtcbiAgY29uc3Qgb2xkQ2FsbGJhY2sgPSBzbGlkZXJKdW1wLnBhcmFtcy5jYWxsYmFjaztcbiAgY29uc3QgdGVzdFZhbHVlID0gMTtcbiAgc2xpZGVySnVtcC5wYXJhbXMuY2FsbGJhY2sgPSAodmFsdWUpID0+IHtcbiAgICBpZiAodmFsdWUgPT0gdGVzdFZhbHVlKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgc2xpZGVyLnZhbHVlID0gbmV3VmFsdWVgIHNob3VsZCBiZSBzaWxlbnQnKTtcbiAgfVxuXG4gIHNsaWRlckp1bXAudmFsdWUgPSB0ZXN0VmFsdWU7XG4gIHNsaWRlckp1bXAucGFyYW1zLmNhbGxiYWNrID0gb2xkQ2FsbGJhY2s7XG59LCA1MDApO1xuXG4vLyBwcm9wb3J0aW9ubmFsXG5jb25zdCAkZmVlZGJhY2tQcm9wb3J0aW9ubmFsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZlZWRiYWNrLXByb3BvcnRpb25uYWwnKTtcblxuY29uc3Qgc2xpZGVyUHJvcG9ydGlvbm5hbCA9IG5ldyBTbGlkZXIoe1xuICBtb2RlOiAncHJvcG9ydGlvbm5hbCcsXG4gIGNvbnRhaW5lcjogJyNzbGlkZXItcHJvcG9ydGlvbm5hbCcsXG4gIG1pbjogLTUwLFxuICBtYXg6IDUwLFxuICBkZWZhdWx0OiAyMCxcbiAgc3RlcDogMC4xLFxuICBiYWNrZ3JvdW5kQ29sb3I6ICcjNDY0NjQ2JyxcbiAgZm9yZWdyb3VuZENvbG9yOiAnc3RlZWxibHVlJyxcbiAgbWFya2VyczogWzBdLFxuICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJywgLy8gJ3ZlcnRpY2FsJ1xuICB3aWR0aDogMzAsXG4gIGhlaWdodDogMzAwLFxuICBjYWxsYmFjazogKHZhbCkgPT4gJGZlZWRiYWNrUHJvcG9ydGlvbm5hbC50ZXh0Q29udGVudCA9IHZhbCxcbn0pO1xuXG4vLyBoYW5kbGVcbmNvbnN0ICRmZWVkYmFja0hhbmRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmZWVkYmFjay1oYW5kbGUnKTtcblxuY29uc3Qgc2xpZGVySGFuZGxlID0gbmV3IFNsaWRlcih7XG4gIG1vZGU6ICdoYW5kbGUnLFxuICBjb250YWluZXI6ICcjc2xpZGVyLWhhbmRsZScsXG4gIG1pbjogLTUwLFxuICBtYXg6IDUwLFxuICBkZWZhdWx0OiAyMCxcbiAgc3RlcDogMC4xLFxuICBiYWNrZ3JvdW5kQ29sb3I6ICcjNDY0NjQ2JyxcbiAgZm9yZWdyb3VuZENvbG9yOiAnc3RlZWxibHVlJyxcbiAgbWFya2Vyc0NvbG9yOiAnb3JhbmdlJyxcbiAgbWFya2VyczogWzBdLFxuICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLCAvLyAndmVydGljYWwnXG4gIHdpZHRoOiAzMDAsXG4gIGhlaWdodDogMzAwLFxuXG4gIC8vIGhhbmRsZSBzcGVjaWZpYyBwYXJhbXNcbiAgc2hvd0hhbmRsZTogdHJ1ZSxcbiAgaGFuZGxlU2l6ZTogMjAsXG4gIGhhbmRsZUNvbG9yOiAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpJyxcbiAgY2FsbGJhY2s6ICh2YWwpID0+ICRmZWVkYmFja0hhbmRsZS50ZXh0Q29udGVudCA9IHZhbCxcbn0pO1xuXG4iXX0=
