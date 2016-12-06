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
    this._updateValue(this.params.default, false, true);

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

      var forceRender = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var silent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var callback = this.params.callback;

      var clippedValue = this.clipper(value);

      // if resize render but don't trigger callback
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNsaWRlci5qcyJdLCJuYW1lcyI6WyJnZXRTY2FsZSIsImRvbWFpbiIsInJhbmdlIiwic2xvcGUiLCJpbnRlcmNlcHQiLCJzY2FsZSIsInZhbCIsImludmVydCIsImdldENsaXBwZXIiLCJtaW4iLCJtYXgiLCJzdGVwIiwiY2xpcHBlZFZhbHVlIiwiTWF0aCIsInJvdW5kIiwiZml4ZWQiLCJsb2cxMCIsImZpeGVkVmFsdWUiLCJ0b0ZpeGVkIiwicGFyc2VGbG9hdCIsIlNsaWRlciIsIm9wdGlvbnMiLCJkZWZhdWx0cyIsIm1vZGUiLCJjYWxsYmFjayIsIndpZHRoIiwiaGVpZ2h0IiwiZGVmYXVsdCIsImNvbnRhaW5lciIsImJhY2tncm91bmRDb2xvciIsImZvcmVncm91bmRDb2xvciIsIm9yaWVudGF0aW9uIiwibWFya2VycyIsInNob3dIYW5kbGUiLCJoYW5kbGVTaXplIiwiaGFuZGxlQ29sb3IiLCJwYXJhbXMiLCJPYmplY3QiLCJhc3NpZ24iLCJfbGlzdGVuZXJzIiwiX2JvdW5kaW5nQ2xpZW50UmVjdCIsIl90b3VjaElkIiwiX3ZhbHVlIiwiX2NhbnZhc1dpZHRoIiwiX2NhbnZhc0hlaWdodCIsIl9jdXJyZW50TW91c2VQb3NpdGlvbiIsIngiLCJ5IiwiX2N1cnJlbnRTbGlkZXJQb3NpdGlvbiIsIl9vbk1vdXNlRG93biIsImJpbmQiLCJfb25Nb3VzZU1vdmUiLCJfb25Nb3VzZVVwIiwiX29uVG91Y2hTdGFydCIsIl9vblRvdWNoTW92ZSIsIl9vblRvdWNoRW5kIiwiX29uUmVzaXplIiwiX2NyZWF0ZUVsZW1lbnQiLCJfcmVzaXplRWxlbWVudCIsIl9zZXRTY2FsZXMiLCJfYmluZEV2ZW50cyIsIl91cGRhdGVWYWx1ZSIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJ2YWx1ZSIsImZvcmNlUmVuZGVyIiwic2lsZW50IiwiY2xpcHBlciIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsIl9yZW5kZXIiLCIkY2FudmFzIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY3R4IiwiZ2V0Q29udGV4dCIsIkVsZW1lbnQiLCIkY29udGFpbmVyIiwicXVlcnlTZWxlY3RvciIsImFwcGVuZENoaWxkIiwiX3BpeGVsUmF0aW8iLCJkUFIiLCJkZXZpY2VQaXhlbFJhdGlvIiwiYlBSIiwid2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsIm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJtc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJvQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyIsImJhY2tpbmdTdG9yZVBpeGVsUmF0aW8iLCJjYW52YXMiLCJzdHlsZSIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInNjcmVlblNpemUiLCJjYW52YXNTaXplIiwic2NyZWVuUmFuZ2UiLCJjYW52YXNSYW5nZSIsInNjcmVlblNjYWxlIiwiY2FudmFzU2NhbGUiLCJzdGFydGVkIiwiX3VwZGF0ZVBvc2l0aW9uIiwicG9zaXRpb24iLCJjb21wYXJlIiwiZGVsdGEiLCJkZWx0YVgiLCJkZWx0YVkiLCJlIiwicGFnZVgiLCJwYWdlWSIsImxlZnQiLCJ0b3AiLCJfb25TdGFydCIsInByZXZlbnREZWZhdWx0IiwiX29uTW92ZSIsIl9vbkVuZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ0b3VjaCIsInRvdWNoZXMiLCJpZGVudGlmaWVyIiwiQXJyYXkiLCJmcm9tIiwiZmlsdGVyIiwidCIsInVuZGVmaW5lZCIsImNhbnZhc1Bvc2l0aW9uIiwic2F2ZSIsImNsZWFyUmVjdCIsImZpbGxTdHlsZSIsImZpbGxSZWN0IiwiaSIsImxlbmd0aCIsIm1hcmtlciIsInN0cm9rZVN0eWxlIiwiYmVnaW5QYXRoIiwibW92ZVRvIiwibGluZVRvIiwiY2xvc2VQYXRoIiwic3Ryb2tlIiwic3RhcnQiLCJlbmQiLCJnbG9iYWxBbHBoYSIsInJlc3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxRQUFULENBQWtCQyxNQUFsQixFQUEwQkMsS0FBMUIsRUFBaUM7QUFDL0IsTUFB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QUFuQixFQUFzQkMsU0FBU3lFLFFBQVQsR0FBb0IsR0FBMUM7QUFDRDs7QUFFRDFCLFlBQUk2RCxTQUFKO0FBQ0E3RCxZQUFJOEQsTUFBSjtBQUNEOztBQUVEO0FBQ0EsVUFBSSxLQUFLbkcsTUFBTCxDQUFZYixJQUFaLEtBQXFCLFFBQXJCLElBQWlDLEtBQUthLE1BQUwsQ0FBWUgsVUFBakQsRUFBNkQ7QUFDM0QsWUFBTW9FLFFBQVEsS0FBS2pFLE1BQUwsQ0FBWUYsVUFBWixHQUF5QixLQUFLNkMsV0FBOUIsR0FBNEMsQ0FBMUQ7QUFDQSxZQUFNeUQsUUFBUWQsaUJBQWlCckIsS0FBL0I7QUFDQSxZQUFNb0MsTUFBTWYsaUJBQWlCckIsS0FBN0I7O0FBRUE1QixZQUFJaUUsV0FBSixHQUFrQixDQUFsQjtBQUNBakUsWUFBSW9ELFNBQUosR0FBZ0IsS0FBS3pGLE1BQUwsQ0FBWUQsV0FBNUI7O0FBRUEsWUFBSUosZ0JBQWdCLFlBQXBCLEVBQWtDO0FBQ2hDMEMsY0FBSXFELFFBQUosQ0FBYVUsS0FBYixFQUFvQixDQUFwQixFQUF1QkMsTUFBTUQsS0FBN0IsRUFBb0M5RyxNQUFwQztBQUNELFNBRkQsTUFFTztBQUNMK0MsY0FBSXFELFFBQUosQ0FBYSxDQUFiLEVBQWdCVSxLQUFoQixFQUF1Qi9HLEtBQXZCLEVBQThCZ0gsTUFBTUQsS0FBcEM7QUFDRDtBQUNGOztBQUVEL0QsVUFBSWtFLE9BQUo7QUFDRDs7O3dCQXRVVztBQUNWLGFBQU8sS0FBS2pHLE1BQVo7QUFDRCxLO3NCQUVTcEMsRyxFQUFLO0FBQ2IsV0FBS3VELFlBQUwsQ0FBa0J2RCxHQUFsQjtBQUNEOzs7Ozs7a0JBbVVZYyxNIiwiZmlsZSI6IlNsaWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIGdldFNjYWxlKGRvbWFpbiwgcmFuZ2UpIHtcbiAgY29uc3Qgc2xvcGUgPSAocmFuZ2VbMV0gLSByYW5nZVswXSkgLyAoZG9tYWluWzFdIC0gZG9tYWluWzBdKTtcbiAgY29uc3QgaW50ZXJjZXB0ID0gcmFuZ2VbMF0gLSBzbG9wZSAqIGRvbWFpblswXTtcblxuICBmdW5jdGlvbiBzY2FsZSh2YWwpIHtcbiAgICByZXR1cm4gc2xvcGUgKiB2YWwgKyBpbnRlcmNlcHQ7XG4gIH1cblxuICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gKHZhbCAtIGludGVyY2VwdCkgLyBzbG9wZTtcbiAgfVxuXG4gIHJldHVybiBzY2FsZTtcbn1cblxuZnVuY3Rpb24gZ2V0Q2xpcHBlcihtaW4sIG1heCwgc3RlcCkge1xuICByZXR1cm4gKHZhbCkgPT4ge1xuICAgIGNvbnN0IGNsaXBwZWRWYWx1ZSA9IE1hdGgucm91bmQodmFsIC8gc3RlcCkgKiBzdGVwO1xuICAgIGNvbnN0IGZpeGVkID0gTWF0aC5tYXgoTWF0aC5sb2cxMCgxIC8gc3RlcCksIDApO1xuICAgIGNvbnN0IGZpeGVkVmFsdWUgPSBjbGlwcGVkVmFsdWUudG9GaXhlZChmaXhlZCk7IC8vIGZpeCBmbG9hdGluZyBwb2ludCBlcnJvcnNcbiAgICByZXR1cm4gTWF0aC5taW4obWF4LCBNYXRoLm1heChtaW4sIHBhcnNlRmxvYXQoZml4ZWRWYWx1ZSkpKTtcbiAgfVxufVxuXG4vKipcbiAqIEBtb2R1bGUgZ3VpLWNvbXBvbmVudHNcbiAqL1xuXG4vKipcbiAqIFZlcnNhdGlsZSBjYW52YXMgYmFzZWQgc2xpZGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGUgZGVmYXVsdCBwYXJhbWV0ZXJzLlxuICogQHBhcmFtIHsnanVtcCd8J3Byb3BvcnRpb25uYWwnfCdoYW5kbGUnfSBbb3B0aW9ucy5tb2RlPSdqdW1wJ10gLSBNb2RlIG9mIHRoZSBzbGlkZXI6XG4gKiAgLSBpbiAnanVtcCcgbW9kZSwgdGhlIHZhbHVlIGlzIGNoYW5nZWQgb24gJ3RvdWNoc3RhcnQnIG9yICdtb3VzZWRvd24nLCBhbmRcbiAqICAgIG9uIG1vdmUuXG4gKiAgLSBpbiAncHJvcG9ydGlvbm5hbCcgbW9kZSwgdGhlIHZhbHVlIGlzIHVwZGF0ZWQgcmVsYXRpdmVseSB0byBtb3ZlLlxuICogIC0gaW4gJ2hhbmRsZScgbW9kZSwgdGhlIHNsaWRlciBjYW4gYmUgZ3JhYmJlZCBvbmx5IGFyb3VuZCBpdHMgdmFsdWUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5jYWxsYmFja10gLSBDYWxsYmFjayB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSB2YWx1ZVxuICogIG9mIHRoZSBzbGlkZXIgY2hhbmdlcy5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy53aWR0aD0yMDBdIC0gV2lkdGggb2YgdGhlIHNsaWRlci5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5oZWlnaHQ9MzBdIC0gSGVpZ2h0IG9mIHRoZSBzbGlkZXIuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMubWluPTBdIC0gTWluaW11bSB2YWx1ZS5cbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5tYXg9MV0gLSBNYXhpbXVtIHZhbHVlLlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnN0ZXA9MC4wMV0gLSBTdGVwIGJldHdlZW4gZWFjaCBjb25zZWN1dGl2ZSB2YWx1ZXMuXG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuZGVmYXVsdD0wXSAtIERlZmF1bHQgdmFsdWUuXG4gKiBAcGFyYW0ge1N0cmluZ3xFbGVtZW50fSBbb3B0aW9ucy5jb250YWluZXI9J2JvZHknXSAtIENTUyBTZWxlY3RvciBvciBET01cbiAqICBlbGVtZW50IGluIHdoaWNoIGluc2VydGluZyB0aGUgc2xpZGVyLlxuICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmJhY2tncm91bmRDb2xvcj0nIzQ2NDY0NiddIC0gQmFja2dyb3VuZCBjb2xvciBvZiB0aGVcbiAqICBzbGlkZXIuXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuZm9yZWdyb3VuZENvbG9yPSdzdGVlbGJsdWUnXSAtIEZvcmVncm91bmQgY29sb3Igb2ZcbiAqICB0aGUgc2xpZGVyLlxuICogQHBhcmFtIHsnaG9yaXpvbnRhbCd8J3ZlcnRpY2FsJ30gW29wdGlvbnMub3JpZW50YXRpb249J2hvcml6b250YWwnXSAtXG4gKiAgT3JpZW50YXRpb24gb2YgdGhlIHNsaWRlci5cbiAqIEBwYXJhbSB7QXJyYXl9IFtvcHRpb25zLm1hcmtlcnM9W11dIC0gTGlzdCBvZiB2YWx1ZXMgd2hlcmUgbWFya2VycyBzaG91bGRcbiAqICBiZSBkaXNwbGF5ZWQgb24gdGhlIHNsaWRlci5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuc2hvd0hhbmRsZT10cnVlXSAtIEluICdoYW5kbGUnIG1vZGUsIGRlZmluZSBpZiB0aGVcbiAqICBkcmFnZ2FibGUgc2hvdWxkIGJlIHNob3cgb3Igbm90LlxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmhhbmRsZVNpemU9MjBdIC0gU2l6ZSBvZiB0aGUgZHJhZ2dhYmxlIHpvbmUuXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuaGFuZGxlQ29sb3I9J3JnYmEoMjU1LCAyNTUsIDI1NSwgMC43KSddIC0gQ29sb3Igb2YgdGhlXG4gKiAgZHJhZ2dhYmxlIHpvbmUgKHdoZW4gYHNob3dIYW5kbGVgIGlzIGB0cnVlYCkuXG4gKlxuICogQGV4YW1wbGVcbiAqIGltcG9ydCB7IFNsaWRlcn0gZnJvbSAnZ3VpLWNvbXBvbmVudHMnO1xuICpcbiAqIGNvbnN0IHNsaWRlciA9IG5ldyBTbGlkZXIoe1xuICogICBtb2RlOiAnanVtcCcsXG4gKiAgIGNvbnRhaW5lcjogJyNjb250YWluZXInLFxuICogICBkZWZhdWx0OiAwLjYsXG4gKiAgIG1hcmtlcnM6IFswLjVdLFxuICogICBjYWxsYmFjazogKHZhbHVlKSA9PiBjb25zb2xlLmxvZyh2YWx1ZSksXG4gKiB9KTtcbiAqL1xuY2xhc3MgU2xpZGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIGNvbnN0IGRlZmF1bHRzID0ge1xuICAgICAgbW9kZTogJ2p1bXAnLFxuICAgICAgY2FsbGJhY2s6IHZhbHVlID0+IHt9LFxuICAgICAgd2lkdGg6IDIwMCxcbiAgICAgIGhlaWdodDogMzAsXG4gICAgICBtaW46IDAsXG4gICAgICBtYXg6IDEsXG4gICAgICBzdGVwOiAwLjAxLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICAgIGNvbnRhaW5lcjogJ2JvZHknLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzQ2NDY0NicsXG4gICAgICBmb3JlZ3JvdW5kQ29sb3I6ICdzdGVlbGJsdWUnLFxuICAgICAgb3JpZW50YXRpb246ICdob3Jpem9udGFsJyxcbiAgICAgIG1hcmtlcnM6IFtdLFxuXG4gICAgICAvLyBoYW5kbGUgc3BlY2lmaWMgb3B0aW9uc1xuICAgICAgc2hvd0hhbmRsZTogdHJ1ZSxcbiAgICAgIGhhbmRsZVNpemU6IDIwLFxuICAgICAgaGFuZGxlQ29sb3I6ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNyknLFxuICAgIH07XG5cbiAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICB0aGlzLl9saXN0ZW5lcnMgPSBbXTtcbiAgICB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QgPSBudWxsO1xuICAgIHRoaXMuX3RvdWNoSWQgPSBudWxsO1xuICAgIHRoaXMuX3ZhbHVlID0gbnVsbDtcbiAgICB0aGlzLl9jYW52YXNXaWR0aCA9IG51bGw7XG4gICAgdGhpcy5fY2FudmFzSGVpZ2h0ID0gbnVsbDtcbiAgICAvLyBmb3IgcHJvcG9ydGlvbm5hbCBtb2RlXG4gICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24gPSB7IHg6IG51bGwsIHk6IG51bGwgfTtcbiAgICB0aGlzLl9jdXJyZW50U2xpZGVyUG9zaXRpb24gPSBudWxsO1xuXG4gICAgdGhpcy5fb25Nb3VzZURvd24gPSB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uTW91c2VNb3ZlID0gdGhpcy5fb25Nb3VzZU1vdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbk1vdXNlVXAgPSB0aGlzLl9vbk1vdXNlVXAuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuX29uVG91Y2hTdGFydCA9IHRoaXMuX29uVG91Y2hTdGFydC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX29uVG91Y2hNb3ZlID0gdGhpcy5fb25Ub3VjaE1vdmUgLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25Ub3VjaEVuZCA9IHRoaXMuX29uVG91Y2hFbmQuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuX29uUmVzaXplID0gdGhpcy5fb25SZXNpemUuYmluZCh0aGlzKTtcblxuXG4gICAgdGhpcy5fY3JlYXRlRWxlbWVudCgpO1xuXG4gICAgLy8gaW5pdGlhbGl6ZVxuICAgIHRoaXMuX3Jlc2l6ZUVsZW1lbnQoKTtcbiAgICB0aGlzLl9zZXRTY2FsZXMoKTtcbiAgICB0aGlzLl9iaW5kRXZlbnRzKCk7XG4gICAgdGhpcy5fb25SZXNpemUoKTtcbiAgICB0aGlzLl91cGRhdGVWYWx1ZSh0aGlzLnBhcmFtcy5kZWZhdWx0LCBmYWxzZSwgdHJ1ZSk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fb25SZXNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEN1cnJlbnQgdmFsdWUgb2YgdGhlIHNsaWRlci5cbiAgICpcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGdldCB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gIH1cblxuICBzZXQgdmFsdWUodmFsKSB7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWUodmFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldCB0aGUgc2xpZGVyIHRvIGl0cyBkZWZhdWx0IHZhbHVlLlxuICAgKi9cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5fdXBkYXRlVmFsdWUodGhpcy5wYXJhbXMuZGVmYXVsdCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzaXplIHRoZSBzbGlkZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB3aWR0aCAtIE5ldyB3aWR0aCBvZiB0aGUgc2xpZGVyLlxuICAgKiBAcGFyYW0ge051bWJlcn0gaGVpZ2h0IC0gTmV3IGhlaWdodCBvZiB0aGUgc2xpZGVyLlxuICAgKi9cbiAgcmVzaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLnBhcmFtcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMucGFyYW1zLmhlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMuX3Jlc2l6ZUVsZW1lbnQoKTtcbiAgICB0aGlzLl9zZXRTY2FsZXMoKTtcbiAgICB0aGlzLl9vblJlc2l6ZSgpO1xuICAgIHRoaXMuX3VwZGF0ZVZhbHVlKHRoaXMuX3ZhbHVlLCB0cnVlLCB0cnVlKTtcbiAgfVxuXG4gIF91cGRhdGVWYWx1ZSh2YWx1ZSwgZm9yY2VSZW5kZXIgPSBmYWxzZSwgc2lsZW50ID0gZmFsc2UpIHtcbiAgICBjb25zdCB7IGNhbGxiYWNrIH0gPSB0aGlzLnBhcmFtcztcbiAgICBjb25zdCBjbGlwcGVkVmFsdWUgPSB0aGlzLmNsaXBwZXIodmFsdWUpO1xuXG4gICAgLy8gaWYgcmVzaXplIHJlbmRlciBidXQgZG9uJ3QgdHJpZ2dlciBjYWxsYmFja1xuICAgIGlmIChjbGlwcGVkVmFsdWUgPT09IHRoaXMuX3ZhbHVlICYmIGZvcmNlUmVuZGVyID09PSB0cnVlKVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHRoaXMuX3JlbmRlcihjbGlwcGVkVmFsdWUpKTtcblxuICAgIC8vIHRyaWdnZXIgY2FsbGJhY2tcbiAgICBpZiAoY2xpcHBlZFZhbHVlICE9PSB0aGlzLl92YWx1ZSkge1xuICAgICAgdGhpcy5fdmFsdWUgPSBjbGlwcGVkVmFsdWU7XG5cbiAgICAgIGlmICghc2lsZW50KVxuICAgICAgICBjYWxsYmFjayhjbGlwcGVkVmFsdWUpO1xuXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5fcmVuZGVyKGNsaXBwZWRWYWx1ZSkpO1xuICAgIH1cbiAgfVxuXG4gIF9jcmVhdGVFbGVtZW50KCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyIH0gPSB0aGlzLnBhcmFtcztcbiAgICB0aGlzLiRjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0aGlzLmN0eCA9IHRoaXMuJGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgaWYgKGNvbnRhaW5lciBpbnN0YW5jZW9mIEVsZW1lbnQpXG4gICAgICB0aGlzLiRjb250YWluZXIgPSBjb250YWluZXI7XG4gICAgZWxzZVxuICAgICAgdGhpcy4kY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXIpO1xuXG4gICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuJGNhbnZhcyk7XG4gIH1cblxuICBfcmVzaXplRWxlbWVudCgpIHtcbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMucGFyYW1zO1xuXG4gICAgLy8gbG9naWNhbCBhbmQgcGl4ZWwgc2l6ZSBvZiB0aGUgY2FudmFzXG4gICAgdGhpcy5fcGl4ZWxSYXRpbyA9IChmdW5jdGlvbihjdHgpIHtcbiAgICBjb25zdCBkUFIgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xuICAgIGNvbnN0IGJQUiA9IGN0eC53ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICBjdHgubW96QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgY3R4Lm1zQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgICAgY3R4Lm9CYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgICBjdHguYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxO1xuXG4gICAgICByZXR1cm4gZFBSIC8gYlBSO1xuICAgIH0odGhpcy5jdHgpKTtcblxuICAgIHRoaXMuX2NhbnZhc1dpZHRoID0gd2lkdGggKiB0aGlzLl9waXhlbFJhdGlvO1xuICAgIHRoaXMuX2NhbnZhc0hlaWdodCA9IGhlaWdodCAqIHRoaXMuX3BpeGVsUmF0aW87XG5cbiAgICB0aGlzLmN0eC5jYW52YXMud2lkdGggPSB0aGlzLl9jYW52YXNXaWR0aDtcbiAgICB0aGlzLmN0eC5jYW52YXMuaGVpZ2h0ID0gdGhpcy5fY2FudmFzSGVpZ2h0O1xuICAgIHRoaXMuY3R4LmNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YDtcbiAgICB0aGlzLmN0eC5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YDtcbiAgfVxuXG4gIF9vblJlc2l6ZSgpIHtcbiAgICB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QgPSB0aGlzLiRjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIH1cblxuICBfc2V0U2NhbGVzKCkge1xuICAgIGNvbnN0IHsgb3JpZW50YXRpb24sIHdpZHRoLCBoZWlnaHQsIG1pbiwgbWF4LCBzdGVwIH0gPSB0aGlzLnBhcmFtcztcbiAgICAvLyBkZWZpbmUgdHJhbnNmZXJ0IGZ1bmN0aW9uc1xuICAgIGNvbnN0IHNjcmVlblNpemUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID9cbiAgICAgIHdpZHRoIDogaGVpZ2h0O1xuXG4gICAgY29uc3QgY2FudmFzU2l6ZSA9IG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgP1xuICAgICAgdGhpcy5fY2FudmFzV2lkdGggOiB0aGlzLl9jYW52YXNIZWlnaHQ7XG5cbiAgICBjb25zdCBkb21haW4gPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8gW21pbiwgbWF4XSA6IFttYXgsIG1pbl07XG4gICAgY29uc3Qgc2NyZWVuUmFuZ2UgPSBbMCwgc2NyZWVuU2l6ZV07XG4gICAgY29uc3QgY2FudmFzUmFuZ2UgPSBbMCwgY2FudmFzU2l6ZV07XG5cbiAgICB0aGlzLnNjcmVlblNjYWxlID0gZ2V0U2NhbGUoZG9tYWluLCBzY3JlZW5SYW5nZSk7XG4gICAgdGhpcy5jYW52YXNTY2FsZSA9IGdldFNjYWxlKGRvbWFpbiwgY2FudmFzUmFuZ2UpO1xuICAgIHRoaXMuY2xpcHBlciA9IGdldENsaXBwZXIobWluLCBtYXgsIHN0ZXApO1xuICB9XG5cbiAgX2JpbmRFdmVudHMoKSB7XG4gICAgdGhpcy4kY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duKTtcbiAgICB0aGlzLiRjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMuX29uVG91Y2hTdGFydCk7XG4gIH1cblxuICBfb25TdGFydCh4LCB5KSB7XG4gICAgbGV0IHN0YXJ0ZWQgPSBudWxsO1xuXG4gICAgc3dpdGNoICh0aGlzLnBhcmFtcy5tb2RlKSB7XG4gICAgICBjYXNlICdqdW1wJzpcbiAgICAgICAgdGhpcy5fdXBkYXRlUG9zaXRpb24oeCwgeSk7XG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Byb3BvcnRpb25uYWwnOlxuICAgICAgICB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbi54ID0geDtcbiAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueSA9IHk7XG4gICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2hhbmRsZSc6XG4gICAgICAgIGNvbnN0IG9yaWVudGF0aW9uID0gdGhpcy5wYXJhbXMub3JpZW50YXRpb247XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5zY3JlZW5TY2FsZSh0aGlzLl92YWx1ZSk7XG4gICAgICAgIGNvbnN0IGNvbXBhcmUgPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8geCA6IHk7XG4gICAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy5wYXJhbXMuaGFuZGxlU2l6ZSAvIDI7XG5cbiAgICAgICAgaWYgKGNvbXBhcmUgPCBwb3NpdGlvbiArIGRlbHRhICYmIGNvbXBhcmUgPiBwb3NpdGlvbiAtIGRlbHRhKSB7XG4gICAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueCA9IHg7XG4gICAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueSA9IHk7XG4gICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBzdGFydGVkO1xuICB9XG5cbiAgX29uTW92ZSh4LCB5KSB7XG4gICAgc3dpdGNoICh0aGlzLnBhcmFtcy5tb2RlKSB7XG4gICAgICBjYXNlICdqdW1wJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9wb3J0aW9ubmFsJzpcbiAgICAgIGNhc2UgJ2hhbmRsZSc6XG4gICAgICAgIGNvbnN0IGRlbHRhWCA9IHggLSB0aGlzLl9jdXJyZW50TW91c2VQb3NpdGlvbi54O1xuICAgICAgICBjb25zdCBkZWx0YVkgPSB5IC0gdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueTtcbiAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueCA9IHg7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnkgPSB5O1xuXG4gICAgICAgIHggPSB0aGlzLnNjcmVlblNjYWxlKHRoaXMuX3ZhbHVlKSArIGRlbHRhWDtcbiAgICAgICAgeSA9IHRoaXMuc2NyZWVuU2NhbGUodGhpcy5fdmFsdWUpICsgZGVsdGFZO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVQb3NpdGlvbih4LCB5KTtcbiAgfVxuXG4gIF9vbkVuZCgpIHtcbiAgICBzd2l0Y2ggKHRoaXMucGFyYW1zLm1vZGUpIHtcbiAgICAgIGNhc2UgJ2p1bXAnOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Byb3BvcnRpb25uYWwnOlxuICAgICAgY2FzZSAnaGFuZGxlJzpcbiAgICAgICAgdGhpcy5fY3VycmVudE1vdXNlUG9zaXRpb24ueCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2N1cnJlbnRNb3VzZVBvc2l0aW9uLnkgPSBudWxsO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBtb3VzZSBldmVudHNcbiAgX29uTW91c2VEb3duKGUpIHtcbiAgICBjb25zdCBwYWdlWCA9IGUucGFnZVg7XG4gICAgY29uc3QgcGFnZVkgPSBlLnBhZ2VZO1xuICAgIGNvbnN0IHggPSBwYWdlWCAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC5sZWZ0O1xuICAgIGNvbnN0IHkgPSBwYWdlWSAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC50b3A7XG5cbiAgICBpZiAodGhpcy5fb25TdGFydCh4LCB5KSA9PT0gdHJ1ZSkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwKTtcbiAgICB9XG4gIH1cblxuICBfb25Nb3VzZU1vdmUoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gcHJldmVudCB0ZXh0IHNlbGVjdGlvblxuXG4gICAgY29uc3QgcGFnZVggPSBlLnBhZ2VYO1xuICAgIGNvbnN0IHBhZ2VZID0gZS5wYWdlWTtcbiAgICBsZXQgeCA9IHBhZ2VYIC0gdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0LmxlZnQ7O1xuICAgIGxldCB5ID0gcGFnZVkgLSB0aGlzLl9ib3VuZGluZ0NsaWVudFJlY3QudG9wOztcblxuICAgIHRoaXMuX29uTW92ZSh4LCB5KTtcbiAgfVxuXG4gIF9vbk1vdXNlVXAoZSkge1xuICAgIHRoaXMuX29uRW5kKCk7XG5cbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwKTtcbiAgfVxuXG4gIC8vIHRvdWNoIGV2ZW50c1xuICBfb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICBpZiAodGhpcy5fdG91Y2hJZCAhPT0gbnVsbCkgcmV0dXJuO1xuXG4gICAgY29uc3QgdG91Y2ggPSBlLnRvdWNoZXNbMF07XG4gICAgdGhpcy5fdG91Y2hJZCA9IHRvdWNoLmlkZW50aWZpZXI7XG5cbiAgICBjb25zdCBwYWdlWCA9IHRvdWNoLnBhZ2VYO1xuICAgIGNvbnN0IHBhZ2VZID0gdG91Y2gucGFnZVk7XG4gICAgY29uc3QgeCA9IHBhZ2VYIC0gdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0LmxlZnQ7XG4gICAgY29uc3QgeSA9IHBhZ2VZIC0gdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0LnRvcDtcblxuICAgIGlmICh0aGlzLl9vblN0YXJ0KHgsIHkpID09PSB0cnVlKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaE1vdmUpO1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5fb25Ub3VjaEVuZCk7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLl9vblRvdWNoRW5kKTtcbiAgICB9XG4gIH1cblxuICBfb25Ub3VjaE1vdmUoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gcHJldmVudCB0ZXh0IHNlbGVjdGlvblxuXG4gICAgY29uc3QgdG91Y2hlcyA9IEFycmF5LmZyb20oZS50b3VjaGVzKTtcbiAgICBjb25zdCB0b3VjaCA9IHRvdWNoZXMuZmlsdGVyKCh0KSA9PiB0LmlkZW50aWZpZXIgPT09IHRoaXMuX3RvdWNoSWQpWzBdO1xuXG4gICAgaWYgKHRvdWNoKSB7XG4gICAgICBjb25zdCBwYWdlWCA9IHRvdWNoLnBhZ2VYO1xuICAgICAgY29uc3QgcGFnZVkgPSB0b3VjaC5wYWdlWTtcbiAgICAgIGNvbnN0IHggPSBwYWdlWCAtIHRoaXMuX2JvdW5kaW5nQ2xpZW50UmVjdC5sZWZ0O1xuICAgICAgY29uc3QgeSA9IHBhZ2VZIC0gdGhpcy5fYm91bmRpbmdDbGllbnRSZWN0LnRvcDtcblxuICAgICAgdGhpcy5fb25Nb3ZlKHgsIHkpO1xuICAgIH1cbiAgfVxuXG4gIF9vblRvdWNoRW5kKGUpIHtcbiAgICBjb25zdCB0b3VjaGVzID0gQXJyYXkuZnJvbShlLnRvdWNoZXMpO1xuICAgIGNvbnN0IHRvdWNoID0gdG91Y2hlcy5maWx0ZXIoKHQpID0+IHQuaWRlbnRpZmllciA9PT0gdGhpcy5fdG91Y2hJZClbMF07XG5cbiAgICBpZiAodG91Y2ggPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fb25FbmQoKTtcbiAgICAgIHRoaXMuX3RvdWNoSWQgPSBudWxsO1xuXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5fb25Ub3VjaE1vdmUpO1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5fb25Ub3VjaEVuZCk7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLl9vblRvdWNoRW5kKTtcblxuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVQb3NpdGlvbih4LCB5KSB7XG4gICAgY29uc3Qge8Kgb3JpZW50YXRpb24sIGhlaWdodCB9ID0gdGhpcy5wYXJhbXM7XG4gICAgY29uc3QgcG9zaXRpb24gPSBvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnID8geCA6IHk7XG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLnNjcmVlblNjYWxlLmludmVydChwb3NpdGlvbik7XG5cbiAgICB0aGlzLl91cGRhdGVWYWx1ZSh2YWx1ZSk7XG4gIH1cblxuICBfcmVuZGVyKGNsaXBwZWRWYWx1ZSkge1xuICAgIGNvbnN0IHsgYmFja2dyb3VuZENvbG9yLCBmb3JlZ3JvdW5kQ29sb3IsIG9yaWVudGF0aW9uIH0gPSB0aGlzLnBhcmFtcztcbiAgICBjb25zdCBjYW52YXNQb3NpdGlvbiA9IE1hdGgucm91bmQodGhpcy5jYW52YXNTY2FsZShjbGlwcGVkVmFsdWUpKTtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMuX2NhbnZhc1dpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuX2NhbnZhc0hlaWdodDtcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgIC8vIGJhY2tncm91bmRcbiAgICBjdHguZmlsbFN0eWxlID0gYmFja2dyb3VuZENvbG9yO1xuICAgIGN0eC5maWxsUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgIC8vIGZvcmVncm91bmRcbiAgICBjdHguZmlsbFN0eWxlID0gZm9yZWdyb3VuZENvbG9yO1xuXG4gICAgaWYgKG9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcpXG4gICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzUG9zaXRpb24sIGhlaWdodCk7XG4gICAgZWxzZVxuICAgICAgY3R4LmZpbGxSZWN0KDAsIGNhbnZhc1Bvc2l0aW9uLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgIC8vIG1hcmtlcnNcbiAgICBjb25zdCBtYXJrZXJzID0gdGhpcy5wYXJhbXMubWFya2VycztcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbWFya2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgbWFya2VyID0gbWFya2Vyc1tpXTtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5jYW52YXNTY2FsZShtYXJrZXIpO1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gJ3JnYmEoMjU1LCAyNTUsIDI1NSwgMC43KSc7XG4gICAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgIGN0eC5tb3ZlVG8ocG9zaXRpb24gLSAwLjUsIDEpO1xuICAgICAgICBjdHgubGluZVRvKHBvc2l0aW9uIC0gMC41LCBoZWlnaHQgLSAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN0eC5tb3ZlVG8oMSwgaGVpZ2h0IC0gcG9zaXRpb24gKyAwLjUpO1xuICAgICAgICBjdHgubGluZVRvKHdpZHRoIC0gMSwgaGVpZ2h0IC0gcG9zaXRpb24gKyAwLjUpO1xuICAgICAgfVxuXG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIG1vZGVcbiAgICBpZiAodGhpcy5wYXJhbXMubW9kZSA9PT0gJ2hhbmRsZScgJiYgdGhpcy5wYXJhbXMuc2hvd0hhbmRsZSkge1xuICAgICAgY29uc3QgZGVsdGEgPSB0aGlzLnBhcmFtcy5oYW5kbGVTaXplICogdGhpcy5fcGl4ZWxSYXRpbyAvIDI7XG4gICAgICBjb25zdCBzdGFydCA9IGNhbnZhc1Bvc2l0aW9uIC0gZGVsdGE7XG4gICAgICBjb25zdCBlbmQgPSBjYW52YXNQb3NpdGlvbiArIGRlbHRhO1xuXG4gICAgICBjdHguZ2xvYmFsQWxwaGEgPSAxO1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMucGFyYW1zLmhhbmRsZUNvbG9yO1xuXG4gICAgICBpZiAob3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICBjdHguZmlsbFJlY3Qoc3RhcnQsIDAsIGVuZCAtIHN0YXJ0LCBoZWlnaHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3R4LmZpbGxSZWN0KDAsIHN0YXJ0LCB3aWR0aCwgZW5kIC0gc3RhcnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2xpZGVyO1xuIl19