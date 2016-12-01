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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNsaWRlci5qcyJdLCJuYW1lcyI6WyJnZXRTY2FsZSIsImRvbWFpbiIsInJhbmdlIiwic2xvcGUiLCJpbnRlcmNlcHQiLCJzY2FsZSIsInZhbCIsImludmVydCIsImdldENsaXBwZXIiLCJtaW4iLCJtYXgiLCJzdGVwIiwiY2xpcHBlZFZhbHVlIiwiTWF0aCIsInJvdW5kIiwiZml4ZWQiLCJsb2cxMCIsImZpeGVkVmFsdWUiLCJ0b0ZpeGVkIiwicGFyc2VGbG9hdCIsIlNsaWRlciIsIm9wdGlvbnMiLCJkZWZhdWx0cyIsIm1vZGUiLCJjYWxsYmFjayIsIndpZHRoIiwiaGVpZ2h0IiwiZGVmYXVsdCIsImNvbnRhaW5lciIsImJhY2tncm91bmRDb2xvciIsImZvcmVncm91bmRDb2xvciIsIm9yaWVudGF0aW9uIiwibWFya2VycyIsInNob3dIYW5kbGUiLCJoYW5kbGVTaXplIiwiaGFuZGxlQ29sb3IiLCJwYXJhbXMiLCJPYmplY3QiLCJhc3NpZ24iLCJfbGlzdGVuZXJzIiwiX2JvdW5kaW5nQ2xpZW50UmVjdCIsIl90b3VjaElkIiwiX3ZhbHVlIiwiX2NhbnZhc1dpZHRoIiwiX2NhbnZhc0hlaWdodCIsIl9jdXJyZW50TW91c2VQb3NpdGlvbiIsIngiLCJ5IiwiX2N1cnJlbnRTbGlkZXJQb3NpdGlvbiIsIl9vbk1vdXNlRG93biIsImJpbmQiLCJfb25Nb3VzZU1vdmUiLCJfb25Nb3VzZVVwIiwiX29uVG91Y2hTdGFydCIsIl9vblRvdWNoTW92ZSIsIl9vblRvdWNoRW5kIiwiX29uUmVzaXplIiwiX2NyZWF0ZUVsZW1lbnQiLCJfcmVzaXplRWxlbWVudCIsIl9zZXRTY2FsZXMiLCJfYmluZEV2ZW50cyIsIl91cGRhdGVWYWx1ZSIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJ2YWx1ZSIsImZvcmNlUmVuZGVyIiwiY2xpcHBlciIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsIl9yZW5kZXIiLCIkY2FudmFzIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY3R4IiwiZ2V0Q29udGV4dCIsIkVsZW1lbnQiLCIkY29udGFpbmVyIiwicXVlcnlTZWxlY3RvciIsImFwcGVuZENoaWxkIiwiX3BpeGVsUmF0aW8iLCJkUFIiLCJkZXZpY2VQaXhlbFJhdGlvIiwiYlBSIiwid2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsIm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJtc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJvQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsImJhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJjYW52YXMiLCJzdHlsZSIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInNjcmVlblNpemUiLCJjYW52YXNTaXplIiwic2NyZWVuUmFuZ2UiLCJjYW52YXNSYW5nZSIsInNjcmVlblNjYWxlIiwiY2FudmFzU2NhbGUiLCJzdGFydGVkIiwiX3VwZGF0ZVBvc2l0aW9uIiwicG9zaXRpb24iLCJjb21wYXJlIiwiZGVsdGEiLCJkZWx0YVgiLCJkZWx0YVkiLCJlIiwicGFnZVgiLCJwYWdlWSIsImxlZnQiLCJ0b3AiLCJfb25TdGFydCIsInByZXZlbnREZWZhdWx0IiwiX29uTW92ZSIsIl9vbkVuZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ0b3VjaCIsInRvdWNoZXMiLCJpZGVudGlmaWVyIiwiQXJyYXkiLCJmcm9tIiwiZmlsdGVyIiwidCIsInVuZGVmaW5lZCIsImNhbnZhc1Bvc2l0aW9uIiwic2F2ZSIsImNsZWFyUmVjdCIsImZpbGxTdHlsZSIsImZpbGxSZWN0IiwiaSIsImxlbmd0aCIsIm1hcmtlciIsInN0cm9rZVN0eWxlIiwiYmVnaW5QYXRoIiwibW92ZVRvIiwibGluZVRvIiwiY2xvc2VQYXRoIiwic3Ryb2tlIiwic3RhcnQiLCJlbmQiLCJnbG9iYWxBbHBoYSIsInJlc3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxRQUFULENBQWtCQyxNQUFsQixFQUEwQkMsS0FBMUIsRUFBaUM7QUFDL0IsTUFBTUMsUUFBUSxD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QVosS0FBcUIsUUFBckIsSUFBaUMsS0FBS2EsTUFBTCxDQUFZSCxVQUFqRCxFQUE2RDtBQUMzRCxZQUFNbUUsUUFBUSxLQUFLaEUsTUFBTCxDQUFZRixVQUFaLEdBQXlCLEtBQUs0QyxXQUE5QixHQUE0QyxDQUExRDtBQUNBLFlBQU15RCxRQUFRZCxpQkFBaUJyQixLQUEvQjtBQUNBLFlBQU1vQyxNQUFNZixpQkFBaUJyQixLQUE3Qjs7QUFFQTVCLFlBQUlpRSxXQUFKLEdBQWtCLENBQWxCO0FBQ0FqRSxZQUFJb0QsU0FBSixHQUFnQixLQUFLeEYsTUFBTCxDQUFZRCxXQUE1Qjs7QUFFQSxZQUFJSixnQkFBZ0IsWUFBcEIsRUFBa0M7QUFDaEN5QyxjQUFJcUQsUUFBSixDQUFhVSxLQUFiLEVBQW9CLENBQXBCLEVBQXVCQyxNQUFNRCxLQUE3QixFQUFvQzdHLE1BQXBDO0FBQ0QsU0FGRCxNQUVPO0FBQ0w4QyxjQUFJcUQsUUFBSixDQUFhLENBQWIsRUFBZ0JVLEtBQWhCLEVBQXVCOUcsS0FBdkIsRUFBOEIrRyxNQUFNRCxLQUFwQztBQUNEO0FBQ0Y7O0FBRUQvRCxVQUFJa0UsT0FBSjtBQUNEOzs7d0JBblVXO0FBQ1YsYUFBTyxLQUFLaEcsTUFBWjtBQUNELEs7c0JBRVNwQyxHLEVBQUs7QUFDYixXQUFLdUQsWUFBTCxDQUFrQnZELEdBQWxCO0FBQ0Q7Ozs7OztrQkFnVVljLE0iLCJmaWxlIjoiU2xpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gZ2V0U2NhbGUoZG9tYWluLCByYW5nZSkge1xuICBjb25zdCBzbG9wZSA9IChyYW5nZVsxXSAtIHJhbmdlWzBdKSAvIChkb21haW5bMV0gLSBkb21haW5bMF0pO1xuICBjb25zdCBpbnRlcmNlcHQgPSByYW5nZVswXSAtIHNsb3BlICogZG9tYWluWzBdO1xuXG4gIGZ1bmN0aW9uIHNjYWxlKHZhbCkge1xuICAgIHJldHVybiBzbG9wZSAqIHZhbCArIGludGVyY2VwdDtcbiAgfVxuXG4gIHNjYWxlLmludmVydCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiAodmFsIC0gaW50ZXJjZXB0KSAvIHNsb3BlO1xuICB9XG5cbiAgcmV0dXJuIHNjYWxlO1xufVxuXG5mdW5jdGlvbiBnZXRDbGlwcGVyKG1pbiwgbWF4LCBzdGVwKSB7XG4gIHJldHVybiAodmFsKSA9PiB7XG4gICAgY29uc3QgY2xpcHBlZFZhbHVlID0gTWF0aC5yb3VuZCh2YWwgLyBzdGVwKSAqIHN0ZXA7XG4gICAgY29uc3QgZml4ZWQgPSBNYXRoLm1heChNYXRoLmxvZzEwKDEgLyBzdGVwKSwgMCk7XG4gICAgY29uc3QgZml4ZWRWYWx1ZSA9IGNsaXBwZWRWYWx1ZS50b0ZpeGVkKGZpeGVkKTsgLy8gZml4IGZsb2F0aW5nIHBvaW50IGVycm9yc1xuICAgIHJldHVybiBNYXRoLm1pbihtYXgsIE1hdGgubWF4KG1pbiwgcGFyc2VGbG9hdChmaXhlZFZhbHVlKSkpO1xuICB9XG59XG5cbi8qKlxuICogVmVyc2F0aWxlIGNhbnZhcyBiYXNlZCBzbGlkZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZSBkZWZhdWx0IHBhcmFtZXRlcnMuXG4gKiBAcGFyYW0geydqdW1wJ3wncHJvcG9ydGlvbm5hbCd8J2hhbmRsZSd9IC0gTW9kZSBvZiB0aGUgc2xpZGVyOlxuICogIC0gaW4gJ2p1bXAnIG1vZGUsIHRoZSB2YWx1ZSBpcyBjaGFuZ2VkIG9uICd0b3VjaHN0YXJ0JyBvciAnbW91c2Vkb3duJywgYW5kXG4gKiAgICBvbiBtb3ZlLlxuICogIC0gaW4gJ3Byb3BvcnRpb25uYWwnIG1vZGUsIHRoZSB2YWx1ZSBpcyB1cGRhdGVkIHJlbGF0aXZlbHkgdG8gbW92ZS5cbiAqICAtIGluICdoYW5kbGUnIG1vZGUsIHRoZSBzbGlkZXIgY2FuIGJlIGdyYWJiZWQgb25seSBhcm91bmQgaXRzIHZhbHVlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBDYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSB2YWx1ZSBvZiB0aGVcbiAqICBzbGlkZXIgY2hhbmdlcy5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy53aWR0aD0yMDBdIC0gV2lkdGggb2YgdGhlIHNsaWRlci5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5oZWlnaHQ9MzBdIC0gSGVpZ2h0IG9mIHRoZSBzbGlkZXIuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMubWluPTBdIC0gTWluaW11bSB2YWx1ZS5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5tYXg9MV0gLSBNYXhpbXVtIHZhbHVlLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnN0ZXA9MC4wMV0gLSBTdGVwIGJldHdlZW4gZWFjaCBjb25zZWN1dGl2ZSB2YWx1ZXMuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZGVmYXVsdD0wXSAtIERlZmF1bHQgdmFsdWUuXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fSBbb3B0aW9ucy5jb250YWluZXI9J2JvZHknXSAtIENTUyBTZWxlY3RvciBvciBET01cbiAqICBlbGVtZW50IGluIHdoaWNoIGluc2VydGluZyB0aGUgc2xpZGVyLlxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmJhY2tncm91bmRDb2xvcj0nIzQ2NDY0NiddIC0gQmFja2dyb3VuZCBjb2xvciBvZiB0aGVcbiAqICBzbGlkZXIuXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuZm9yZWdyb3VuZENvbG9yPSdzdGVlbGJsdWUnXSAtIEZvcmVncm91bmQgY29sb3Igb2ZcbiAqICB0aGUgc2xpZGVyLlxuICogQHBhcmFtIHsnaG9yaXpvbnRhbCd8J3ZlcnRpY2FsJ30gW29wdGlvbnMub3JpZW50YXRpb249J2hvcml6b250YWwnXSAtXG4gKiAgT3JpZW50YXRpb24gb2YgdGhlIHNsaWRlci5cbiAqIEBwYXJhbSB7QXJyYXl9IFtvcHRpb25zLm1hcmtlcnM9W11dIC0gTGlzdCBvZiB2YWx1ZXMgd2hlcmUgbWFya2VycyBzaG91bGRcbiAqICBiZSBkaXNwbGF5ZWQgb24gdGhlIHNsaWRlci5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3Nob3dIYW5kbGU9dHJ1ZV0gLSBJbiAnaGFuZGxlJyBtb2RlLCBkZWZpbmUgaWYgdGhlXG4gKiAgZHJhZ2dhYmxlIHNob3VsZCBiZSBzaG93IG9yIG5vdC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbaGFuZGxlU2l6ZT0yMF0gLSBTaXplIG9mIHRoZSBkcmFnZ2FibGUgem9uZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbaGFuZGxlQ29sb3I9J3JnYmEoMjU1LCAyNTUsIDI1NSwgMC43KSddIC0gQ29sb3Igb2YgdGhlXG4gKiAgZHJhZ2dhYmxlIHpvbmUgKHdoZW4gYHNob3dIYW5kbGVgIGlzIGB0cnVlYCkuXG4gKi9cbmNsYXNzIFNsaWRlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAgIG1vZGU6ICdqdW1wJyxcbiAgICAgIGNhbGxiYWNrOiB2YWx1ZSA9PiB7fSxcbiAgICAgIHdpZHRoOiAyMDAsXG4gICAgICBoZWlnaHQ6IDMwLFxuICAgICAgbWluOiAwLFxuICAgICAgbWF4OiAxLFxuICAgICAgc3RlcDogMC4wMSxcbiAgICAgIGRlZmF1bHQ6IDAsXG4gICAgICBjb250YWluZXI6ICdib2R5JyxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyM0NjQ2NDYnLFxuICAgICAgZm9yZWdyb3VuZENvbG9yOiAnc3RlZWxibHVlJyxcbiAgICAgIG9yaWVudGF0aW9uOiAnaG9yaXpvbnRhbCcsXG4gICAgICBtYXJrZXJzOiBbXSxcblxuICAgICAgLy8gaGFuZGxlIHNwZWNpZmljIG9wdGlvbnNcbiAgICAgIHNob3dIYW5kbGU6IHRydWUsXG4gICAgICBoYW5kbGVTaXplOiAyMCxcbiAgICAgIGhhbmRsZUNvbG9yOiAncmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpJyxcbiAgICB9O1xuXG4gICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW107XG4gICAgdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0ID0gbnVsbDtcbiAgICB0aGlzLl90b3VjaElkID0gbnVsbDtcbiAgICB0aGlzLl92YWx1ZSA9IG51bGw7XG4gICAgdGhpcy5fY2FudmFzV2lkdGggPSBudWxsO1xuICAgIHRoaXMuX2NhbnZhc0hlaWdodCA9IG51bGw7XG4gICAgLy8gZm9yIHByb3BvcnRpb25uYWwgbW9kZVxuICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uID0geyB4OiBudWxsLCB5OiBudWxsIH07XG4gICAgdGhpcy5fY3VycmVudFNsaWRlclBvc2l0aW9uID0gbnVsbDtcblxuICAgIHRoaXMuX29uTW91c2VEb3duID0gdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbk1vdXNlTW92ZSA9IHRoaXMuX29uTW91c2VNb3ZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Nb3VzZVVwID0gdGhpcy5fb25Nb3VzZVVwLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLl9vblRvdWNoU3RhcnQgPSB0aGlzLl9vblRvdWNoU3RhcnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vblRvdWNoTW92ZSA9IHRoaXMuX29uVG91Y2hNb3ZlIC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uVG91Y2hFbmQgPSB0aGlzLl9vblRvdWNoRW5kLmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLl9vblJlc2l6ZSA9IHRoaXMuX29uUmVzaXplLmJpbmQodGhpcyk7XG5cblxuICAgIHRoaXMuX2NyZWF0ZUVsZW1lbnQoKTtcblxuICAgIC8vIGluaXRpYWxpemVcbiAgICB0aGlzLl9yZXNpemVFbGVtZW50KCk7XG4gICAgdGhpcy5fc2V0U2NhbGVzKCk7XG4gICAgdGhpcy5fYmluZEV2ZW50cygpO1xuICAgIHRoaXMuX29uUmVzaXplKCk7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWUodGhpcy5wYXJhbXMuZGVmYXVsdCk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fb25SZXNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgdmFsdWVcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGdldCB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cblxuICBzZXQgdmFsdWUodmFsKSB7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWUodmFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0aGUgc2xpZGVyIHRvIGl0cyBkZWZhdWx0IHZhbHVlLlxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWUodGhpcy5wYXJhbXMuZGVmYXVsdCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzaXplIHRoZSBzbGlkZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB3aWR0aCAtIE5ldyB3aWR0aCBvZiB0aGUgc2xpZGVyLlxuICAgKiBAcGFyYW0ge051bWJlcn0gaGVpZ2h0IC0gTmV3IGhlaWdodCBvZiB0aGUgc2xpZGVyLlxuICAgKi9cbiAgcmVzaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLnBhcmFtcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMucGFyYW1zLmhlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMuX3Jlc2l6ZUVsZW1lbnQoKTtcbiAgICB0aGlzLl9zZXRTY2FsZXMoKTtcbiAgICB0aGlzLl9vblJlc2l6ZSgpO1xuICAgIHRoaXMuX3VwZGF0ZVZhbHVlKHRoaXMuX3ZhbHVlLCB0cnVlKTtcbiAgfVxuXG4gIF91cGRhdGVWYWx1ZSh2YWx1ZSwgZm9yY2VSZW5kZXIgPSBmYWxzZSkge1xuICAgIGNvbnN0IHsgY2FsbGJhY2sgfSA9IHRoaXMucGFyYW1zO1xuICAgIGNvbnN0IGNsaXBwZWRWYWx1ZSA9IHRoaXMuY2xpcHBlcih2YWx1ZSk7XG5cbiAgICAvLyBpZiByZXNpemUgcmVuZGVyIGJ1dCBkb24ndCB0cmlnZ2VyIGNhbGxiYWNrXG4gICAgaWYgKGNsaXBwZWRWYWx1ZSA9PT0gdGhpcy5fdmFsdWUgJiYgZm9yY2VSZW5kZXIgPT09IHRydWUpXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5fcmVuZGVyKGNsaXBwZWRWYWx1ZSkpO1xuXG4gICAgLy8gdHJpZ2dlciBjYWxsYmFja1xuICAgIGlmIChjbGlwcGVkVmFsdWUgIT09IHRoaXMuX3ZhbHVlKSB7XG4gICAgICB0aGlzLl92YWx1ZSA9IGNsaXBwZWRWYWx1ZTtcbiAgICAgIGNhbGxiYWNrKGNsaXBwZWRWYWx1ZSk7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5fcmVuZGVyKGNsaXBwZWRWYWx1ZSkpO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVFbGVtZW50KCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSB0aGlzLnBhcmFtcztcbiAgICB0aGlzLiRjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0aGlzLmN0eCA9IHRoaXMuJGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgaWYgKGNvbnRhaW5lciBpbnN0YW5jZW9mIEVsZW1lbnQpXG4gICAgICB0aGlzLiRjb250YWluZXIgPSBjb250YWluZXI7XG4gICAgZWxzZVxuICAgICAgdGhpcy4kY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXIpO1xuXG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuJGNhbnZhcyk7XG4gIH1cblxuICBfcmVzaXplRWxlbWVudCgpIHtcbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMucGFyYW1zO1xuXG4gICAgLy8gbG9naWNhbCBhbmQgcGl4ZWwgc2l6ZSBvZiB0aGUgY2FudmFzXG4gICAgdGhpcy5fcGl4ZWxSYXRpbyA9IChmdW5jdGlvbihjdHgpIHtcbiAgICBjb25zdCBkUFIgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuICAgIGNvbnN0IGJQUiA9IGN0eC53ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICBjdHgubW96QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgY3R4Lm1zQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgY3R4Lm9CYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICBjdHguYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxO1xuXG4gICAgICByZXR1cm4gZFBSIC8gYlBSO1xuICAgIH0odGhpcy5jdHgpKTtcblxuICAgIHRoaXMuX2NhbnZhc1dpZHRoID0gd2lkdGggKiB0aGlzLl9waXhlbFJhdGlvO1xuICAgIHRoaXMuX2NhbnZhc0hlaWdodCA9IGhlaWdodCAqIHRoaXMuX3BpeGVsUmF0aW87XG5cbiAgICB0aGlzLmN0eC5jYW52YXMud2lkdGggPSB0aGlzLl9jYW52YXNXaWR0aDtcbiAgICB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0ID0gdGhpcy5fY2FudmFzSGVpZ2h0O1xuICAgIHRoaXMuY3R4LmNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICB0aGlzLmN0eC5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcbiAgfVxuXG4gIF9vblJlc2l6ZSgpIHtcbiAgICB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QgPSB0aGlzLiRjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIH1cblxuICBfc2V0U2NhbGVzKCkge1xuICAgIGNvbnN0IHsgb3JpZW50YXRpb24sIHdpZHRoLCBoZWlnaHQsIG1pbiwgbWF4LCBzdGVwIH0gPSB0aGlzLnBhcmFtcztcbiAgICAvLyBkZWZpbmUgdHJhbnNmZXJ0IGZ1bmN0aW9uc1xuICAgIGNvbnN0IHNjcmVlblNpemUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID9cbiAgICAgIHdpZHRoIDogaGVpZ2h0O1xuXG4gICAgY29uc3QgY2FudmFzU2l6ZSA9IG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgP1xuICAgICAgdGhpcy5fY2FudmFzV2lkdGggOiB0aGlzLl9jYW52YXNIZWlnaHQ7XG5cbiAgICBjb25zdCBkb21haW4gPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gW21pbiwgbWF4XSA6IFttYXgsIG1pbl07XG4gICAgY29uc3Qgc2NyZWVuUmFuZ2UgPSBbMCwgc2NyZWVuU2l6ZV07XG4gICAgY29uc3QgY2FudmFzUmFuZ2UgPSBbMCwgY2FudmFzU2l6ZV07XG5cbiAgICB0aGlzLnNjcmVlblNjYWxlID0gZ2V0U2NhbGUoZG9tYWluLCBzY3JlZW5SYW5nZSk7XG4gICAgdGhpcy5jYW52YXNTY2FsZSA9IGdldFNjYWxlKGRvbWFpbiwgY2FudmFzUmFuZ2UpO1xuICAgIHRoaXMuY2xpcHBlciA9IGdldENsaXBwZXIobWluLCBtYXgsIHN0ZXApO1xuICB9XG5cbiAgX2JpbmRFdmVudHMoKSB7XG4gICAgdGhpcy4kY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duKTtcbiAgICB0aGlzLiRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2hTdGFydCk7XG4gIH1cblxuICBfb25TdGFydCh4LCB5KSB7XG4gICAgbGV0IHN0YXJ0ZWQgPSBudWxsO1xuXG4gICAgc3dpdGNoICh0aGlzLnBhcmFtcy5tb2RlKSB7XG4gICAgICBjYXNlICdqdW1wJzpcbiAgICAgICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oeCwgeSk7XG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Byb3BvcnRpb25uYWwnOlxuICAgICAgICB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbi54ID0geDtcbiAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueSA9IHk7XG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2hhbmRsZSc6XG4gICAgICAgIGNvbnN0IG9yaWVudGF0aW9uID0gdGhpcy5wYXJhbXMub3JpZW50YXRpb247XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5zY3JlZW5TY2FsZSh0aGlzLl92YWx1ZSk7XG4gICAgICAgIGNvbnN0IGNvbXBhcmUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8geCA6IHk7XG4gICAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy5wYXJhbXMuaGFuZGxlU2l6ZSAvIDI7XG5cbiAgICAgICAgaWYgKGNvbXBhcmUgPCBwb3NpdGlvbiArIGRlbHRhICYmIGNvbXBhcmUgPiBwb3NpdGlvbiAtIGRlbHRhKSB7XG4gICAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueCA9IHg7XG4gICAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueSA9IHk7XG4gICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBzdGFydGVkO1xuICB9XG5cbiAgX29uTW92ZSh4LCB5KSB7XG4gICAgc3dpdGNoICh0aGlzLnBhcmFtcy5tb2RlKSB7XG4gICAgICBjYXNlICdqdW1wJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9wb3J0aW9ubmFsJzpcbiAgICAgIGNhc2UgJ2hhbmRsZSc6XG4gICAgICAgIGNvbnN0IGRlbHRhWCA9IHggLSB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbi54O1xuICAgICAgICBjb25zdCBkZWx0YVkgPSB5IC0gdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueTtcbiAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueCA9IHg7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnkgPSB5O1xuXG4gICAgICAgIHggPSB0aGlzLnNjcmVlblNjYWxlKHRoaXMuX3ZhbHVlKSArIGRlbHRhWDtcbiAgICAgICAgeSA9IHRoaXMuc2NyZWVuU2NhbGUodGhpcy5fdmFsdWUpICsgZGVsdGFZO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbih4LCB5KTtcbiAgfVxuXG4gIF9vbkVuZCgpIHtcbiAgICBzd2l0Y2ggKHRoaXMucGFyYW1zLm1vZGUpIHtcbiAgICAgIGNhc2UgJ2p1bXAnOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Byb3BvcnRpb25uYWwnOlxuICAgICAgY2FzZSAnaGFuZGxlJzpcbiAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnkgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBtb3VzZSBldmVudHNcbiAgX29uTW91c2VEb3duKGUpIHtcbiAgICBjb25zdCBwYWdlWCA9IGUucGFnZVg7XG4gICAgY29uc3QgcGFnZVkgPSBlLnBhZ2VZO1xuICAgIGNvbnN0IHggPSBwYWdlWCAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC5sZWZ0O1xuICAgIGNvbnN0IHkgPSBwYWdlWSAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC50b3A7XG5cbiAgICBpZiAodGhpcy5fb25TdGFydCh4LCB5KSA9PT0gdHJ1ZSkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwKTtcbiAgICB9XG4gIH1cblxuICBfb25Nb3VzZU1vdmUoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gcHJldmVudCB0ZXh0IHNlbGVjdGlvblxuXG4gICAgY29uc3QgcGFnZVggPSBlLnBhZ2VYO1xuICAgIGNvbnN0IHBhZ2VZID0gZS5wYWdlWTtcbiAgICBsZXQgeCA9IHBhZ2VYIC0gdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0LmxlZnQ7O1xuICAgIGxldCB5ID0gcGFnZVkgLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QudG9wOztcblxuICAgIHRoaXMuX29uTW92ZSh4LCB5KTtcbiAgfVxuXG4gIF9vbk1vdXNlVXAoZSkge1xuICAgIHRoaXMuX29uRW5kKCk7XG5cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwKTtcbiAgfVxuXG4gIC8vIHRvdWNoIGV2ZW50c1xuICBfb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICBpZiAodGhpcy5fdG91Y2hJZCAhPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdG91Y2ggPSBlLnRvdWNoZXNbMF07XG4gICAgdGhpcy5fdG91Y2hJZCA9IHRvdWNoLmlkZW50aWZpZXI7XG5cbiAgICBjb25zdCBwYWdlWCA9IHRvdWNoLnBhZ2VYO1xuICAgIGNvbnN0IHBhZ2VZID0gdG91Y2gucGFnZVk7XG4gICAgY29uc3QgeCA9IHBhZ2VYIC0gdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0LmxlZnQ7XG4gICAgY29uc3QgeSA9IHBhZ2VZIC0gdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0LnRvcDtcblxuICAgIGlmICh0aGlzLl9vblN0YXJ0KHgsIHkpID09PSB0cnVlKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaE1vdmUpO1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5fb25Ub3VjaEVuZCk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLl9vblRvdWNoRW5kKTtcbiAgICB9XG4gIH1cblxuICBfb25Ub3VjaE1vdmUoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gcHJldmVudCB0ZXh0IHNlbGVjdGlvblxuXG4gICAgY29uc3QgdG91Y2hlcyA9IEFycmF5LmZyb20oZS50b3VjaGVzKTtcbiAgICBjb25zdCB0b3VjaCA9IHRvdWNoZXMuZmlsdGVyKCh0KSA9PiB0LmlkZW50aWZpZXIgPT09IHRoaXMuX3RvdWNoSWQpWzBdO1xuXG4gICAgaWYgKHRvdWNoKSB7XG4gICAgICBjb25zdCBwYWdlWCA9IHRvdWNoLnBhZ2VYO1xuICAgICAgY29uc3QgcGFnZVkgPSB0b3VjaC5wYWdlWTtcbiAgICAgIGNvbnN0IHggPSBwYWdlWCAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC5sZWZ0O1xuICAgICAgY29uc3QgeSA9IHBhZ2VZIC0gdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0LnRvcDtcblxuICAgICAgdGhpcy5fb25Nb3ZlKHgsIHkpO1xuICAgIH1cbiAgfVxuXG4gIF9vblRvdWNoRW5kKGUpIHtcbiAgICBjb25zdCB0b3VjaGVzID0gQXJyYXkuZnJvbShlLnRvdWNoZXMpO1xuICAgIGNvbnN0IHRvdWNoID0gdG91Y2hlcy5maWx0ZXIoKHQpID0+IHQuaWRlbnRpZmllciA9PT0gdGhpcy5fdG91Y2hJZClbMF07XG5cbiAgICBpZiAodG91Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fb25FbmQoKTtcbiAgICAgIHRoaXMuX3RvdWNoSWQgPSBudWxsO1xuXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaE1vdmUpO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5fb25Ub3VjaEVuZCk7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLl9vblRvdWNoRW5kKTtcblxuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVQb3NpdGlvbih4LCB5KSB7XG4gICAgY29uc3Qge8Kgb3JpZW50YXRpb24sIGhlaWdodCB9ID0gdGhpcy5wYXJhbXM7XG4gICAgY29uc3QgcG9zaXRpb24gPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8geCA6IHk7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnNjcmVlblNjYWxlLmludmVydChwb3NpdGlvbik7XG5cbiAgICB0aGlzLl91cGRhdGVWYWx1ZSh2YWx1ZSk7XG4gIH1cblxuICBfcmVuZGVyKGNsaXBwZWRWYWx1ZSkge1xuICAgIGNvbnN0IHsgYmFja2dyb3VuZENvbG9yLCBmb3JlZ3JvdW5kQ29sb3IsIG9yaWVudGF0aW9uIH0gPSB0aGlzLnBhcmFtcztcbiAgICBjb25zdCBjYW52YXNQb3NpdGlvbiA9IE1hdGgucm91bmQodGhpcy5jYW52YXNTY2FsZShjbGlwcGVkVmFsdWUpKTtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMuX2NhbnZhc1dpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuX2NhbnZhc0hlaWdodDtcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgIC8vIGJhY2tncm91bmRcbiAgICBjdHguZmlsbFN0eWxlID0gYmFja2dyb3VuZENvbG9yO1xuICAgIGN0eC5maWxsUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgIC8vIGZvcmVncm91bmRcbiAgICBjdHguZmlsbFN0eWxlID0gZm9yZWdyb3VuZENvbG9yO1xuXG4gICAgaWYgKG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcpXG4gICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzUG9zaXRpb24sIGhlaWdodCk7XG4gICAgZWxzZVxuICAgICAgY3R4LmZpbGxSZWN0KDAsIGNhbnZhc1Bvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgIC8vIG1hcmtlcnNcbiAgICBjb25zdCBtYXJrZXJzID0gdGhpcy5wYXJhbXMubWFya2VycztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWFya2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbWFya2VyID0gbWFya2Vyc1tpXTtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5jYW52YXNTY2FsZShtYXJrZXIpO1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC43KSc7XG4gICAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgIGN0eC5tb3ZlVG8ocG9zaXRpb24gLSAwLjUsIDEpO1xuICAgICAgICBjdHgubGluZVRvKHBvc2l0aW9uIC0gMC41LCBoZWlnaHQgLSAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN0eC5tb3ZlVG8oMSwgaGVpZ2h0IC0gcG9zaXRpb24gKyAwLjUpO1xuICAgICAgICBjdHgubGluZVRvKHdpZHRoIC0gMSwgaGVpZ2h0IC0gcG9zaXRpb24gKyAwLjUpO1xuICAgICAgfVxuXG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIG1vZGVcbiAgICBpZiAodGhpcy5wYXJhbXMubW9kZSA9PT0gJ2hhbmRsZScgJiYgdGhpcy5wYXJhbXMuc2hvd0hhbmRsZSkge1xuICAgICAgY29uc3QgZGVsdGEgPSB0aGlzLnBhcmFtcy5oYW5kbGVTaXplICogdGhpcy5fcGl4ZWxSYXRpbyAvIDI7XG4gICAgICBjb25zdCBzdGFydCA9IGNhbnZhc1Bvc2l0aW9uIC0gZGVsdGE7XG4gICAgICBjb25zdCBlbmQgPSBjYW52YXNQb3NpdGlvbiArIGRlbHRhO1xuXG4gICAgICBjdHguZ2xvYmFsQWxwaGEgPSAxO1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMucGFyYW1zLmhhbmRsZUNvbG9yO1xuXG4gICAgICBpZiAob3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICBjdHguZmlsbFJlY3Qoc3RhcnQsIDAsIGVuZCAtIHN0YXJ0LCBoZWlnaHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIHN0YXJ0LCB3aWR0aCwgZW5kIC0gc3RhcnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2xpZGVyO1xuIl19