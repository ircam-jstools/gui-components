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
      height: 400
      // trigger: 'touch', // 'aftertouch'
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
    key: 'setValues',


    // set values(values) {
    //   this._values = values;

    //   this.params.callback(this._values);
    //   this._render();
    // }

    value: function setValues(values) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          _ref$silent = _ref.silent,
          silent = _ref$silent === undefined ? false : _ref$silent;

      this._values = values;

      if (silent === false) {
        this.params.callback(this._values);
      }

      this._render();
    }
  }, {
    key: 'setCellValue',
    value: function setCellValue(x, y, value) {
      var _ref2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
          _ref2$silent = _ref2.silent,
          silent = _ref2$silent === undefined ? false : _ref2$silent;

      this._values[x][y] = value;
      // dispatch value

      if (silent === false) {
        this.params.callback(this._values);
      }

      this._render();
    }
  }, {
    key: 'toggleCell',
    value: function toggleCell(x, y) {
      var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
          _ref3$silent = _ref3.silent,
          silent = _ref3$silent === undefined ? false : _ref3$silent;

      var value = this._values[x][y];
      this.setCellValue(x, y, 1 - value);
    }
  }, {
    key: 'setParameter',
    value: function setParameter(name, value) {
      // ...
      if (this.params[name]) this.params[name] = value;
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
    value: function resize() {
      var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (width !== null) {
        this.params.width = width;
      }

      if (height !== null) {
        this.params.height = height;
      }

      this._resizeElement();
    }
  }, {
    key: '_createValue',
    value: function _createValue() {
      var _params2 = this.params,
          numCols = _params2.numCols,
          numRows = _params2.numRows;


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
      var _params3 = this.params,
          container = _params3.container,
          numCols = _params3.numCols,
          numRows = _params3.numRows;

      this._$svg = document.createElementNS(ns, 'svg');
      this._$svg.setAttributeNS(null, 'shape-rendering', 'optimizeSpeed');
      this._$svg.setAttribute('xmlns:xhtml', 'http://www.w3.org/1999/xhtml');

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

      this._resizeElement();

      var $container = void 0;
      if (container instanceof Element) {
        $container = container;
      } else {
        $container = document.querySelector(container);
      }

      $container.appendChild(this._$svg);

      this._$svg.addEventListener('mousedown', this._onMouseDown);
    }
  }, {
    key: '_resizeElement',
    value: function _resizeElement() {
      var _params4 = this.params,
          numCols = _params4.numCols,
          numRows = _params4.numRows,
          width = _params4.width,
          height = _params4.height;


      this._$svg.style.width = width + 'px';
      this._$svg.style.height = height + 'px';

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
    key: 'values',
    get: function get() {
      return this._values;
    }
  }]);

  return Matrix;
}(_BaseComponent3.default);

exports.default = Matrix;

},{"./BaseComponent":1}],3:[function(require,module,exports){
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
      this.$canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
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

          console.log(orientation, position, compare, delta);

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
      e.preventDefault();

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
      e.preventDefault();

      if (this._touchId !== null) {
        return;
      }

      // consider the last touch of the list, as another touch might have
      // occured somewhere else on the screen
      var touch = e.touches[e.touches.length - 1];
      var pageX = touch.pageX;
      var pageY = touch.pageY;
      var x = pageX - this._boundingClientRect.left;
      var y = pageY - this._boundingClientRect.top;

      if (this._onStart(x, y) === true) {
        this._touchId = touch.identifier;
        // disable touchstart
        this.$canvas.removeEventListener('touchstart', this._onTouchStart);

        window.addEventListener('touchmove', this._onTouchMove, { passive: false });
        window.addEventListener('touchend', this._onTouchEnd);
        window.addEventListener('touchcancel', this._onTouchEnd);
      }
    }
  }, {
    key: '_onTouchMove',
    value: function _onTouchMove(e) {
      var _this2 = this;

      var touches = Array.from(e.touches);
      var touch = touches.filter(function (t) {
        return t.identifier === _this2._touchId;
      })[0];

      if (touch) {
        e.preventDefault(); // prevent text selection

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
      console.log('touchEnd', touch);

      if (touch === undefined) {
        this._onEnd();
        this._touchId = null;

        window.removeEventListener('touchmove', this._onTouchMove);
        window.removeEventListener('touchend', this._onTouchEnd);
        window.removeEventListener('touchcancel', this._onTouchEnd);
        // re-enable touchstart
        this.$canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
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

},{}],4:[function(require,module,exports){
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

var _Matrix = require('./Matrix');

Object.defineProperty(exports, 'Matrix', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_Matrix).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./Matrix":2,"./Slider":3}],5:[function(require,module,exports){
'use strict';

var _guiComponents = require('@ircam/gui-components');

// jump
var $feedbackJump = document.querySelector('#feedback-jump');

var sliderJump = new _guiComponents.Slider({
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

var sliderProportionnal = new _guiComponents.Slider({
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

var sliderHandle = new _guiComponents.Slider({
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

},{"@ircam/gui-components":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9kaXN0L2luZGV4LmpzIiwiLi4vLi4vZGlzdC9TbGlkZXIuanMiLCJkaXN0L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztJQ0NNLGE7QUFDSix5QkFBWSxPQUFaLEVBQXFCO0FBQUE7QUFFcEI7O0FBRUQ7Ozs7O2lDQVNhLEksRUFBTSxLLEVBQU87QUFDeEI7QUFDRDs7OzRCQUVPO0FBQ04sWUFBTSxJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUFOO0FBQ0Q7OzsyQkFFTSxLLEVBQU8sTSxFQUFRO0FBQ3BCLFlBQU0sSUFBSSxLQUFKLENBQVUsaUJBQVYsQ0FBTjtBQUNEOzs7d0JBbEJXO0FBQ1YsWUFBTSxJQUFJLEtBQUosQ0FBVSxpQkFBVixDQUFOO0FBQ0QsSztzQkFFUyxHLEVBQUs7QUFDYixZQUFNLElBQUksS0FBSixDQUFVLGlCQUFWLENBQU47QUFDRDs7Ozs7O2tCQWVZLGE7Ozs7Ozs7Ozs7O0FBNUJmOzs7Ozs7Ozs7Ozs7QUFHQSxJQUFNLEtBQUssNEJBQVg7O0lBR00sTTs7O0FBQ0osa0JBQVksT0FBWixFQUFxQjtBQUFBOztBQUFBOztBQUduQixRQUFNLFdBQVc7QUFDZixnQkFBVSxvQkFBTSxDQUFFLENBREg7QUFFZixpQkFBVyxNQUZJO0FBR2YsZUFBUyxDQUhNO0FBSWYsZUFBUyxDQUpNO0FBS2YsYUFBTyxHQUxRO0FBTWYsY0FBUTtBQUNSO0FBUGUsS0FBakI7O0FBVUEsVUFBSyxNQUFMLEdBQWMsT0FBTyxNQUFQLENBQWMsRUFBZCxFQUFrQixRQUFsQixFQUE0QixPQUE1QixDQUFkOztBQUVBLFVBQUssS0FBTCxHQUFhLElBQWI7QUFDQSxVQUFLLE9BQUwsR0FBZSxJQUFmOztBQUVBLFVBQUssWUFBTCxHQUFvQixNQUFLLFlBQUwsQ0FBa0IsSUFBbEIsT0FBcEI7QUFDQSxVQUFLLFlBQUwsR0FBb0IsTUFBSyxZQUFM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LFFBVGdCO0FBVTlCLFdBQVMsQ0FBQyxDQUFELENBVnFCO0FBVzlCLGVBQWEsWUFYaUIsRUFXSDtBQUMzQixTQUFPLEdBWnVCO0FBYTlCLFVBQVEsR0Fic0I7O0FBZTlCO0FBQ0EsY0FBWSxJQWhCa0I7QUFpQjlCLGNBQVksRUFqQmtCO0FBa0I5QixlQUFhLDBCQWxCaUI7QUFtQjlCLFlBQVUsa0JBQUMsR0FBRDtBQUFBLFdBQVMsZ0JBQWdCLFdBQWhCLEdBQThCLEdBQXZDO0FBQUE7QUFuQm9CLENBQVgsQ0FBckIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAbW9kdWxlIGd1aS1jb21wb25lbnRzXG4gKi9cbmV4cG9ydCB7IGRlZmF1bHQgYXMgU2xpZGVyIH0gZnJvbSAnLi9TbGlkZXInO1xuLy8gZXhwb3J0IHsgZGVmYXVsdCBhcyBCcmVha3BvaW50IH0gZnJvbSAnLi9CcmVha3BvaW50JztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTWF0cml4IH0gZnJvbSAnLi9NYXRyaXgnO1xuIiwiZnVuY3Rpb24gZ2V0U2NhbGUoZG9tYWluLCByYW5nZSkge1xuICBjb25zdCBzbG9wZSA9IChyYW5nZVsxXSAtIHJhbmdlWzBdKSAvIChkb21haW5bMV0gLSBkb21haW5bMF0pO1xuICBjb25zdCBpbnRlcmNlcHQgPSByYW5nZVswXSAtIHNsb3BlICogZG9tYWluWzBdO1xuXG4gIGZ1bmN0aW9uIHNjYWxlKHZhbCkge1xuICAgIHJldHVybiBzbG9wZSAqIHZhbCArIGludGVyY2VwdDtcbiAgfVxuXG4gIHNjYWxlLmludmVydCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAodmFsIC0gaW50ZXJjZXB0KSAvIHNsb3BlO1xuICB9XG5cbiAgcmV0dXJuIHNjYWxlO1xufVxuXG5mdW5jdGlvbiBnZXRDbGlwcGVyKG1pbiwgbWF4LCBzdGVwKSB7XG4gIHJldHVybiAodmFsKSA9PiB7XG4gICAgY29uc3QgY2xpcHBlZFZhbHVlID0gTWF0aC5yb3VuZCh2YWwgLyBzdGVwKSAqIHN0ZXA7XG4gICAgY29uc3QgZml4ZWQgPSBNYXRoLm1heChNYXRoLmxvZzEwKDEgLyBzdGVwKSwgMCk7XG4gICAgY29uc3QgZml4ZWRWYWx1ZSA9IGNsaXBwZWRWYWx1ZS50b0ZpeGVkKGZpeGVkKTsgLy8gZml4IGZsb2F0aW5nIHBvaW50IGVycm9yc1xuICAgIHJldHVybiBNYXRoLm1pbihtYXgsIE1hdGgubWF4KG1pbiwgcGFyc2VGbG9hdChmaXhlZFZhbHVlKSkpO1xuICB9XG59XG5cbi8qKlxuICogQG1vZHVsZSBndWktY29tcG9uZW50c1xuICovXG5cbi8qKlxuICogVmVyc2F0aWxlIGNhbnZhcyBiYXNlZCBzbGlkZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZSBkZWZhdWx0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0geydqdW1wJ3wncHJvcG9ydGlvbm5hbCd8J2hhbmRsZSd9IFtvcHRpb25zLm1vZGU9J2p1bXAnXSAtIE1vZGUgb2YgdGhlIHNsaWRlcjpcbiAqICAtIGluICdqdW1wJyBtb2RlLCB0aGUgdmFsdWUgaXMgY2hhbmdlZCBvbiAndG91Y2hzdGFydCcgb3IgJ21vdXNlZG93bicsIGFuZFxuICogICAgb24gbW92ZS5cbiAqICAtIGluICdwcm9wb3J0aW9ubmFsJyBtb2RlLCB0aGUgdmFsdWUgaXMgdXBkYXRlZCByZWxhdGl2ZWx5IHRvIG1vdmUuXG4gKiAgLSBpbiAnaGFuZGxlJyBtb2RlLCB0aGUgc2xpZGVyIGNhbiBiZSBncmFiYmVkIG9ubHkgYXJvdW5kIGl0cyB2YWx1ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLmNhbGxiYWNrXSAtIENhbGxiYWNrIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIHZhbHVlXG4gKiAgb2YgdGhlIHNsaWRlciBjaGFuZ2VzLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLndpZHRoPTIwMF0gLSBXaWR0aCBvZiB0aGUgc2xpZGVyLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmhlaWdodD0zMF0gLSBIZWlnaHQgb2YgdGhlIHNsaWRlci5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5taW49MF0gLSBNaW5pbXVtIHZhbHVlLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLm1heD0xXSAtIE1heGltdW0gdmFsdWUuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuc3RlcD0wLjAxXSAtIFN0ZXAgYmV0d2VlbiBlYWNoIGNvbnNlY3V0aXZlIHZhbHVlcy5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5kZWZhdWx0PTBdIC0gRGVmYXVsdCB2YWx1ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfEVsZW1lbnR9IFtvcHRpb25zLmNvbnRhaW5lcj0nYm9keSddIC0gQ1NTIFNlbGVjdG9yIG9yIERPTVxuICogIGVsZW1lbnQgaW4gd2hpY2ggaW5zZXJ0aW5nIHRoZSBzbGlkZXIuXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuYmFja2dyb3VuZENvbG9yPScjNDY0NjQ2J10gLSBCYWNrZ3JvdW5kIGNvbG9yIG9mIHRoZVxuICogIHNsaWRlci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5mb3JlZ3JvdW5kQ29sb3I9J3N0ZWVsYmx1ZSddIC0gRm9yZWdyb3VuZCBjb2xvciBvZlxuICogIHRoZSBzbGlkZXIuXG4gKiBAcGFyYW0geydob3Jpem9udGFsJ3wndmVydGljYWwnfSBbb3B0aW9ucy5vcmllbnRhdGlvbj0naG9yaXpvbnRhbCddIC1cbiAqICBPcmllbnRhdGlvbiBvZiB0aGUgc2xpZGVyLlxuICogQHBhcmFtIHtBcnJheX0gW29wdGlvbnMubWFya2Vycz1bXV0gLSBMaXN0IG9mIHZhbHVlcyB3aGVyZSBtYXJrZXJzIHNob3VsZFxuICogIGJlIGRpc3BsYXllZCBvbiB0aGUgc2xpZGVyLlxuICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5zaG93SGFuZGxlPXRydWVdIC0gSW4gJ2hhbmRsZScgbW9kZSwgZGVmaW5lIGlmIHRoZVxuICogIGRyYWdnYWJsZSBzaG91bGQgYmUgc2hvdyBvciBub3QuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuaGFuZGxlU2l6ZT0yMF0gLSBTaXplIG9mIHRoZSBkcmFnZ2FibGUgem9uZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5oYW5kbGVDb2xvcj0ncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpJ10gLSBDb2xvciBvZiB0aGVcbiAqICBkcmFnZ2FibGUgem9uZSAod2hlbiBgc2hvd0hhbmRsZWAgaXMgYHRydWVgKS5cbiAqXG4gKiBAZXhhbXBsZVxuICogaW1wb3J0IHsgU2xpZGVyfSBmcm9tICdndWktY29tcG9uZW50cyc7XG4gKlxuICogY29uc3Qgc2xpZGVyID0gbmV3IFNsaWRlcih7XG4gKiAgIG1vZGU6ICdqdW1wJyxcbiAqICAgY29udGFpbmVyOiAnI2NvbnRhaW5lcicsXG4gKiAgIGRlZmF1bHQ6IDAuNixcbiAqICAgbWFya2VyczogWzAuNV0sXG4gKiAgIGNhbGxiYWNrOiAodmFsdWUpID0+IGNvbnNvbGUubG9nKHZhbHVlKSxcbiAqIH0pO1xuICovXG5jbGFzcyBTbGlkZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICBtb2RlOiAnanVtcCcsXG4gICAgICBjYWxsYmFjazogdmFsdWUgPT4ge30sXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAzMCxcbiAgICAgIG1pbjogMCxcbiAgICAgIG1heDogMSxcbiAgICAgIHN0ZXA6IDAuMDEsXG4gICAgICBkZWZhdWx0OiAwLFxuICAgICAgY29udGFpbmVyOiAnYm9keScsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjNDY0NjQ2JyxcbiAgICAgIGZvcmVncm91bmRDb2xvcjogJ3N0ZWVsYmx1ZScsXG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuICAgICAgbWFya2VyczogW10sXG5cbiAgICAgIC8vIGhhbmRsZSBzcGVjaWZpYyBvcHRpb25zXG4gICAgICBzaG93SGFuZGxlOiB0cnVlLFxuICAgICAgaGFuZGxlU2l6ZTogMjAsXG4gICAgICBoYW5kbGVDb2xvcjogJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC43KScsXG4gICAgfTtcblxuICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdCA9IG51bGw7XG4gICAgdGhpcy5fdG91Y2hJZCA9IG51bGw7XG4gICAgdGhpcy5fdmFsdWUgPSBudWxsO1xuICAgIHRoaXMuX2NhbnZhc1dpZHRoID0gbnVsbDtcbiAgICB0aGlzLl9jYW52YXNIZWlnaHQgPSBudWxsO1xuICAgIC8vIGZvciBwcm9wb3J0aW9ubmFsIG1vZGVcbiAgICB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbiA9IHsgeDogbnVsbCwgeTogbnVsbCB9O1xuICAgIHRoaXMuX2N1cnJlbnRTbGlkZXJQb3NpdGlvbiA9IG51bGw7XG5cbiAgICB0aGlzLl9vbk1vdXNlRG93biA9IHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Nb3VzZU1vdmUgPSB0aGlzLl9vbk1vdXNlTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uTW91c2VVcCA9IHRoaXMuX29uTW91c2VVcC5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5fb25Ub3VjaFN0YXJ0ID0gdGhpcy5fb25Ub3VjaFN0YXJ0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Ub3VjaE1vdmUgPSB0aGlzLl9vblRvdWNoTW92ZSAuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblRvdWNoRW5kID0gdGhpcy5fb25Ub3VjaEVuZC5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5fb25SZXNpemUgPSB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpO1xuXG5cbiAgICB0aGlzLl9jcmVhdGVFbGVtZW50KCk7XG5cbiAgICAvLyBpbml0aWFsaXplXG4gICAgdGhpcy5fcmVzaXplRWxlbWVudCgpO1xuICAgIHRoaXMuX3NldFNjYWxlcygpO1xuICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcbiAgICB0aGlzLl9vblJlc2l6ZSgpO1xuICAgIHRoaXMuX3VwZGF0ZVZhbHVlKHRoaXMucGFyYW1zLmRlZmF1bHQsIHRydWUsIHRydWUpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX29uUmVzaXplKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHZhbHVlIG9mIHRoZSBzbGlkZXIuXG4gICAqXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG5cbiAgc2V0IHZhbHVlKHZhbCkge1xuICAgIC8vIGRvbid0IHRyaWdnZXIgdGhlIGNhbGxiYWNrIHdoZW4gdmFsdWUgaXMgc2V0IGZyb20gb3V0c2lkZVxuICAgIHRoaXMuX3VwZGF0ZVZhbHVlKHZhbCwgdHJ1ZSwgZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IHRoZSBzbGlkZXIgdG8gaXRzIGRlZmF1bHQgdmFsdWUuXG4gICAqL1xuICByZXNldCgpIHtcbiAgICB0aGlzLl91cGRhdGVWYWx1ZSh0aGlzLnBhcmFtcy5kZWZhdWx0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNpemUgdGhlIHNsaWRlci5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHdpZHRoIC0gTmV3IHdpZHRoIG9mIHRoZSBzbGlkZXIuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHQgLSBOZXcgaGVpZ2h0IG9mIHRoZSBzbGlkZXIuXG4gICAqL1xuICByZXNpemUod2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMucGFyYW1zLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5wYXJhbXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5fcmVzaXplRWxlbWVudCgpO1xuICAgIHRoaXMuX3NldFNjYWxlcygpO1xuICAgIHRoaXMuX29uUmVzaXplKCk7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWUodGhpcy5fdmFsdWUsIHRydWUsIHRydWUpO1xuICB9XG5cbiAgX3VwZGF0ZVZhbHVlKHZhbHVlLCBzaWxlbnQgPSBmYWxzZSwgZm9yY2VSZW5kZXIgPSBmYWxzZSkge1xuICAgIGNvbnN0IHsgY2FsbGJhY2sgfSA9IHRoaXMucGFyYW1zO1xuICAgIGNvbnN0IGNsaXBwZWRWYWx1ZSA9IHRoaXMuY2xpcHBlcih2YWx1ZSk7XG5cbiAgICAvLyByZXNpemUgcmVuZGVyIGJ1dCBkb24ndCB0cmlnZ2VyIGNhbGxiYWNrXG4gICAgaWYgKGNsaXBwZWRWYWx1ZSA9PT0gdGhpcy5fdmFsdWUgJiYgZm9yY2VSZW5kZXIgPT09IHRydWUpXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5fcmVuZGVyKGNsaXBwZWRWYWx1ZSkpO1xuXG4gICAgLy8gdHJpZ2dlciBjYWxsYmFja1xuICAgIGlmIChjbGlwcGVkVmFsdWUgIT09IHRoaXMuX3ZhbHVlKSB7XG4gICAgICB0aGlzLl92YWx1ZSA9IGNsaXBwZWRWYWx1ZTtcblxuICAgICAgaWYgKCFzaWxlbnQpXG4gICAgICAgIGNhbGxiYWNrKGNsaXBwZWRWYWx1ZSk7XG5cbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLl9yZW5kZXIoY2xpcHBlZFZhbHVlKSk7XG4gICAgfVxuICB9XG5cbiAgX2NyZWF0ZUVsZW1lbnQoKSB7XG4gICAgY29uc3QgeyBjb250YWluZXIgfSA9IHRoaXMucGFyYW1zO1xuICAgIHRoaXMuJGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHRoaXMuY3R4ID0gdGhpcy4kY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICBpZiAoY29udGFpbmVyIGluc3RhbmNlb2YgRWxlbWVudClcbiAgICAgIHRoaXMuJGNvbnRhaW5lciA9IGNvbnRhaW5lcjtcbiAgICBlbHNlXG4gICAgICB0aGlzLiRjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lcik7XG5cbiAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy4kY2FudmFzKTtcbiAgfVxuXG4gIF9yZXNpemVFbGVtZW50KCkge1xuICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gdGhpcy5wYXJhbXM7XG5cbiAgICAvLyBsb2dpY2FsIGFuZCBwaXhlbCBzaXplIG9mIHRoZSBjYW52YXNcbiAgICB0aGlzLl9waXhlbFJhdGlvID0gKGZ1bmN0aW9uKGN0eCkge1xuICAgIGNvbnN0IGRQUiA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgY29uc3QgYlBSID0gY3R4LndlYmtpdEJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgIGN0eC5tb3pCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICBjdHgubXNCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICBjdHgub0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgIGN0eC5iYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8IDE7XG5cbiAgICAgIHJldHVybiBkUFIgLyBiUFI7XG4gICAgfSh0aGlzLmN0eCkpO1xuXG4gICAgdGhpcy5fY2FudmFzV2lkdGggPSB3aWR0aCAqIHRoaXMuX3BpeGVsUmF0aW87XG4gICAgdGhpcy5fY2FudmFzSGVpZ2h0ID0gaGVpZ2h0ICogdGhpcy5fcGl4ZWxSYXRpbztcblxuICAgIHRoaXMuY3R4LmNhbnZhcy53aWR0aCA9IHRoaXMuX2NhbnZhc1dpZHRoO1xuICAgIHRoaXMuY3R4LmNhbnZhcy5oZWlnaHQgPSB0aGlzLl9jYW52YXNIZWlnaHQ7XG4gICAgdGhpcy5jdHguY2FudmFzLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgIHRoaXMuY3R4LmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuICB9XG5cbiAgX29uUmVzaXplKCkge1xuICAgIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdCA9IHRoaXMuJGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgfVxuXG4gIF9zZXRTY2FsZXMoKSB7XG4gICAgY29uc3QgeyBvcmllbnRhdGlvbiwgd2lkdGgsIGhlaWdodCwgbWluLCBtYXgsIHN0ZXAgfSA9IHRoaXMucGFyYW1zO1xuICAgIC8vIGRlZmluZSB0cmFuc2ZlcnQgZnVuY3Rpb25zXG4gICAgY29uc3Qgc2NyZWVuU2l6ZSA9IG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgP1xuICAgICAgd2lkdGggOiBoZWlnaHQ7XG5cbiAgICBjb25zdCBjYW52YXNTaXplID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/XG4gICAgICB0aGlzLl9jYW52YXNXaWR0aCA6IHRoaXMuX2NhbnZhc0hlaWdodDtcblxuICAgIGNvbnN0IGRvbWFpbiA9IG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgPyBbbWluLCBtYXhdIDogW21heCwgbWluXTtcbiAgICBjb25zdCBzY3JlZW5SYW5nZSA9IFswLCBzY3JlZW5TaXplXTtcbiAgICBjb25zdCBjYW52YXNSYW5nZSA9IFswLCBjYW52YXNTaXplXTtcblxuICAgIHRoaXMuc2NyZWVuU2NhbGUgPSBnZXRTY2FsZShkb21haW4sIHNjcmVlblJhbmdlKTtcbiAgICB0aGlzLmNhbnZhc1NjYWxlID0gZ2V0U2NhbGUoZG9tYWluLCBjYW52YXNSYW5nZSk7XG4gICAgdGhpcy5jbGlwcGVyID0gZ2V0Q2xpcHBlcihtaW4sIG1heCwgc3RlcCk7XG4gIH1cblxuICBfYmluZEV2ZW50cygpIHtcbiAgICB0aGlzLiRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24pO1xuICAgIHRoaXMuJGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaFN0YXJ0LCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICB9XG5cbiAgX29uU3RhcnQoeCwgeSkge1xuICAgIGxldCBzdGFydGVkID0gbnVsbDtcblxuICAgIHN3aXRjaCAodGhpcy5wYXJhbXMubW9kZSkge1xuICAgICAgY2FzZSAnanVtcCc6XG4gICAgICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKHgsIHkpO1xuICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9wb3J0aW9ubmFsJzpcbiAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueCA9IHg7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnkgPSB5O1xuICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdoYW5kbGUnOlxuICAgICAgICBjb25zdCBvcmllbnRhdGlvbiA9IHRoaXMucGFyYW1zLm9yaWVudGF0aW9uO1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuc2NyZWVuU2NhbGUodGhpcy5fdmFsdWUpO1xuICAgICAgICBjb25zdCBjb21wYXJlID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/IHggOiB5O1xuICAgICAgICBjb25zdCBkZWx0YSA9IHRoaXMucGFyYW1zLmhhbmRsZVNpemUgLyAyO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKG9yaWVudGF0aW9uLCBwb3NpdGlvbiwgY29tcGFyZSwgZGVsdGEpO1xuXG4gICAgICAgIGlmIChjb21wYXJlIDwgcG9zaXRpb24gKyBkZWx0YSAmJiBjb21wYXJlID4gcG9zaXRpb24gLSBkZWx0YSkge1xuICAgICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnggPSB4O1xuICAgICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnkgPSB5O1xuICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhcnRlZDtcbiAgfVxuXG4gIF9vbk1vdmUoeCwgeSkge1xuICAgIHN3aXRjaCAodGhpcy5wYXJhbXMubW9kZSkge1xuICAgICAgY2FzZSAnanVtcCc6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncHJvcG9ydGlvbm5hbCc6XG4gICAgICBjYXNlICdoYW5kbGUnOlxuICAgICAgICBjb25zdCBkZWx0YVggPSB4IC0gdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueDtcbiAgICAgICAgY29uc3QgZGVsdGFZID0geSAtIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnk7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnggPSB4O1xuICAgICAgICB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbi55ID0geTtcblxuICAgICAgICB4ID0gdGhpcy5zY3JlZW5TY2FsZSh0aGlzLl92YWx1ZSkgKyBkZWx0YVg7XG4gICAgICAgIHkgPSB0aGlzLnNjcmVlblNjYWxlKHRoaXMuX3ZhbHVlKSArIGRlbHRhWTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oeCwgeSk7XG4gIH1cblxuICBfb25FbmQoKSB7XG4gICAgc3dpdGNoICh0aGlzLnBhcmFtcy5tb2RlKSB7XG4gICAgICBjYXNlICdqdW1wJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9wb3J0aW9ubmFsJzpcbiAgICAgIGNhc2UgJ2hhbmRsZSc6XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnggPSBudWxsO1xuICAgICAgICB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbi55ID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gbW91c2UgZXZlbnRzXG4gIF9vbk1vdXNlRG93bihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgY29uc3QgcGFnZVggPSBlLnBhZ2VYO1xuICAgIGNvbnN0IHBhZ2VZID0gZS5wYWdlWTtcbiAgICBjb25zdCB4ID0gcGFnZVggLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QubGVmdDtcbiAgICBjb25zdCB5ID0gcGFnZVkgLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QudG9wO1xuXG4gICAgaWYgKHRoaXMuX29uU3RhcnQoeCwgeSkgPT09IHRydWUpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCk7XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VNb3ZlKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIHByZXZlbnQgdGV4dCBzZWxlY3Rpb25cblxuICAgIGNvbnN0IHBhZ2VYID0gZS5wYWdlWDtcbiAgICBjb25zdCBwYWdlWSA9IGUucGFnZVk7XG4gICAgbGV0IHggPSBwYWdlWCAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC5sZWZ0OztcbiAgICBsZXQgeSA9IHBhZ2VZIC0gdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0LnRvcDs7XG5cbiAgICB0aGlzLl9vbk1vdmUoeCwgeSk7XG4gIH1cblxuICBfb25Nb3VzZVVwKGUpIHtcbiAgICB0aGlzLl9vbkVuZCgpO1xuXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCk7XG4gIH1cblxuICAvLyB0b3VjaCBldmVudHNcbiAgX29uVG91Y2hTdGFydChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgaWYgKHRoaXMuX3RvdWNoSWQgIT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBjb25zaWRlciB0aGUgbGFzdCB0b3VjaCBvZiB0aGUgbGlzdCwgYXMgYW5vdGhlciB0b3VjaCBtaWdodCBoYXZlXG4gICAgLy8gb2NjdXJlZCBzb21ld2hlcmUgZWxzZSBvbiB0aGUgc2NyZWVuXG4gICAgY29uc3QgdG91Y2ggPSBlLnRvdWNoZXNbZS50b3VjaGVzLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IHBhZ2VYID0gdG91Y2gucGFnZVg7XG4gICAgY29uc3QgcGFnZVkgPSB0b3VjaC5wYWdlWTtcbiAgICBjb25zdCB4ID0gcGFnZVggLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QubGVmdDtcbiAgICBjb25zdCB5ID0gcGFnZVkgLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QudG9wO1xuXG4gICAgaWYgKHRoaXMuX29uU3RhcnQoeCwgeSkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuX3RvdWNoSWQgPSB0b3VjaC5pZGVudGlmaWVyO1xuICAgICAgLy8gZGlzYWJsZSB0b3VjaHN0YXJ0XG4gICAgICB0aGlzLiRjYW52YXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2hTdGFydCk7XG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9vblRvdWNoTW92ZSwgeyBwYXNzaXZlOiBmYWxzZSB9KTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX29uVG91Y2hFbmQpO1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5fb25Ub3VjaEVuZCk7XG4gICAgfVxuICB9XG5cbiAgX29uVG91Y2hNb3ZlKGUpIHtcbiAgICBjb25zdCB0b3VjaGVzID0gQXJyYXkuZnJvbShlLnRvdWNoZXMpO1xuICAgIGNvbnN0IHRvdWNoID0gdG91Y2hlcy5maWx0ZXIodCA9PiB0LmlkZW50aWZpZXIgPT09IHRoaXMuX3RvdWNoSWQpWzBdO1xuXG4gICAgaWYgKHRvdWNoKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIHByZXZlbnQgdGV4dCBzZWxlY3Rpb25cblxuICAgICAgY29uc3QgcGFnZVggPSB0b3VjaC5wYWdlWDtcbiAgICAgIGNvbnN0IHBhZ2VZID0gdG91Y2gucGFnZVk7XG4gICAgICBjb25zdCB4ID0gcGFnZVggLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QubGVmdDtcbiAgICAgIGNvbnN0IHkgPSBwYWdlWSAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC50b3A7XG5cbiAgICAgIHRoaXMuX29uTW92ZSh4LCB5KTtcbiAgICB9XG4gIH1cblxuICBfb25Ub3VjaEVuZChlKSB7XG4gICAgY29uc3QgdG91Y2hlcyA9IEFycmF5LmZyb20oZS50b3VjaGVzKTtcbiAgICBjb25zdCB0b3VjaCA9IHRvdWNoZXMuZmlsdGVyKCh0KSA9PiB0LmlkZW50aWZpZXIgPT09IHRoaXMuX3RvdWNoSWQpWzBdO1xuICAgIGNvbnNvbGUubG9nKCd0b3VjaEVuZCcsIHRvdWNoKTtcblxuICAgIGlmICh0b3VjaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9vbkVuZCgpO1xuICAgICAgdGhpcy5fdG91Y2hJZCA9IG51bGw7XG5cbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLl9vblRvdWNoTW92ZSk7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLl9vblRvdWNoRW5kKTtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMuX29uVG91Y2hFbmQpO1xuICAgICAgLy8gcmUtZW5hYmxlIHRvdWNoc3RhcnRcbiAgICAgIHRoaXMuJGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5fb25Ub3VjaFN0YXJ0LCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVQb3NpdGlvbih4LCB5KSB7XG4gICAgY29uc3Qge8Kgb3JpZW50YXRpb24sIGhlaWdodCB9ID0gdGhpcy5wYXJhbXM7XG4gICAgY29uc3QgcG9zaXRpb24gPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8geCA6IHk7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnNjcmVlblNjYWxlLmludmVydChwb3NpdGlvbik7XG5cbiAgICB0aGlzLl91cGRhdGVWYWx1ZSh2YWx1ZSwgZmFsc2UsIHRydWUpO1xuICB9XG5cbiAgX3JlbmRlcihjbGlwcGVkVmFsdWUpIHtcbiAgICBjb25zdCB7IGJhY2tncm91bmRDb2xvciwgZm9yZWdyb3VuZENvbG9yLCBvcmllbnRhdGlvbiB9ID0gdGhpcy5wYXJhbXM7XG4gICAgY29uc3QgY2FudmFzUG9zaXRpb24gPSBNYXRoLnJvdW5kKHRoaXMuY2FudmFzU2NhbGUoY2xpcHBlZFZhbHVlKSk7XG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLl9jYW52YXNXaWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLl9jYW52YXNIZWlnaHQ7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG5cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAvLyBiYWNrZ3JvdW5kXG4gICAgY3R4LmZpbGxTdHlsZSA9IGJhY2tncm91bmRDb2xvcjtcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAvLyBmb3JlZ3JvdW5kXG4gICAgY3R4LmZpbGxTdHlsZSA9IGZvcmVncm91bmRDb2xvcjtcblxuICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnKVxuICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhc1Bvc2l0aW9uLCBoZWlnaHQpO1xuICAgIGVsc2VcbiAgICAgIGN0eC5maWxsUmVjdCgwLCBjYW52YXNQb3NpdGlvbiwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAvLyBtYXJrZXJzXG4gICAgY29uc3QgbWFya2VycyA9IHRoaXMucGFyYW1zLm1hcmtlcnM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG1hcmtlciA9IG1hcmtlcnNbaV07XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuY2FudmFzU2NhbGUobWFya2VyKTtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyknO1xuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgICBpZiAob3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICBjdHgubW92ZVRvKHBvc2l0aW9uIC0gMC41LCAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyhwb3NpdGlvbiAtIDAuNSwgaGVpZ2h0IC0gMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdHgubW92ZVRvKDEsIGhlaWdodCAtIHBvc2l0aW9uICsgMC41KTtcbiAgICAgICAgY3R4LmxpbmVUbyh3aWR0aCAtIDEsIGhlaWdodCAtIHBvc2l0aW9uICsgMC41KTtcbiAgICAgIH1cblxuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBtb2RlXG4gICAgaWYgKHRoaXMucGFyYW1zLm1vZGUgPT09ICdoYW5kbGUnICYmIHRoaXMucGFyYW1zLnNob3dIYW5kbGUpIHtcbiAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy5wYXJhbXMuaGFuZGxlU2l6ZSAqIHRoaXMuX3BpeGVsUmF0aW8gLyAyO1xuICAgICAgY29uc3Qgc3RhcnQgPSBjYW52YXNQb3NpdGlvbiAtIGRlbHRhO1xuICAgICAgY29uc3QgZW5kID0gY2FudmFzUG9zaXRpb24gKyBkZWx0YTtcblxuICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnBhcmFtcy5oYW5kbGVDb2xvcjtcblxuICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgY3R4LmZpbGxSZWN0KHN0YXJ0LCAwLCBlbmQgLSBzdGFydCwgaGVpZ2h0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN0eC5maWxsUmVjdCgwLCBzdGFydCwgd2lkdGgsIGVuZCAtIHN0YXJ0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjdHgucmVzdG9yZSgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNsaWRlcjtcbiIsImltcG9ydCB7IFNsaWRlciB9IGZyb20gJ0BpcmNhbS9ndWktY29tcG9uZW50cyc7XG5cbi8vIGp1bXBcbmNvbnN0ICRmZWVkYmFja0p1bXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmVlZGJhY2stanVtcCcpO1xuXG5jb25zdCBzbGlkZXJKdW1wID0gbmV3IFNsaWRlcih7XG4gIG1vZGU6ICdqdW1wJyxcbiAgY29udGFpbmVyOiAnI3NsaWRlci1qdW1wJyxcbiAgbWluOiAwLFxuICBtYXg6IDEsXG4gIGRlZmF1bHQ6IDAuNixcbiAgc3RlcDogMC4wMDEsXG4gIGJhY2tncm91bmRDb2xvcjogJyM0NjQ2NDYnLFxuICBmb3JlZ3JvdW5kQ29sb3I6ICdzdGVlbGJsdWUnLFxuICBtYXJrZXJzOiBbMC43XSxcbiAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJywgLy8gJ3ZlcnRpY2FsJ1xuICB3aWR0aDogNDAwLFxuICBoZWlnaHQ6IDMwLFxuICBjYWxsYmFjazogKHZhbCkgPT4gJGZlZWRiYWNrSnVtcC50ZXh0Q29udGVudCA9IHZhbCxcbn0pO1xuXG4vLyBtYWtlIHN1cmUgY2FsbGJhY2sgaXMgbm90IHRyaWdnZXJlZCB3aGVuIHVwZGF0aW5nIG1hbnVhbGx5XG5zZXRUaW1lb3V0KCgpID0+IHtcbiAgY29uc3Qgb2xkQ2FsbGJhY2sgPSBzbGlkZXJKdW1wLnBhcmFtcy5jYWxsYmFjaztcbiAgY29uc3QgdGVzdFZhbHVlID0gMTtcbiAgc2xpZGVySnVtcC5wYXJhbXMuY2FsbGJhY2sgPSAodmFsdWUpID0+IHtcbiAgICBpZiAodmFsdWUgPT0gdGVzdFZhbHVlKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgc2xpZGVyLnZhbHVlID0gbmV3VmFsdWVgIHNob3VsZCBiZSBzaWxlbnQnKTtcbiAgfVxuXG4gIHNsaWRlckp1bXAudmFsdWUgPSB0ZXN0VmFsdWU7XG4gIHNsaWRlckp1bXAucGFyYW1zLmNhbGxiYWNrID0gb2xkQ2FsbGJhY2s7XG59LCA1MDApO1xuXG4vLyBwcm9wb3J0aW9ubmFsXG5jb25zdCAkZmVlZGJhY2tQcm9wb3J0aW9ubmFsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZlZWRiYWNrLXByb3BvcnRpb25uYWwnKTtcblxuY29uc3Qgc2xpZGVyUHJvcG9ydGlvbm5hbCA9IG5ldyBTbGlkZXIoe1xuICBtb2RlOiAncHJvcG9ydGlvbm5hbCcsXG4gIGNvbnRhaW5lcjogJyNzbGlkZXItcHJvcG9ydGlvbm5hbCcsXG4gIG1pbjogLTUwLFxuICBtYXg6IDUwLFxuICBkZWZhdWx0OiAyMCxcbiAgc3RlcDogMC4xLFxuICBiYWNrZ3JvdW5kQ29sb3I6ICcjNDY0NjQ2JyxcbiAgZm9yZWdyb3VuZENvbG9yOiAnc3RlZWxibHVlJyxcbiAgbWFya2VyczogWzBdLFxuICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJywgLy8gJ3ZlcnRpY2FsJ1xuICB3aWR0aDogMzAsXG4gIGhlaWdodDogMzAwLFxuICBjYWxsYmFjazogKHZhbCkgPT4gJGZlZWRiYWNrUHJvcG9ydGlvbm5hbC50ZXh0Q29udGVudCA9IHZhbCxcbn0pO1xuXG4vLyBoYW5kbGVcbmNvbnN0ICRmZWVkYmFja0hhbmRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmZWVkYmFjay1oYW5kbGUnKTtcblxuY29uc3Qgc2xpZGVySGFuZGxlID0gbmV3IFNsaWRlcih7XG4gIG1vZGU6ICdoYW5kbGUnLFxuICBjb250YWluZXI6ICcjc2xpZGVyLWhhbmRsZScsXG4gIG1pbjogLTUwLFxuICBtYXg6IDUwLFxuICBkZWZhdWx0OiAyMCxcbiAgc3RlcDogMC4xLFxuICBiYWNrZ3JvdW5kQ29sb3I6ICcjNDY0NjQ2JyxcbiAgZm9yZWdyb3VuZENvbG9yOiAnc3RlZWxibHVlJyxcbiAgbWFya2Vyc0NvbG9yOiAnb3JhbmdlJyxcbiAgbWFya2VyczogWzBdLFxuICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLCAvLyAndmVydGljYWwnXG4gIHdpZHRoOiAzMDAsXG4gIGhlaWdodDogMzAwLFxuXG4gIC8vIGhhbmRsZSBzcGVjaWZpYyBwYXJhbXNcbiAgc2hvd0hhbmRsZTogdHJ1ZSxcbiAgaGFuZGxlU2l6ZTogMjAsXG4gIGhhbmRsZUNvbG9yOiAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpJyxcbiAgY2FsbGJhY2s6ICh2YWwpID0+ICRmZWVkYmFja0hhbmRsZS50ZXh0Q29udGVudCA9IHZhbCxcbn0pO1xuXG4iXX0=
