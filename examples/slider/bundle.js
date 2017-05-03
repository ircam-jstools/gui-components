(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    this._listeners = [];
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

},{}],2:[function(require,module,exports){
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./Slider":1}],3:[function(require,module,exports){
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

},{"../../../dist/index":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9kaXN0L1NsaWRlci5qcyIsIi4uLy4uL2Rpc3QvaW5kZXguanMiLCJkaXN0L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQ0FBLFNBQVMsUUFBVCxDQUFrQixNQUFsQixFQUEwQixLQUExQixFQUFpQztBQUMvQixNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQU4sSUFBVyxNQUFNLENBQU4sQ0FBWixLQUF5QixPQUFPLENBQVAsSUFBWSxPQUFPLENBQVAsQ0FBckMsQ0FBZDtBQUNBLE1BQU0sWUFBWSxNQUFNLENBQU4sSUFBVyxRQUFRLE9BQU8sQ0FBUCxDQUFyQzs7QUFFQSxXQUFTLEtBQVQsQ0FBZSxHQUFmLEVBQW9CO0FBQ2xCLFdBQU8sUUFBUSxHQUFSLEdBQWMsU0FBckI7QUFDRDs7QUFFRCxRQUFNLE1BQU4sR0FBZSxVQUFTLEdBQVQsRUFBYztBQUMzQixXQUFPLENBQUMsTUFBTSxTQUFQLElBQW9CLEtBQTNCO0FBQ0QsR0FGRDs7QUFJQSxTQUFPLEtBQVA7QUFDRDs7QUFFRCxTQUFTLFVBQVQsQ0FBb0IsR0FBcEIsRUFBeUIsR0FBekIsRUFBOEIsSUFBOUIsRUFBb0M7QUFDbEMsU0FBTyxVQUFDLEdBQUQsRUFBUztBQUNkLFFBQU0sZUFBZSxLQUFLLEtBQUwsQ0FBVyxNQUFNLElBQWpCLElBQXlCLElBQTlDO0FBQ0EsUUFBTSxRQUFRLEtBQUssR0FBTCxDQUFTLEtBQUssS0FBTCxDQUFXLElBQUksSUFBZixDQUFULEVBQStCLENBQS9CLENBQWQ7QUFDQSxRQUFNLGFBQWEsYUFBYSxPQUFiLENBQXFCLEtBQXJCLENBQW5CLENBSGMsQ0FHa0M7QUFDaEQsV0FBTyxLQUFLLEdBQUwsQ0FBUyxHQUFULEVBQWMsS0FBSyxHQUFMLENBQVMsR0FBVCxFQUFjLFdBQVcsVUFBWCxDQUFkLENBQWQs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K0I7QUFFckMsYUFBVyx1QkFGMEI7QUFHckMsT0FBSyxDQUFDLEVBSCtCO0FBSXJDLE9BQUssRUFKZ0M7QUFLckMsV0FBUyxFQUw0QjtBQU1yQyxRQUFNLEdBTitCO0FBT3JDLG1CQUFpQixTQVBvQjtBQVFyQyxtQkFBaUIsV0FSb0I7QUFTckMsV0FBUyxDQUFDLENBQUQsQ0FUNEI7QUFVckMsZUFBYSxVQVZ3QixFQVVaO0FBQ3pCLFNBQU8sRUFYOEI7QUFZckMsVUFBUSxHQVo2QjtBQWFyQyxZQUFVLGtCQUFDLEdBQUQ7QUFBQSxXQUFTLHVCQUF1QixXQUF2QixHQUFxQyxHQUE5QztBQUFBO0FBYjJCLENBQVgsQ0FBNUI7O0FBZ0JBO0FBQ0EsSUFBTSxrQkFBa0IsU0FBUyxhQUFULENBQXVCLGtCQUF2QixDQUF4Qjs7QUFFQSxJQUFNLGVBQWUsa0JBQVc7QUFDOUIsUUFBTSxRQUR3QjtBQUU5QixhQUFXLGdCQUZtQjtBQUc5QixPQUFLLENBQUMsRUFId0I7QUFJOUIsT0FBSyxFQUp5QjtBQUs5QixXQUFTLEVBTHFCO0FBTTlCLFFBQU0sR0FOd0I7QUFPOUIsbUJBQWlCLFNBUGE7QUFROUIsbUJBQWlCLFdBUmE7QUFTOUIsZ0JBQWMsUUFUZ0I7QUFVOUIsV0FBUyxDQUFDLENBQUQsQ0FWcUI7QUFXOUIsZUFBYSxZQVhpQixFQVdIO0FBQzNCLFNBQU8sR0FadUI7QUFhOUIsVUFBUSxHQWJzQjs7QUFlOUI7QUFDQSxjQUFZLElBaEJrQjtBQWlCOUIsY0FBWSxFQWpCa0I7QUFrQjlCLGVBQWEsMEJBbEJpQjtBQW1COUIsWUFBVSxrQkFBQyxHQUFEO0FBQUEsV0FBUyxnQkFBZ0IsV0FBaEIsR0FBOEIsR0FBdkM7QUFBQTtBQW5Cb0IsQ0FBWCxDQUFyQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBnZXRTY2FsZShkb21haW4sIHJhbmdlKSB7XG4gIGNvbnN0IHNsb3BlID0gKHJhbmdlWzFdIC0gcmFuZ2VbMF0pIC8gKGRvbWFpblsxXSAtIGRvbWFpblswXSk7XG4gIGNvbnN0IGludGVyY2VwdCA9IHJhbmdlWzBdIC0gc2xvcGUgKiBkb21haW5bMF07XG5cbiAgZnVuY3Rpb24gc2NhbGUodmFsKSB7XG4gICAgcmV0dXJuIHNsb3BlICogdmFsICsgaW50ZXJjZXB0O1xuICB9XG5cbiAgc2NhbGUuaW52ZXJ0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuICh2YWwgLSBpbnRlcmNlcHQpIC8gc2xvcGU7XG4gIH1cblxuICByZXR1cm4gc2NhbGU7XG59XG5cbmZ1bmN0aW9uIGdldENsaXBwZXIobWluLCBtYXgsIHN0ZXApIHtcbiAgcmV0dXJuICh2YWwpID0+IHtcbiAgICBjb25zdCBjbGlwcGVkVmFsdWUgPSBNYXRoLnJvdW5kKHZhbCAvIHN0ZXApICogc3RlcDtcbiAgICBjb25zdCBmaXhlZCA9IE1hdGgubWF4KE1hdGgubG9nMTAoMSAvIHN0ZXApLCAwKTtcbiAgICBjb25zdCBmaXhlZFZhbHVlID0gY2xpcHBlZFZhbHVlLnRvRml4ZWQoZml4ZWQpOyAvLyBmaXggZmxvYXRpbmcgcG9pbnQgZXJyb3JzXG4gICAgcmV0dXJuIE1hdGgubWluKG1heCwgTWF0aC5tYXgobWluLCBwYXJzZUZsb2F0KGZpeGVkVmFsdWUpKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBAbW9kdWxlIGd1aS1jb21wb25lbnRzXG4gKi9cblxuLyoqXG4gKiBWZXJzYXRpbGUgY2FudmFzIGJhc2VkIHNsaWRlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlIGRlZmF1bHQgcGFyYW1ldGVycy5cbiAqIEBwYXJhbSB7J2p1bXAnfCdwcm9wb3J0aW9ubmFsJ3wnaGFuZGxlJ30gW29wdGlvbnMubW9kZT0nanVtcCddIC0gTW9kZSBvZiB0aGUgc2xpZGVyOlxuICogIC0gaW4gJ2p1bXAnIG1vZGUsIHRoZSB2YWx1ZSBpcyBjaGFuZ2VkIG9uICd0b3VjaHN0YXJ0JyBvciAnbW91c2Vkb3duJywgYW5kXG4gKiAgICBvbiBtb3ZlLlxuICogIC0gaW4gJ3Byb3BvcnRpb25uYWwnIG1vZGUsIHRoZSB2YWx1ZSBpcyB1cGRhdGVkIHJlbGF0aXZlbHkgdG8gbW92ZS5cbiAqICAtIGluICdoYW5kbGUnIG1vZGUsIHRoZSBzbGlkZXIgY2FuIGJlIGdyYWJiZWQgb25seSBhcm91bmQgaXRzIHZhbHVlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMuY2FsbGJhY2tdIC0gQ2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgdmFsdWVcbiAqICBvZiB0aGUgc2xpZGVyIGNoYW5nZXMuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMud2lkdGg9MjAwXSAtIFdpZHRoIG9mIHRoZSBzbGlkZXIuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuaGVpZ2h0PTMwXSAtIEhlaWdodCBvZiB0aGUgc2xpZGVyLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLm1pbj0wXSAtIE1pbmltdW0gdmFsdWUuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMubWF4PTFdIC0gTWF4aW11bSB2YWx1ZS5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5zdGVwPTAuMDFdIC0gU3RlcCBiZXR3ZWVuIGVhY2ggY29uc2VjdXRpdmUgdmFsdWVzLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmRlZmF1bHQ9MF0gLSBEZWZhdWx0IHZhbHVlLlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudH0gW29wdGlvbnMuY29udGFpbmVyPSdib2R5J10gLSBDU1MgU2VsZWN0b3Igb3IgRE9NXG4gKiAgZWxlbWVudCBpbiB3aGljaCBpbnNlcnRpbmcgdGhlIHNsaWRlci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3I9JyM0NjQ2NDYnXSAtIEJhY2tncm91bmQgY29sb3Igb2YgdGhlXG4gKiAgc2xpZGVyLlxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmZvcmVncm91bmRDb2xvcj0nc3RlZWxibHVlJ10gLSBGb3JlZ3JvdW5kIGNvbG9yIG9mXG4gKiAgdGhlIHNsaWRlci5cbiAqIEBwYXJhbSB7J2hvcml6b250YWwnfCd2ZXJ0aWNhbCd9IFtvcHRpb25zLm9yaWVudGF0aW9uPSdob3Jpem9udGFsJ10gLVxuICogIE9yaWVudGF0aW9uIG9mIHRoZSBzbGlkZXIuXG4gKiBAcGFyYW0ge0FycmF5fSBbb3B0aW9ucy5tYXJrZXJzPVtdXSAtIExpc3Qgb2YgdmFsdWVzIHdoZXJlIG1hcmtlcnMgc2hvdWxkXG4gKiAgYmUgZGlzcGxheWVkIG9uIHRoZSBzbGlkZXIuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLnNob3dIYW5kbGU9dHJ1ZV0gLSBJbiAnaGFuZGxlJyBtb2RlLCBkZWZpbmUgaWYgdGhlXG4gKiAgZHJhZ2dhYmxlIHNob3VsZCBiZSBzaG93IG9yIG5vdC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5oYW5kbGVTaXplPTIwXSAtIFNpemUgb2YgdGhlIGRyYWdnYWJsZSB6b25lLlxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmhhbmRsZUNvbG9yPSdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyknXSAtIENvbG9yIG9mIHRoZVxuICogIGRyYWdnYWJsZSB6b25lICh3aGVuIGBzaG93SGFuZGxlYCBpcyBgdHJ1ZWApLlxuICpcbiAqIEBleGFtcGxlXG4gKiBpbXBvcnQgeyBTbGlkZXJ9IGZyb20gJ2d1aS1jb21wb25lbnRzJztcbiAqXG4gKiBjb25zdCBzbGlkZXIgPSBuZXcgU2xpZGVyKHtcbiAqICAgbW9kZTogJ2p1bXAnLFxuICogICBjb250YWluZXI6ICcjY29udGFpbmVyJyxcbiAqICAgZGVmYXVsdDogMC42LFxuICogICBtYXJrZXJzOiBbMC41XSxcbiAqICAgY2FsbGJhY2s6ICh2YWx1ZSkgPT4gY29uc29sZS5sb2codmFsdWUpLFxuICogfSk7XG4gKi9cbmNsYXNzIFNsaWRlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAgIG1vZGU6ICdqdW1wJyxcbiAgICAgIGNhbGxiYWNrOiB2YWx1ZSA9PiB7fSxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDMwLFxuICAgICAgbWluOiAwLFxuICAgICAgbWF4OiAxLFxuICAgICAgc3RlcDogMC4wMSxcbiAgICAgIGRlZmF1bHQ6IDAsXG4gICAgICBjb250YWluZXI6ICdib2R5JyxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyM0NjQ2NDYnLFxuICAgICAgZm9yZWdyb3VuZENvbG9yOiAnc3RlZWxibHVlJyxcbiAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXG4gICAgICBtYXJrZXJzOiBbXSxcblxuICAgICAgLy8gaGFuZGxlIHNwZWNpZmljIG9wdGlvbnNcbiAgICAgIHNob3dIYW5kbGU6IHRydWUsXG4gICAgICBoYW5kbGVTaXplOiAyMCxcbiAgICAgIGhhbmRsZUNvbG9yOiAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpJyxcbiAgICB9O1xuXG4gICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW107XG4gICAgdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0ID0gbnVsbDtcbiAgICB0aGlzLl90b3VjaElkID0gbnVsbDtcbiAgICB0aGlzLl92YWx1ZSA9IG51bGw7XG4gICAgdGhpcy5fY2FudmFzV2lkdGggPSBudWxsO1xuICAgIHRoaXMuX2NhbnZhc0hlaWdodCA9IG51bGw7XG4gICAgLy8gZm9yIHByb3BvcnRpb25uYWwgbW9kZVxuICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uID0geyB4OiBudWxsLCB5OiBudWxsIH07XG4gICAgdGhpcy5fY3VycmVudFNsaWRlclBvc2l0aW9uID0gbnVsbDtcblxuICAgIHRoaXMuX29uTW91c2VEb3duID0gdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbk1vdXNlTW92ZSA9IHRoaXMuX29uTW91c2VNb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Nb3VzZVVwID0gdGhpcy5fb25Nb3VzZVVwLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLl9vblRvdWNoU3RhcnQgPSB0aGlzLl9vblRvdWNoU3RhcnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblRvdWNoTW92ZSA9IHRoaXMuX29uVG91Y2hNb3ZlIC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uVG91Y2hFbmQgPSB0aGlzLl9vblRvdWNoRW5kLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLl9vblJlc2l6ZSA9IHRoaXMuX29uUmVzaXplLmJpbmQodGhpcyk7XG5cblxuICAgIHRoaXMuX2NyZWF0ZUVsZW1lbnQoKTtcblxuICAgIC8vIGluaXRpYWxpemVcbiAgICB0aGlzLl9yZXNpemVFbGVtZW50KCk7XG4gICAgdGhpcy5fc2V0U2NhbGVzKCk7XG4gICAgdGhpcy5fYmluZEV2ZW50cygpO1xuICAgIHRoaXMuX29uUmVzaXplKCk7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWUodGhpcy5wYXJhbXMuZGVmYXVsdCwgdHJ1ZSwgdHJ1ZSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fb25SZXNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgdmFsdWUgb2YgdGhlIHNsaWRlci5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGdldCB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cblxuICBzZXQgdmFsdWUodmFsKSB7XG4gICAgLy8gZG9uJ3QgdHJpZ2dlciB0aGUgY2FsbGJhY2sgd2hlbiB2YWx1ZSBpcyBzZXQgZnJvbSBvdXRzaWRlXG4gICAgdGhpcy5fdXBkYXRlVmFsdWUodmFsLCB0cnVlLCBmYWxzZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIHNsaWRlciB0byBpdHMgZGVmYXVsdCB2YWx1ZS5cbiAgICovXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX3VwZGF0ZVZhbHVlKHRoaXMucGFyYW1zLmRlZmF1bHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2l6ZSB0aGUgc2xpZGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gd2lkdGggLSBOZXcgd2lkdGggb2YgdGhlIHNsaWRlci5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodCAtIE5ldyBoZWlnaHQgb2YgdGhlIHNsaWRlci5cbiAgICovXG4gIHJlc2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy5wYXJhbXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLnBhcmFtcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLl9yZXNpemVFbGVtZW50KCk7XG4gICAgdGhpcy5fc2V0U2NhbGVzKCk7XG4gICAgdGhpcy5fb25SZXNpemUoKTtcbiAgICB0aGlzLl91cGRhdGVWYWx1ZSh0aGlzLl92YWx1ZSwgdHJ1ZSwgdHJ1ZSk7XG4gIH1cblxuICBfdXBkYXRlVmFsdWUodmFsdWUsIHNpbGVudCA9IGZhbHNlLCBmb3JjZVJlbmRlciA9IGZhbHNlKSB7XG4gICAgY29uc3QgeyBjYWxsYmFjayB9ID0gdGhpcy5wYXJhbXM7XG4gICAgY29uc3QgY2xpcHBlZFZhbHVlID0gdGhpcy5jbGlwcGVyKHZhbHVlKTtcblxuICAgIC8vIHJlc2l6ZSByZW5kZXIgYnV0IGRvbid0IHRyaWdnZXIgY2FsbGJhY2tcbiAgICBpZiAoY2xpcHBlZFZhbHVlID09PSB0aGlzLl92YWx1ZSAmJiBmb3JjZVJlbmRlciA9PT0gdHJ1ZSlcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLl9yZW5kZXIoY2xpcHBlZFZhbHVlKSk7XG5cbiAgICAvLyB0cmlnZ2VyIGNhbGxiYWNrXG4gICAgaWYgKGNsaXBwZWRWYWx1ZSAhPT0gdGhpcy5fdmFsdWUpIHtcbiAgICAgIHRoaXMuX3ZhbHVlID0gY2xpcHBlZFZhbHVlO1xuXG4gICAgICBpZiAoIXNpbGVudClcbiAgICAgICAgY2FsbGJhY2soY2xpcHBlZFZhbHVlKTtcblxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuX3JlbmRlcihjbGlwcGVkVmFsdWUpKTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlRWxlbWVudCgpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciB9ID0gdGhpcy5wYXJhbXM7XG4gICAgdGhpcy4kY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdGhpcy5jdHggPSB0aGlzLiRjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIGlmIChjb250YWluZXIgaW5zdGFuY2VvZiBFbGVtZW50KVxuICAgICAgdGhpcy4kY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuJGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyKTtcblxuICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLiRjYW52YXMpO1xuICB9XG5cbiAgX3Jlc2l6ZUVsZW1lbnQoKSB7XG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzLnBhcmFtcztcblxuICAgIC8vIGxvZ2ljYWwgYW5kIHBpeGVsIHNpemUgb2YgdGhlIGNhbnZhc1xuICAgIHRoaXMuX3BpeGVsUmF0aW8gPSAoZnVuY3Rpb24oY3R4KSB7XG4gICAgY29uc3QgZFBSID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICBjb25zdCBiUFIgPSBjdHgud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgY3R4Lm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgIGN0eC5tc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgIGN0eC5vQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgY3R4LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgMTtcblxuICAgICAgcmV0dXJuIGRQUiAvIGJQUjtcbiAgICB9KHRoaXMuY3R4KSk7XG5cbiAgICB0aGlzLl9jYW52YXNXaWR0aCA9IHdpZHRoICogdGhpcy5fcGl4ZWxSYXRpbztcbiAgICB0aGlzLl9jYW52YXNIZWlnaHQgPSBoZWlnaHQgKiB0aGlzLl9waXhlbFJhdGlvO1xuXG4gICAgdGhpcy5jdHguY2FudmFzLndpZHRoID0gdGhpcy5fY2FudmFzV2lkdGg7XG4gICAgdGhpcy5jdHguY2FudmFzLmhlaWdodCA9IHRoaXMuX2NhbnZhc0hlaWdodDtcbiAgICB0aGlzLmN0eC5jYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gICAgdGhpcy5jdHguY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gIH1cblxuICBfb25SZXNpemUoKSB7XG4gICAgdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0ID0gdGhpcy4kY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB9XG5cbiAgX3NldFNjYWxlcygpIHtcbiAgICBjb25zdCB7IG9yaWVudGF0aW9uLCB3aWR0aCwgaGVpZ2h0LCBtaW4sIG1heCwgc3RlcCB9ID0gdGhpcy5wYXJhbXM7XG4gICAgLy8gZGVmaW5lIHRyYW5zZmVydCBmdW5jdGlvbnNcbiAgICBjb25zdCBzY3JlZW5TaXplID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/XG4gICAgICB3aWR0aCA6IGhlaWdodDtcblxuICAgIGNvbnN0IGNhbnZhc1NpemUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID9cbiAgICAgIHRoaXMuX2NhbnZhc1dpZHRoIDogdGhpcy5fY2FudmFzSGVpZ2h0O1xuXG4gICAgY29uc3QgZG9tYWluID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/IFttaW4sIG1heF0gOiBbbWF4LCBtaW5dO1xuICAgIGNvbnN0IHNjcmVlblJhbmdlID0gWzAsIHNjcmVlblNpemVdO1xuICAgIGNvbnN0IGNhbnZhc1JhbmdlID0gWzAsIGNhbnZhc1NpemVdO1xuXG4gICAgdGhpcy5zY3JlZW5TY2FsZSA9IGdldFNjYWxlKGRvbWFpbiwgc2NyZWVuUmFuZ2UpO1xuICAgIHRoaXMuY2FudmFzU2NhbGUgPSBnZXRTY2FsZShkb21haW4sIGNhbnZhc1JhbmdlKTtcbiAgICB0aGlzLmNsaXBwZXIgPSBnZXRDbGlwcGVyKG1pbiwgbWF4LCBzdGVwKTtcbiAgfVxuXG4gIF9iaW5kRXZlbnRzKCkge1xuICAgIHRoaXMuJGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bik7XG4gICAgdGhpcy4kY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9vblRvdWNoU3RhcnQpO1xuICB9XG5cbiAgX29uU3RhcnQoeCwgeSkge1xuICAgIGxldCBzdGFydGVkID0gbnVsbDtcblxuICAgIHN3aXRjaCAodGhpcy5wYXJhbXMubW9kZSkge1xuICAgICAgY2FzZSAnanVtcCc6XG4gICAgICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKHgsIHkpO1xuICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9wb3J0aW9ubmFsJzpcbiAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueCA9IHg7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnkgPSB5O1xuICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdoYW5kbGUnOlxuICAgICAgICBjb25zdCBvcmllbnRhdGlvbiA9IHRoaXMucGFyYW1zLm9yaWVudGF0aW9uO1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuc2NyZWVuU2NhbGUodGhpcy5fdmFsdWUpO1xuICAgICAgICBjb25zdCBjb21wYXJlID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/IHggOiB5O1xuICAgICAgICBjb25zdCBkZWx0YSA9IHRoaXMucGFyYW1zLmhhbmRsZVNpemUgLyAyO1xuXG4gICAgICAgIGlmIChjb21wYXJlIDwgcG9zaXRpb24gKyBkZWx0YSAmJiBjb21wYXJlID4gcG9zaXRpb24gLSBkZWx0YSkge1xuICAgICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnggPSB4O1xuICAgICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnkgPSB5O1xuICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhcnRlZDtcbiAgfVxuXG4gIF9vbk1vdmUoeCwgeSkge1xuICAgIHN3aXRjaCAodGhpcy5wYXJhbXMubW9kZSkge1xuICAgICAgY2FzZSAnanVtcCc6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncHJvcG9ydGlvbm5hbCc6XG4gICAgICBjYXNlICdoYW5kbGUnOlxuICAgICAgICBjb25zdCBkZWx0YVggPSB4IC0gdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueDtcbiAgICAgICAgY29uc3QgZGVsdGFZID0geSAtIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnk7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnggPSB4O1xuICAgICAgICB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbi55ID0geTtcblxuICAgICAgICB4ID0gdGhpcy5zY3JlZW5TY2FsZSh0aGlzLl92YWx1ZSkgKyBkZWx0YVg7XG4gICAgICAgIHkgPSB0aGlzLnNjcmVlblNjYWxlKHRoaXMuX3ZhbHVlKSArIGRlbHRhWTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oeCwgeSk7XG4gIH1cblxuICBfb25FbmQoKSB7XG4gICAgc3dpdGNoICh0aGlzLnBhcmFtcy5tb2RlKSB7XG4gICAgICBjYXNlICdqdW1wJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9wb3J0aW9ubmFsJzpcbiAgICAgIGNhc2UgJ2hhbmRsZSc6XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnggPSBudWxsO1xuICAgICAgICB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbi55ID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gbW91c2UgZXZlbnRzXG4gIF9vbk1vdXNlRG93bihlKSB7XG4gICAgY29uc3QgcGFnZVggPSBlLnBhZ2VYO1xuICAgIGNvbnN0IHBhZ2VZID0gZS5wYWdlWTtcbiAgICBjb25zdCB4ID0gcGFnZVggLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QubGVmdDtcbiAgICBjb25zdCB5ID0gcGFnZVkgLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QudG9wO1xuXG4gICAgaWYgKHRoaXMuX29uU3RhcnQoeCwgeSkgPT09IHRydWUpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCk7XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VNb3ZlKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIHByZXZlbnQgdGV4dCBzZWxlY3Rpb25cblxuICAgIGNvbnN0IHBhZ2VYID0gZS5wYWdlWDtcbiAgICBjb25zdCBwYWdlWSA9IGUucGFnZVk7XG4gICAgbGV0IHggPSBwYWdlWCAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC5sZWZ0OztcbiAgICBsZXQgeSA9IHBhZ2VZIC0gdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0LnRvcDs7XG5cbiAgICB0aGlzLl9vbk1vdmUoeCwgeSk7XG4gIH1cblxuICBfb25Nb3VzZVVwKGUpIHtcbiAgICB0aGlzLl9vbkVuZCgpO1xuXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCk7XG4gIH1cblxuICAvLyB0b3VjaCBldmVudHNcbiAgX29uVG91Y2hTdGFydChlKSB7XG4gICAgaWYgKHRoaXMuX3RvdWNoSWQgIT09IG51bGwpIHJldHVybjtcblxuICAgIGNvbnN0IHRvdWNoID0gZS50b3VjaGVzWzBdO1xuICAgIHRoaXMuX3RvdWNoSWQgPSB0b3VjaC5pZGVudGlmaWVyO1xuXG4gICAgY29uc3QgcGFnZVggPSB0b3VjaC5wYWdlWDtcbiAgICBjb25zdCBwYWdlWSA9IHRvdWNoLnBhZ2VZO1xuICAgIGNvbnN0IHggPSBwYWdlWCAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC5sZWZ0O1xuICAgIGNvbnN0IHkgPSBwYWdlWSAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC50b3A7XG5cbiAgICBpZiAodGhpcy5fb25TdGFydCh4LCB5KSA9PT0gdHJ1ZSkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX29uVG91Y2hNb3ZlKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX29uVG91Y2hFbmQpO1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5fb25Ub3VjaEVuZCk7XG4gICAgfVxuICB9XG5cbiAgX29uVG91Y2hNb3ZlKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIHByZXZlbnQgdGV4dCBzZWxlY3Rpb25cblxuICAgIGNvbnN0IHRvdWNoZXMgPSBBcnJheS5mcm9tKGUudG91Y2hlcyk7XG4gICAgY29uc3QgdG91Y2ggPSB0b3VjaGVzLmZpbHRlcigodCkgPT4gdC5pZGVudGlmaWVyID09PSB0aGlzLl90b3VjaElkKVswXTtcblxuICAgIGlmICh0b3VjaCkge1xuICAgICAgY29uc3QgcGFnZVggPSB0b3VjaC5wYWdlWDtcbiAgICAgIGNvbnN0IHBhZ2VZID0gdG91Y2gucGFnZVk7XG4gICAgICBjb25zdCB4ID0gcGFnZVggLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QubGVmdDtcbiAgICAgIGNvbnN0IHkgPSBwYWdlWSAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC50b3A7XG5cbiAgICAgIHRoaXMuX29uTW92ZSh4LCB5KTtcbiAgICB9XG4gIH1cblxuICBfb25Ub3VjaEVuZChlKSB7XG4gICAgY29uc3QgdG91Y2hlcyA9IEFycmF5LmZyb20oZS50b3VjaGVzKTtcbiAgICBjb25zdCB0b3VjaCA9IHRvdWNoZXMuZmlsdGVyKCh0KSA9PiB0LmlkZW50aWZpZXIgPT09IHRoaXMuX3RvdWNoSWQpWzBdO1xuXG4gICAgaWYgKHRvdWNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX29uRW5kKCk7XG4gICAgICB0aGlzLl90b3VjaElkID0gbnVsbDtcblxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX29uVG91Y2hNb3ZlKTtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX29uVG91Y2hFbmQpO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5fb25Ub3VjaEVuZCk7XG5cbiAgICB9XG4gIH1cblxuICBfdXBkYXRlUG9zaXRpb24oeCwgeSkge1xuICAgIGNvbnN0IHvCoG9yaWVudGF0aW9uLCBoZWlnaHQgfSA9IHRoaXMucGFyYW1zO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/IHggOiB5O1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5zY3JlZW5TY2FsZS5pbnZlcnQocG9zaXRpb24pO1xuXG4gICAgdGhpcy5fdXBkYXRlVmFsdWUodmFsdWUsIGZhbHNlLCB0cnVlKTtcbiAgfVxuXG4gIF9yZW5kZXIoY2xpcHBlZFZhbHVlKSB7XG4gICAgY29uc3QgeyBiYWNrZ3JvdW5kQ29sb3IsIGZvcmVncm91bmRDb2xvciwgb3JpZW50YXRpb24gfSA9IHRoaXMucGFyYW1zO1xuICAgIGNvbnN0IGNhbnZhc1Bvc2l0aW9uID0gTWF0aC5yb3VuZCh0aGlzLmNhbnZhc1NjYWxlKGNsaXBwZWRWYWx1ZSkpO1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5fY2FudmFzV2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5fY2FudmFzSGVpZ2h0O1xuICAgIGNvbnN0IGN0eCA9IHRoaXMuY3R4O1xuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgLy8gYmFja2dyb3VuZFxuICAgIGN0eC5maWxsU3R5bGUgPSBiYWNrZ3JvdW5kQ29sb3I7XG4gICAgY3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgLy8gZm9yZWdyb3VuZFxuICAgIGN0eC5maWxsU3R5bGUgPSBmb3JlZ3JvdW5kQ29sb3I7XG5cbiAgICBpZiAob3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJylcbiAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBjYW52YXNQb3NpdGlvbiwgaGVpZ2h0KTtcbiAgICBlbHNlXG4gICAgICBjdHguZmlsbFJlY3QoMCwgY2FudmFzUG9zaXRpb24sIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgLy8gbWFya2Vyc1xuICAgIGNvbnN0IG1hcmtlcnMgPSB0aGlzLnBhcmFtcy5tYXJrZXJzO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBtYXJrZXIgPSBtYXJrZXJzW2ldO1xuICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmNhbnZhc1NjYWxlKG1hcmtlcik7XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpJztcbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgY3R4Lm1vdmVUbyhwb3NpdGlvbiAtIDAuNSwgMSk7XG4gICAgICAgIGN0eC5saW5lVG8ocG9zaXRpb24gLSAwLjUsIGhlaWdodCAtIDEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3R4Lm1vdmVUbygxLCBoZWlnaHQgLSBwb3NpdGlvbiArIDAuNSk7XG4gICAgICAgIGN0eC5saW5lVG8od2lkdGggLSAxLCBoZWlnaHQgLSBwb3NpdGlvbiArIDAuNSk7XG4gICAgICB9XG5cbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICB9XG5cbiAgICAvLyBoYW5kbGUgbW9kZVxuICAgIGlmICh0aGlzLnBhcmFtcy5tb2RlID09PSAnaGFuZGxlJyAmJiB0aGlzLnBhcmFtcy5zaG93SGFuZGxlKSB7XG4gICAgICBjb25zdCBkZWx0YSA9IHRoaXMucGFyYW1zLmhhbmRsZVNpemUgKiB0aGlzLl9waXhlbFJhdGlvIC8gMjtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gY2FudmFzUG9zaXRpb24gLSBkZWx0YTtcbiAgICAgIGNvbnN0IGVuZCA9IGNhbnZhc1Bvc2l0aW9uICsgZGVsdGE7XG5cbiAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDE7XG4gICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5wYXJhbXMuaGFuZGxlQ29sb3I7XG5cbiAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgIGN0eC5maWxsUmVjdChzdGFydCwgMCwgZW5kIC0gc3RhcnQsIGhlaWdodCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdHguZmlsbFJlY3QoMCwgc3RhcnQsIHdpZHRoLCBlbmQgLSBzdGFydCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY3R4LnJlc3RvcmUoKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTbGlkZXI7XG4iLCIvKipcbiAqIEBtb2R1bGUgZ3VpLWNvbXBvbmVudHNcbiAqL1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBTbGlkZXIgfSBmcm9tICcuL1NsaWRlcic7XG4iLCJpbXBvcnQgeyBTbGlkZXIgfSBmcm9tICcuLi8uLi8uLi9kaXN0L2luZGV4JztcblxuLy8ganVtcFxuY29uc3QgJGZlZWRiYWNrSnVtcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmZWVkYmFjay1qdW1wJyk7XG5cbmNvbnN0IHNsaWRlckp1bXAgPSBuZXcgU2xpZGVyKHtcbiAgbW9kZTogJ2p1bXAnLFxuICBjb250YWluZXI6ICcjc2xpZGVyLWp1bXAnLFxuICBtaW46IDAsXG4gIG1heDogMSxcbiAgZGVmYXVsdDogMC42LFxuICBzdGVwOiAwLjAwMSxcbiAgYmFja2dyb3VuZENvbG9yOiAnIzQ2NDY0NicsXG4gIGZvcmVncm91bmRDb2xvcjogJ3N0ZWVsYmx1ZScsXG4gIG1hcmtlcnM6IFswLjddLFxuICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLCAvLyAndmVydGljYWwnXG4gIHdpZHRoOiA0MDAsXG4gIGhlaWdodDogMzAsXG4gIGNhbGxiYWNrOiAodmFsKSA9PiAkZmVlZGJhY2tKdW1wLnRleHRDb250ZW50ID0gdmFsLFxufSk7XG5cbi8vIG1ha2Ugc3VyZSBjYWxsYmFjayBpcyBub3QgdHJpZ2dlcmVkIHdoZW4gdXBkYXRpbmcgbWFudWFsbHlcbnNldFRpbWVvdXQoKCkgPT4ge1xuICBjb25zdCBvbGRDYWxsYmFjayA9IHNsaWRlckp1bXAucGFyYW1zLmNhbGxiYWNrO1xuICBjb25zdCB0ZXN0VmFsdWUgPSAxO1xuICBzbGlkZXJKdW1wLnBhcmFtcy5jYWxsYmFjayA9ICh2YWx1ZSkgPT4ge1xuICAgIGlmICh2YWx1ZSA9PSB0ZXN0VmFsdWUpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BzbGlkZXIudmFsdWUgPSBuZXdWYWx1ZWAgc2hvdWxkIGJlIHNpbGVudCcpO1xuICB9XG5cbiAgc2xpZGVySnVtcC52YWx1ZSA9IHRlc3RWYWx1ZTtcbiAgc2xpZGVySnVtcC5wYXJhbXMuY2FsbGJhY2sgPSBvbGRDYWxsYmFjaztcbn0sIDUwMCk7XG5cbi8vIHByb3BvcnRpb25uYWxcbmNvbnN0ICRmZWVkYmFja1Byb3BvcnRpb25uYWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmVlZGJhY2stcHJvcG9ydGlvbm5hbCcpO1xuXG5jb25zdCBzbGlkZXJQcm9wb3J0aW9ubmFsID0gbmV3IFNsaWRlcih7XG4gIG1vZGU6ICdwcm9wb3J0aW9ubmFsJyxcbiAgY29udGFpbmVyOiAnI3NsaWRlci1wcm9wb3J0aW9ubmFsJyxcbiAgbWluOiAtNTAsXG4gIG1heDogNTAsXG4gIGRlZmF1bHQ6IDIwLFxuICBzdGVwOiAwLjEsXG4gIGJhY2tncm91bmRDb2xvcjogJyM0NjQ2NDYnLFxuICBmb3JlZ3JvdW5kQ29sb3I6ICdzdGVlbGJsdWUnLFxuICBtYXJrZXJzOiBbMF0sXG4gIG9yaWVudGF0aW9uOiAndmVydGljYWwnLCAvLyAndmVydGljYWwnXG4gIHdpZHRoOiAzMCxcbiAgaGVpZ2h0OiAzMDAsXG4gIGNhbGxiYWNrOiAodmFsKSA9PiAkZmVlZGJhY2tQcm9wb3J0aW9ubmFsLnRleHRDb250ZW50ID0gdmFsLFxufSk7XG5cbi8vIGhhbmRsZVxuY29uc3QgJGZlZWRiYWNrSGFuZGxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZlZWRiYWNrLWhhbmRsZScpO1xuXG5jb25zdCBzbGlkZXJIYW5kbGUgPSBuZXcgU2xpZGVyKHtcbiAgbW9kZTogJ2hhbmRsZScsXG4gIGNvbnRhaW5lcjogJyNzbGlkZXItaGFuZGxlJyxcbiAgbWluOiAtNTAsXG4gIG1heDogNTAsXG4gIGRlZmF1bHQ6IDIwLFxuICBzdGVwOiAwLjEsXG4gIGJhY2tncm91bmRDb2xvcjogJyM0NjQ2NDYnLFxuICBmb3JlZ3JvdW5kQ29sb3I6ICdzdGVlbGJsdWUnLFxuICBtYXJrZXJzQ29sb3I6ICdvcmFuZ2UnLFxuICBtYXJrZXJzOiBbMF0sXG4gIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsIC8vICd2ZXJ0aWNhbCdcbiAgd2lkdGg6IDMwMCxcbiAgaGVpZ2h0OiAzMDAsXG5cbiAgLy8gaGFuZGxlIHNwZWNpZmljIHBhcmFtc1xuICBzaG93SGFuZGxlOiB0cnVlLFxuICBoYW5kbGVTaXplOiAyMCxcbiAgaGFuZGxlQ29sb3I6ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMyknLFxuICBjYWxsYmFjazogKHZhbCkgPT4gJGZlZWRiYWNrSGFuZGxlLnRleHRDb250ZW50ID0gdmFsLFxufSk7XG5cbiJdfQ==
