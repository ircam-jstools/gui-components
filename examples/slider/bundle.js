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
 * Versatile canvas based slider.
 *
 * @param {Object} options - Override default parameters.
 * @param {'jump'|'proportionnal'|'handle'} - Mode of the slider:
 *  - in 'jump' mode, the value is changed on 'touchstart' or 'mousedown', and
 *    on move.
 *  - in 'proportionnal' mode, the value is updated relatively to move.
 *  - in 'handle' mode, the slider can be grabbed only around its value.
 * @param {Function} callback - Callback to be executed when the value of the
 *  slider changes.
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
 * @param {Boolean} [showHandle=true] - In 'handle' mode, define if the
 *  draggable should be show or not.
 * @param {Number} [handleSize=20] - Size of the draggable zone.
 * @param {String} [handleColor='rgba(255, 255, 255, 0.7)'] - Color of the
 *  draggable zone (when `showHandle` is `true`).
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
    this._updateValue(this.params.default);

    window.addEventListener('resize', this._onResize);
  }

  /**
   * Current value
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
      this._updateValue(this._value, true);
    }
  }, {
    key: '_updateValue',
    value: function _updateValue(value) {
      var _this = this;

      var forceRender = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var callback = this.params.callback;

      var clippedValue = this.clipper(value);

      // if resize render but don't trigger callback
      if (clippedValue === this._value && forceRender === true) requestAnimationFrame(function () {
        return _this._render(clippedValue);
      });

      // trigger callback
      if (clippedValue !== this._value) {
        this._value = clippedValue;
        callback(clippedValue);
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

      this._updateValue(value);
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
      this._updateValue(val);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9kaXN0L1NsaWRlci5qcyIsIi4uLy4uL2Rpc3QvaW5kZXguanMiLCJkaXN0L2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQ0FBLFNBQVMsUUFBVCxDQUFrQixNQUFsQixFQUEwQixLQUExQixFQUFpQztBQUMvQixNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQU4sSUFBVyxNQUFNLENBQU4sQ0FBWixLQUF5QixPQUFPLENBQVAsSUFBWSxPQUFPLENBQVAsQ0FBckMsQ0FBZDtBQUNBLE1BQU0sWUFBWSxNQUFNLENBQU4sSUFBVyxRQUFRLE9BQU8sQ0FBUCxDQUFyQzs7QUFFQSxXQUFTLEtBQVQsQ0FBZSxHQUFmLEVBQW9CO0FBQ2xCLFdBQU8sUUFBUSxHQUFSLEdBQWMsU0FBckI7QUFDRDs7QUFFRCxRQUFNLE1BQU4sR0FBZSxVQUFTLEdBQVQsRUFBYztBQUMzQixXQUFPLENBQUMsTUFBTSxTQUFQLElBQW9CLEtBQTNCO0FBQ0QsR0FGRDs7QUFJQSxTQUFPLEtBQVA7QUFDRDs7QUFFRCxTQUFTLFVBQVQsQ0FBb0IsR0FBcEIsRUFBeUIsR0FBekIsRUFBOEIsSUFBOUIsRUFBb0M7QUFDbEMsU0FBTyxVQUFDLEdBQUQsRUFBUztBQUNkLFFBQU0sZUFBZSxLQUFLLEtBQUwsQ0FBVyxNQUFNLElBQWpCLElBQXlCLElBQTlDO0FBQ0EsUUFBTSxRQUFRLEtBQUssR0FBTCxDQUFTLEtBQUssS0FBTCxDQUFXLElBQUksSUFBZixDQUFULEVBQStCLENBQS9CLENBQWQ7QUFDQSxRQUFNLGFBQWEsYUFBYSxPQUFiLENBQXFCLEtBQXJCLENBQW5CLENBSGMsQ0FHa0M7QUFDaEQsV0FBTyxLQUFLLEdBQUwsQ0FBUyxHQUFULEVBQWMsS0FBSyxHQUFMLENBQVMsR0FBVCxFQUFjLFdBQVcsVUFBWCxDQUFkLENBQWQs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O0FBSzlCLFdBQVMsRUFMcUI7QUFNOUIsUUFBTSxHQU53QjtBQU85QixtQkFBaUIsU0FQYTtBQVE5QixtQkFBaUIsV0FSYTtBQVM5QixnQkFBYyxRQVRnQjtBQVU5QixXQUFTLENBQUMsQ0FBRCxDQVZxQjtBQVc5QixlQUFhLFlBWGlCLEVBV0g7QUFDM0IsU0FBTyxHQVp1QjtBQWE5QixVQUFRLEdBYnNCOztBQWU5QjtBQUNBLGNBQVksSUFoQmtCO0FBaUI5QixjQUFZLEVBakJrQjtBQWtCOUIsZUFBYSwwQkFsQmlCO0FBbUI5QixZQUFVLGtCQUFDLEdBQUQ7QUFBQSxXQUFTLGdCQUFnQixXQUFoQixHQUE4QixHQUF2QztBQUFBO0FBbkJvQixDQUFYLENBQXJCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIGdldFNjYWxlKGRvbWFpbiwgcmFuZ2UpIHtcbiAgY29uc3Qgc2xvcGUgPSAocmFuZ2VbMV0gLSByYW5nZVswXSkgLyAoZG9tYWluWzFdIC0gZG9tYWluWzBdKTtcbiAgY29uc3QgaW50ZXJjZXB0ID0gcmFuZ2VbMF0gLSBzbG9wZSAqIGRvbWFpblswXTtcblxuICBmdW5jdGlvbiBzY2FsZSh2YWwpIHtcbiAgICByZXR1cm4gc2xvcGUgKiB2YWwgKyBpbnRlcmNlcHQ7XG4gIH1cblxuICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gKHZhbCAtIGludGVyY2VwdCkgLyBzbG9wZTtcbiAgfVxuXG4gIHJldHVybiBzY2FsZTtcbn1cblxuZnVuY3Rpb24gZ2V0Q2xpcHBlcihtaW4sIG1heCwgc3RlcCkge1xuICByZXR1cm4gKHZhbCkgPT4ge1xuICAgIGNvbnN0IGNsaXBwZWRWYWx1ZSA9IE1hdGgucm91bmQodmFsIC8gc3RlcCkgKiBzdGVwO1xuICAgIGNvbnN0IGZpeGVkID0gTWF0aC5tYXgoTWF0aC5sb2cxMCgxIC8gc3RlcCksIDApO1xuICAgIGNvbnN0IGZpeGVkVmFsdWUgPSBjbGlwcGVkVmFsdWUudG9GaXhlZChmaXhlZCk7IC8vIGZpeCBmbG9hdGluZyBwb2ludCBlcnJvcnNcbiAgICByZXR1cm4gTWF0aC5taW4obWF4LCBNYXRoLm1heChtaW4sIHBhcnNlRmxvYXQoZml4ZWRWYWx1ZSkpKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcnNhdGlsZSBjYW52YXMgYmFzZWQgc2xpZGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHsnanVtcCd8J3Byb3BvcnRpb25uYWwnfCdoYW5kbGUnfSAtIE1vZGUgb2YgdGhlIHNsaWRlcjpcbiAqICAtIGluICdqdW1wJyBtb2RlLCB0aGUgdmFsdWUgaXMgY2hhbmdlZCBvbiAndG91Y2hzdGFydCcgb3IgJ21vdXNlZG93bicsIGFuZFxuICogICAgb24gbW92ZS5cbiAqICAtIGluICdwcm9wb3J0aW9ubmFsJyBtb2RlLCB0aGUgdmFsdWUgaXMgdXBkYXRlZCByZWxhdGl2ZWx5IHRvIG1vdmUuXG4gKiAgLSBpbiAnaGFuZGxlJyBtb2RlLCB0aGUgc2xpZGVyIGNhbiBiZSBncmFiYmVkIG9ubHkgYXJvdW5kIGl0cyB2YWx1ZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gQ2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgdmFsdWUgb2YgdGhlXG4gKiAgc2xpZGVyIGNoYW5nZXMuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMud2lkdGg9MjAwXSAtIFdpZHRoIG9mIHRoZSBzbGlkZXIuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuaGVpZ2h0PTMwXSAtIEhlaWdodCBvZiB0aGUgc2xpZGVyLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLm1pbj0wXSAtIE1pbmltdW0gdmFsdWUuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMubWF4PTFdIC0gTWF4aW11bSB2YWx1ZS5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5zdGVwPTAuMDFdIC0gU3RlcCBiZXR3ZWVuIGVhY2ggY29uc2VjdXRpdmUgdmFsdWVzLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmRlZmF1bHQ9MF0gLSBEZWZhdWx0IHZhbHVlLlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudH0gW29wdGlvbnMuY29udGFpbmVyPSdib2R5J10gLSBDU1MgU2VsZWN0b3Igb3IgRE9NXG4gKiAgZWxlbWVudCBpbiB3aGljaCBpbnNlcnRpbmcgdGhlIHNsaWRlci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3I9JyM0NjQ2NDYnXSAtIEJhY2tncm91bmQgY29sb3Igb2YgdGhlXG4gKiAgc2xpZGVyLlxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmZvcmVncm91bmRDb2xvcj0nc3RlZWxibHVlJ10gLSBGb3JlZ3JvdW5kIGNvbG9yIG9mXG4gKiAgdGhlIHNsaWRlci5cbiAqIEBwYXJhbSB7J2hvcml6b250YWwnfCd2ZXJ0aWNhbCd9IFtvcHRpb25zLm9yaWVudGF0aW9uPSdob3Jpem9udGFsJ10gLVxuICogIE9yaWVudGF0aW9uIG9mIHRoZSBzbGlkZXIuXG4gKiBAcGFyYW0ge0FycmF5fSBbb3B0aW9ucy5tYXJrZXJzPVtdXSAtIExpc3Qgb2YgdmFsdWVzIHdoZXJlIG1hcmtlcnMgc2hvdWxkXG4gKiAgYmUgZGlzcGxheWVkIG9uIHRoZSBzbGlkZXIuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtzaG93SGFuZGxlPXRydWVdIC0gSW4gJ2hhbmRsZScgbW9kZSwgZGVmaW5lIGlmIHRoZVxuICogIGRyYWdnYWJsZSBzaG91bGQgYmUgc2hvdyBvciBub3QuXG4gKiBAcGFyYW0ge051bWJlcn0gW2hhbmRsZVNpemU9MjBdIC0gU2l6ZSBvZiB0aGUgZHJhZ2dhYmxlIHpvbmUuXG4gKiBAcGFyYW0ge1N0cmluZ30gW2hhbmRsZUNvbG9yPSdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyknXSAtIENvbG9yIG9mIHRoZVxuICogIGRyYWdnYWJsZSB6b25lICh3aGVuIGBzaG93SGFuZGxlYCBpcyBgdHJ1ZWApLlxuICovXG5jbGFzcyBTbGlkZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgY29uc3QgZGVmYXVsdHMgPSB7XG4gICAgICBtb2RlOiAnanVtcCcsXG4gICAgICBjYWxsYmFjazogdmFsdWUgPT4ge30sXG4gICAgICB3aWR0aDogMjAwLFxuICAgICAgaGVpZ2h0OiAzMCxcbiAgICAgIG1pbjogMCxcbiAgICAgIG1heDogMSxcbiAgICAgIHN0ZXA6IDAuMDEsXG4gICAgICBkZWZhdWx0OiAwLFxuICAgICAgY29udGFpbmVyOiAnYm9keScsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjNDY0NjQ2JyxcbiAgICAgIGZvcmVncm91bmRDb2xvcjogJ3N0ZWVsYmx1ZScsXG4gICAgICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLFxuICAgICAgbWFya2VyczogW10sXG5cbiAgICAgIC8vIGhhbmRsZSBzcGVjaWZpYyBvcHRpb25zXG4gICAgICBzaG93SGFuZGxlOiB0cnVlLFxuICAgICAgaGFuZGxlU2l6ZTogMjAsXG4gICAgICBoYW5kbGVDb2xvcjogJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC43KScsXG4gICAgfTtcblxuICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMuX2xpc3RlbmVycyA9IFtdO1xuICAgIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdCA9IG51bGw7XG4gICAgdGhpcy5fdG91Y2hJZCA9IG51bGw7XG4gICAgdGhpcy5fdmFsdWUgPSBudWxsO1xuICAgIHRoaXMuX2NhbnZhc1dpZHRoID0gbnVsbDtcbiAgICB0aGlzLl9jYW52YXNIZWlnaHQgPSBudWxsO1xuICAgIC8vIGZvciBwcm9wb3J0aW9ubmFsIG1vZGVcbiAgICB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbiA9IHsgeDogbnVsbCwgeTogbnVsbCB9O1xuICAgIHRoaXMuX2N1cnJlbnRTbGlkZXJQb3NpdGlvbiA9IG51bGw7XG5cbiAgICB0aGlzLl9vbk1vdXNlRG93biA9IHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Nb3VzZU1vdmUgPSB0aGlzLl9vbk1vdXNlTW92ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uTW91c2VVcCA9IHRoaXMuX29uTW91c2VVcC5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5fb25Ub3VjaFN0YXJ0ID0gdGhpcy5fb25Ub3VjaFN0YXJ0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Ub3VjaE1vdmUgPSB0aGlzLl9vblRvdWNoTW92ZSAuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblRvdWNoRW5kID0gdGhpcy5fb25Ub3VjaEVuZC5iaW5kKHRoaXMpO1xuXG4gICAgdGhpcy5fb25SZXNpemUgPSB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpO1xuXG5cbiAgICB0aGlzLl9jcmVhdGVFbGVtZW50KCk7XG5cbiAgICAvLyBpbml0aWFsaXplXG4gICAgdGhpcy5fcmVzaXplRWxlbWVudCgpO1xuICAgIHRoaXMuX3NldFNjYWxlcygpO1xuICAgIHRoaXMuX2JpbmRFdmVudHMoKTtcbiAgICB0aGlzLl9vblJlc2l6ZSgpO1xuICAgIHRoaXMuX3VwZGF0ZVZhbHVlKHRoaXMucGFyYW1zLmRlZmF1bHQpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX29uUmVzaXplKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDdXJyZW50IHZhbHVlXG4gICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAqL1xuICBnZXQgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICB9XG5cbiAgc2V0IHZhbHVlKHZhbCkge1xuICAgIHRoaXMuX3VwZGF0ZVZhbHVlKHZhbCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgdGhlIHNsaWRlciB0byBpdHMgZGVmYXVsdCB2YWx1ZS5cbiAgICovXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuX3VwZGF0ZVZhbHVlKHRoaXMucGFyYW1zLmRlZmF1bHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2l6ZSB0aGUgc2xpZGVyLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gd2lkdGggLSBOZXcgd2lkdGggb2YgdGhlIHNsaWRlci5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodCAtIE5ldyBoZWlnaHQgb2YgdGhlIHNsaWRlci5cbiAgICovXG4gIHJlc2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy5wYXJhbXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLnBhcmFtcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLl9yZXNpemVFbGVtZW50KCk7XG4gICAgdGhpcy5fc2V0U2NhbGVzKCk7XG4gICAgdGhpcy5fb25SZXNpemUoKTtcbiAgICB0aGlzLl91cGRhdGVWYWx1ZSh0aGlzLl92YWx1ZSwgdHJ1ZSk7XG4gIH1cblxuICBfdXBkYXRlVmFsdWUodmFsdWUsIGZvcmNlUmVuZGVyID0gZmFsc2UpIHtcbiAgICBjb25zdCB7IGNhbGxiYWNrIH0gPSB0aGlzLnBhcmFtcztcbiAgICBjb25zdCBjbGlwcGVkVmFsdWUgPSB0aGlzLmNsaXBwZXIodmFsdWUpO1xuXG4gICAgLy8gaWYgcmVzaXplIHJlbmRlciBidXQgZG9uJ3QgdHJpZ2dlciBjYWxsYmFja1xuICAgIGlmIChjbGlwcGVkVmFsdWUgPT09IHRoaXMuX3ZhbHVlICYmIGZvcmNlUmVuZGVyID09PSB0cnVlKVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuX3JlbmRlcihjbGlwcGVkVmFsdWUpKTtcblxuICAgIC8vIHRyaWdnZXIgY2FsbGJhY2tcbiAgICBpZiAoY2xpcHBlZFZhbHVlICE9PSB0aGlzLl92YWx1ZSkge1xuICAgICAgdGhpcy5fdmFsdWUgPSBjbGlwcGVkVmFsdWU7XG4gICAgICBjYWxsYmFjayhjbGlwcGVkVmFsdWUpO1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuX3JlbmRlcihjbGlwcGVkVmFsdWUpKTtcbiAgICB9XG4gIH1cblxuICBfY3JlYXRlRWxlbWVudCgpIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lciB9ID0gdGhpcy5wYXJhbXM7XG4gICAgdGhpcy4kY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdGhpcy5jdHggPSB0aGlzLiRjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIGlmIChjb250YWluZXIgaW5zdGFuY2VvZiBFbGVtZW50KVxuICAgICAgdGhpcy4kY29udGFpbmVyID0gY29udGFpbmVyO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuJGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyKTtcblxuICAgIHRoaXMuJGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLiRjYW52YXMpO1xuICB9XG5cbiAgX3Jlc2l6ZUVsZW1lbnQoKSB7XG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzLnBhcmFtcztcblxuICAgIC8vIGxvZ2ljYWwgYW5kIHBpeGVsIHNpemUgb2YgdGhlIGNhbnZhc1xuICAgIHRoaXMuX3BpeGVsUmF0aW8gPSAoZnVuY3Rpb24oY3R4KSB7XG4gICAgY29uc3QgZFBSID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICBjb25zdCBiUFIgPSBjdHgud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgY3R4Lm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgIGN0eC5tc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAgIGN0eC5vQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgY3R4LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgMTtcblxuICAgICAgcmV0dXJuIGRQUiAvIGJQUjtcbiAgICB9KHRoaXMuY3R4KSk7XG5cbiAgICB0aGlzLl9jYW52YXNXaWR0aCA9IHdpZHRoICogdGhpcy5fcGl4ZWxSYXRpbztcbiAgICB0aGlzLl9jYW52YXNIZWlnaHQgPSBoZWlnaHQgKiB0aGlzLl9waXhlbFJhdGlvO1xuXG4gICAgdGhpcy5jdHguY2FudmFzLndpZHRoID0gdGhpcy5fY2FudmFzV2lkdGg7XG4gICAgdGhpcy5jdHguY2FudmFzLmhlaWdodCA9IHRoaXMuX2NhbnZhc0hlaWdodDtcbiAgICB0aGlzLmN0eC5jYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gICAgdGhpcy5jdHguY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG4gIH1cblxuICBfb25SZXNpemUoKSB7XG4gICAgdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0ID0gdGhpcy4kY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB9XG5cbiAgX3NldFNjYWxlcygpIHtcbiAgICBjb25zdCB7IG9yaWVudGF0aW9uLCB3aWR0aCwgaGVpZ2h0LCBtaW4sIG1heCwgc3RlcCB9ID0gdGhpcy5wYXJhbXM7XG4gICAgLy8gZGVmaW5lIHRyYW5zZmVydCBmdW5jdGlvbnNcbiAgICBjb25zdCBzY3JlZW5TaXplID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/XG4gICAgICB3aWR0aCA6IGhlaWdodDtcblxuICAgIGNvbnN0IGNhbnZhc1NpemUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID9cbiAgICAgIHRoaXMuX2NhbnZhc1dpZHRoIDogdGhpcy5fY2FudmFzSGVpZ2h0O1xuXG4gICAgY29uc3QgZG9tYWluID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/IFttaW4sIG1heF0gOiBbbWF4LCBtaW5dO1xuICAgIGNvbnN0IHNjcmVlblJhbmdlID0gWzAsIHNjcmVlblNpemVdO1xuICAgIGNvbnN0IGNhbnZhc1JhbmdlID0gWzAsIGNhbnZhc1NpemVdO1xuXG4gICAgdGhpcy5zY3JlZW5TY2FsZSA9IGdldFNjYWxlKGRvbWFpbiwgc2NyZWVuUmFuZ2UpO1xuICAgIHRoaXMuY2FudmFzU2NhbGUgPSBnZXRTY2FsZShkb21haW4sIGNhbnZhc1JhbmdlKTtcbiAgICB0aGlzLmNsaXBwZXIgPSBnZXRDbGlwcGVyKG1pbiwgbWF4LCBzdGVwKTtcbiAgfVxuXG4gIF9iaW5kRXZlbnRzKCkge1xuICAgIHRoaXMuJGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bik7XG4gICAgdGhpcy4kY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLl9vblRvdWNoU3RhcnQpO1xuICB9XG5cbiAgX29uU3RhcnQoeCwgeSkge1xuICAgIGxldCBzdGFydGVkID0gbnVsbDtcblxuICAgIHN3aXRjaCAodGhpcy5wYXJhbXMubW9kZSkge1xuICAgICAgY2FzZSAnanVtcCc6XG4gICAgICAgIHRoaXMuX3VwZGF0ZVBvc2l0aW9uKHgsIHkpO1xuICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9wb3J0aW9ubmFsJzpcbiAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueCA9IHg7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnkgPSB5O1xuICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdoYW5kbGUnOlxuICAgICAgICBjb25zdCBvcmllbnRhdGlvbiA9IHRoaXMucGFyYW1zLm9yaWVudGF0aW9uO1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuc2NyZWVuU2NhbGUodGhpcy5fdmFsdWUpO1xuICAgICAgICBjb25zdCBjb21wYXJlID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/IHggOiB5O1xuICAgICAgICBjb25zdCBkZWx0YSA9IHRoaXMucGFyYW1zLmhhbmRsZVNpemUgLyAyO1xuXG4gICAgICAgIGlmIChjb21wYXJlIDwgcG9zaXRpb24gKyBkZWx0YSAmJiBjb21wYXJlID4gcG9zaXRpb24gLSBkZWx0YSkge1xuICAgICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnggPSB4O1xuICAgICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnkgPSB5O1xuICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhcnRlZDtcbiAgfVxuXG4gIF9vbk1vdmUoeCwgeSkge1xuICAgIHN3aXRjaCAodGhpcy5wYXJhbXMubW9kZSkge1xuICAgICAgY2FzZSAnanVtcCc6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncHJvcG9ydGlvbm5hbCc6XG4gICAgICBjYXNlICdoYW5kbGUnOlxuICAgICAgICBjb25zdCBkZWx0YVggPSB4IC0gdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueDtcbiAgICAgICAgY29uc3QgZGVsdGFZID0geSAtIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnk7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnggPSB4O1xuICAgICAgICB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbi55ID0geTtcblxuICAgICAgICB4ID0gdGhpcy5zY3JlZW5TY2FsZSh0aGlzLl92YWx1ZSkgKyBkZWx0YVg7XG4gICAgICAgIHkgPSB0aGlzLnNjcmVlblNjYWxlKHRoaXMuX3ZhbHVlKSArIGRlbHRhWTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oeCwgeSk7XG4gIH1cblxuICBfb25FbmQoKSB7XG4gICAgc3dpdGNoICh0aGlzLnBhcmFtcy5tb2RlKSB7XG4gICAgICBjYXNlICdqdW1wJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9wb3J0aW9ubmFsJzpcbiAgICAgIGNhc2UgJ2hhbmRsZSc6XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnggPSBudWxsO1xuICAgICAgICB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbi55ID0gbnVsbDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgLy8gbW91c2UgZXZlbnRzXG4gIF9vbk1vdXNlRG93bihlKSB7XG4gICAgY29uc3QgcGFnZVggPSBlLnBhZ2VYO1xuICAgIGNvbnN0IHBhZ2VZID0gZS5wYWdlWTtcbiAgICBjb25zdCB4ID0gcGFnZVggLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QubGVmdDtcbiAgICBjb25zdCB5ID0gcGFnZVkgLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QudG9wO1xuXG4gICAgaWYgKHRoaXMuX29uU3RhcnQoeCwgeSkgPT09IHRydWUpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCk7XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VNb3ZlKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIHByZXZlbnQgdGV4dCBzZWxlY3Rpb25cblxuICAgIGNvbnN0IHBhZ2VYID0gZS5wYWdlWDtcbiAgICBjb25zdCBwYWdlWSA9IGUucGFnZVk7XG4gICAgbGV0IHggPSBwYWdlWCAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC5sZWZ0OztcbiAgICBsZXQgeSA9IHBhZ2VZIC0gdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0LnRvcDs7XG5cbiAgICB0aGlzLl9vbk1vdmUoeCwgeSk7XG4gIH1cblxuICBfb25Nb3VzZVVwKGUpIHtcbiAgICB0aGlzLl9vbkVuZCgpO1xuXG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcCk7XG4gIH1cblxuICAvLyB0b3VjaCBldmVudHNcbiAgX29uVG91Y2hTdGFydChlKSB7XG4gICAgaWYgKHRoaXMuX3RvdWNoSWQgIT09IG51bGwpIHJldHVybjtcblxuICAgIGNvbnN0IHRvdWNoID0gZS50b3VjaGVzWzBdO1xuICAgIHRoaXMuX3RvdWNoSWQgPSB0b3VjaC5pZGVudGlmaWVyO1xuXG4gICAgY29uc3QgcGFnZVggPSB0b3VjaC5wYWdlWDtcbiAgICBjb25zdCBwYWdlWSA9IHRvdWNoLnBhZ2VZO1xuICAgIGNvbnN0IHggPSBwYWdlWCAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC5sZWZ0O1xuICAgIGNvbnN0IHkgPSBwYWdlWSAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC50b3A7XG5cbiAgICBpZiAodGhpcy5fb25TdGFydCh4LCB5KSA9PT0gdHJ1ZSkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX29uVG91Y2hNb3ZlKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX29uVG91Y2hFbmQpO1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5fb25Ub3VjaEVuZCk7XG4gICAgfVxuICB9XG5cbiAgX29uVG91Y2hNb3ZlKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7IC8vIHByZXZlbnQgdGV4dCBzZWxlY3Rpb25cblxuICAgIGNvbnN0IHRvdWNoZXMgPSBBcnJheS5mcm9tKGUudG91Y2hlcyk7XG4gICAgY29uc3QgdG91Y2ggPSB0b3VjaGVzLmZpbHRlcigodCkgPT4gdC5pZGVudGlmaWVyID09PSB0aGlzLl90b3VjaElkKVswXTtcblxuICAgIGlmICh0b3VjaCkge1xuICAgICAgY29uc3QgcGFnZVggPSB0b3VjaC5wYWdlWDtcbiAgICAgIGNvbnN0IHBhZ2VZID0gdG91Y2gucGFnZVk7XG4gICAgICBjb25zdCB4ID0gcGFnZVggLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QubGVmdDtcbiAgICAgIGNvbnN0IHkgPSBwYWdlWSAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC50b3A7XG5cbiAgICAgIHRoaXMuX29uTW92ZSh4LCB5KTtcbiAgICB9XG4gIH1cblxuICBfb25Ub3VjaEVuZChlKSB7XG4gICAgY29uc3QgdG91Y2hlcyA9IEFycmF5LmZyb20oZS50b3VjaGVzKTtcbiAgICBjb25zdCB0b3VjaCA9IHRvdWNoZXMuZmlsdGVyKCh0KSA9PiB0LmlkZW50aWZpZXIgPT09IHRoaXMuX3RvdWNoSWQpWzBdO1xuXG4gICAgaWYgKHRvdWNoID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX29uRW5kKCk7XG4gICAgICB0aGlzLl90b3VjaElkID0gbnVsbDtcblxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMuX29uVG91Y2hNb3ZlKTtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMuX29uVG91Y2hFbmQpO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5fb25Ub3VjaEVuZCk7XG5cbiAgICB9XG4gIH1cblxuICBfdXBkYXRlUG9zaXRpb24oeCwgeSkge1xuICAgIGNvbnN0IHvCoG9yaWVudGF0aW9uLCBoZWlnaHQgfSA9IHRoaXMucGFyYW1zO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gb3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJyA/IHggOiB5O1xuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5zY3JlZW5TY2FsZS5pbnZlcnQocG9zaXRpb24pO1xuXG4gICAgdGhpcy5fdXBkYXRlVmFsdWUodmFsdWUpO1xuICB9XG5cbiAgX3JlbmRlcihjbGlwcGVkVmFsdWUpIHtcbiAgICBjb25zdCB7IGJhY2tncm91bmRDb2xvciwgZm9yZWdyb3VuZENvbG9yLCBvcmllbnRhdGlvbiB9ID0gdGhpcy5wYXJhbXM7XG4gICAgY29uc3QgY2FudmFzUG9zaXRpb24gPSBNYXRoLnJvdW5kKHRoaXMuY2FudmFzU2NhbGUoY2xpcHBlZFZhbHVlKSk7XG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLl9jYW52YXNXaWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLl9jYW52YXNIZWlnaHQ7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG5cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAvLyBiYWNrZ3JvdW5kXG4gICAgY3R4LmZpbGxTdHlsZSA9IGJhY2tncm91bmRDb2xvcjtcbiAgICBjdHguZmlsbFJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAvLyBmb3JlZ3JvdW5kXG4gICAgY3R4LmZpbGxTdHlsZSA9IGZvcmVncm91bmRDb2xvcjtcblxuICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnKVxuICAgICAgY3R4LmZpbGxSZWN0KDAsIDAsIGNhbnZhc1Bvc2l0aW9uLCBoZWlnaHQpO1xuICAgIGVsc2VcbiAgICAgIGN0eC5maWxsUmVjdCgwLCBjYW52YXNQb3NpdGlvbiwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAvLyBtYXJrZXJzXG4gICAgY29uc3QgbWFya2VycyA9IHRoaXMucGFyYW1zLm1hcmtlcnM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1hcmtlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG1hcmtlciA9IG1hcmtlcnNbaV07XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuY2FudmFzU2NhbGUobWFya2VyKTtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyknO1xuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgICBpZiAob3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICBjdHgubW92ZVRvKHBvc2l0aW9uIC0gMC41LCAxKTtcbiAgICAgICAgY3R4LmxpbmVUbyhwb3NpdGlvbiAtIDAuNSwgaGVpZ2h0IC0gMSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdHgubW92ZVRvKDEsIGhlaWdodCAtIHBvc2l0aW9uICsgMC41KTtcbiAgICAgICAgY3R4LmxpbmVUbyh3aWR0aCAtIDEsIGhlaWdodCAtIHBvc2l0aW9uICsgMC41KTtcbiAgICAgIH1cblxuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgY3R4LnN0cm9rZSgpO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBtb2RlXG4gICAgaWYgKHRoaXMucGFyYW1zLm1vZGUgPT09ICdoYW5kbGUnICYmIHRoaXMucGFyYW1zLnNob3dIYW5kbGUpIHtcbiAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy5wYXJhbXMuaGFuZGxlU2l6ZSAqIHRoaXMuX3BpeGVsUmF0aW8gLyAyO1xuICAgICAgY29uc3Qgc3RhcnQgPSBjYW52YXNQb3NpdGlvbiAtIGRlbHRhO1xuICAgICAgY29uc3QgZW5kID0gY2FudmFzUG9zaXRpb24gKyBkZWx0YTtcblxuICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMTtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnBhcmFtcy5oYW5kbGVDb2xvcjtcblxuICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgY3R4LmZpbGxSZWN0KHN0YXJ0LCAwLCBlbmQgLSBzdGFydCwgaGVpZ2h0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN0eC5maWxsUmVjdCgwLCBzdGFydCwgd2lkdGgsIGVuZCAtIHN0YXJ0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjdHgucmVzdG9yZSgpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNsaWRlcjtcbiIsImV4cG9ydCB7IGRlZmF1bHQgYXMgU2xpZGVyIH0gZnJvbSAnLi9TbGlkZXInO1xuIiwiaW1wb3J0IHsgU2xpZGVyIH0gZnJvbSAnLi4vLi4vLi4vZGlzdC9pbmRleCc7XG5cbi8vIGp1bXBcbmNvbnN0ICRmZWVkYmFja0p1bXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmVlZGJhY2stanVtcCcpO1xuXG5jb25zdCBzbGlkZXJKdW1wID0gbmV3IFNsaWRlcih7XG4gIG1vZGU6ICdqdW1wJyxcbiAgY29udGFpbmVyOiAnI3NsaWRlci1qdW1wJyxcbiAgbWluOiAwLFxuICBtYXg6IDEsXG4gIGRlZmF1bHQ6IDAuNixcbiAgc3RlcDogMC4wMDEsXG4gIGJhY2tncm91bmRDb2xvcjogJyM0NjQ2NDYnLFxuICBmb3JlZ3JvdW5kQ29sb3I6ICdzdGVlbGJsdWUnLFxuICBtYXJrZXJzOiBbMC43XSxcbiAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJywgLy8gJ3ZlcnRpY2FsJ1xuICB3aWR0aDogNDAwLFxuICBoZWlnaHQ6IDMwLFxuICBjYWxsYmFjazogKHZhbCkgPT4gJGZlZWRiYWNrSnVtcC50ZXh0Q29udGVudCA9IHZhbCxcbn0pO1xuXG4vLyBwcm9wb3J0aW9ubmFsXG5jb25zdCAkZmVlZGJhY2tQcm9wb3J0aW9ubmFsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZlZWRiYWNrLXByb3BvcnRpb25uYWwnKTtcblxuY29uc3Qgc2xpZGVyUHJvcG9ydGlvbm5hbCA9IG5ldyBTbGlkZXIoe1xuICBtb2RlOiAncHJvcG9ydGlvbm5hbCcsXG4gIGNvbnRhaW5lcjogJyNzbGlkZXItcHJvcG9ydGlvbm5hbCcsXG4gIG1pbjogLTUwLFxuICBtYXg6IDUwLFxuICBkZWZhdWx0OiAyMCxcbiAgc3RlcDogMC4xLFxuICBiYWNrZ3JvdW5kQ29sb3I6ICcjNDY0NjQ2JyxcbiAgZm9yZWdyb3VuZENvbG9yOiAnc3RlZWxibHVlJyxcbiAgbWFya2VyczogWzBdLFxuICBvcmllbnRhdGlvbjogJ3ZlcnRpY2FsJywgLy8gJ3ZlcnRpY2FsJ1xuICB3aWR0aDogMzAsXG4gIGhlaWdodDogMzAwLFxuICBjYWxsYmFjazogKHZhbCkgPT4gJGZlZWRiYWNrUHJvcG9ydGlvbm5hbC50ZXh0Q29udGVudCA9IHZhbCxcbn0pO1xuXG4vLyBoYW5kbGVcbmNvbnN0ICRmZWVkYmFja0hhbmRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmZWVkYmFjay1oYW5kbGUnKTtcblxuY29uc3Qgc2xpZGVySGFuZGxlID0gbmV3IFNsaWRlcih7XG4gIG1vZGU6ICdoYW5kbGUnLFxuICBjb250YWluZXI6ICcjc2xpZGVyLWhhbmRsZScsXG4gIG1pbjogLTUwLFxuICBtYXg6IDUwLFxuICBkZWZhdWx0OiAyMCxcbiAgc3RlcDogMC4xLFxuICBiYWNrZ3JvdW5kQ29sb3I6ICcjNDY0NjQ2JyxcbiAgZm9yZWdyb3VuZENvbG9yOiAnc3RlZWxibHVlJyxcbiAgbWFya2Vyc0NvbG9yOiAnb3JhbmdlJyxcbiAgbWFya2VyczogWzBdLFxuICBvcmllbnRhdGlvbjogJ2hvcml6b250YWwnLCAvLyAndmVydGljYWwnXG4gIHdpZHRoOiAzMDAsXG4gIGhlaWdodDogMzAwLFxuXG4gIC8vIGhhbmRsZSBzcGVjaWZpYyBwYXJhbXNcbiAgc2hvd0hhbmRsZTogdHJ1ZSxcbiAgaGFuZGxlU2l6ZTogMjAsXG4gIGhhbmRsZUNvbG9yOiAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpJyxcbiAgY2FsbGJhY2s6ICh2YWwpID0+ICRmZWVkYmFja0hhbmRsZS50ZXh0Q29udGVudCA9IHZhbCxcbn0pO1xuXG4iXX0=
