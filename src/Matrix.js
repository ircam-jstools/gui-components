import BaseComponent from './BaseComponent';


const ns = 'http://www.w3.org/2000/svg';


class Matrix extends BaseComponent {
  constructor(options) {
    super();

    const defaults = {
      callback: () => {},
      container: 'body',
      numCols: 4,
      numRows: 4,
      width: 400,
      height: 400,
      // trigger: 'touch', // 'aftertouch'
    }

    this.params = Object.assign({}, defaults, options);

    this._$svg = null;
    this._$cells = null;

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    this._createValue();
    this._createElement();
    this._render();
  }

  get values() {
    return this._values;
  }

  // set values(values) {
  //   this._values = values;

  //   this.params.callback(this._values);
  //   this._render();
  // }

  setValues(values, { silent = false } = {}) {
    this._values = values;

    if (silent === false) {
      this.params.callback(this._values);
    }

    this._render();
  }

  setCellValue(x, y, value, { silent = false } = {}) {
    this._values[x][y] = value;
    // dispatch value

    if (silent === false) {
      this.params.callback(this._values);
    }

    this._render();
  }

  toggleCell(x, y, { silent = false } = {}) {
    const value = this._values[x][y];
    this.setCellValue(x, y, 1 - value);
  }

  setParameter(name, value) {
    // ...
    if (this.params[name])
      this.params[name] = value;
  }

  reset() {
    const { numCols, numRows } = this.params;

    for (let x = 0; x < numCols; x++) {
      for (let y = 0; y < numRows; y++) {
        this._values[x][y] = 0;
      }
    }

    this.params.callback(this._values);
    this._render();
  }

  resize(width = null, height = null) {
    if (width !== null) {
      this.params.width = width;
    }

    if (height !== null) {
      this.params.height = height;
    }

    this._resizeElement();
  }

  _createValue() {
    const { numCols, numRows } = this.params;

    this._values = [];
    // define if row first or colFirst
    for (let x = 0; x < numCols; x++) {
      const col = [];

      for (let y = 0; y < numRows; y++) {
        col[y] = 0;
      }

      this._values[x] = col;
    }
  }

  _onMouseDown(e) {
    this._$svg.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);

    const $cell = e.target;
    const { x, y } = $cell.dataset;

    this.toggleCell(x, y);
    this._$lastCell = $cell;
  }

  _onMouseMove(e) {
    const $cell = e.target;

    if (this._$lastCell !== $cell) {
      const { x, y } = $cell.dataset;

      this.toggleCell(x, y);
      this._$lastCell = $cell;
    }

  }

  _onMouseUp() {
    this._$svg.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
  }

  _createElement() {
    const { container, numCols, numRows } = this.params;
    this._$svg = document.createElementNS(ns, 'svg');
    this._$svg.setAttributeNS(null, 'shape-rendering', 'optimizeSpeed');
    this._$svg.setAttribute('xmlns:xhtml', 'http://www.w3.org/1999/xhtml');

    this._$cells = [];

    for (let x = 0; x < numCols; x++) {
      const $coll = [];

      for (let y = 0; y < numRows; y++) {
        const $cell = document.createElementNS(ns, 'rect');
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

    let $container;
    if (container instanceof Element) {
      $container = container;
    } else {
      $container = document.querySelector(container);
    }

    $container.appendChild(this._$svg);

    this._$svg.addEventListener('mousedown', this._onMouseDown);
  }

  _resizeElement() {
    const { numCols, numRows, width, height } = this.params;

    this._$svg.style.width = `${width}px`;
    this._$svg.style.height = `${height}px`;

    const cellWidth = width / numCols;
    const cellHeight = height / numRows;

    for (let x = 0; x < numCols; x++) {
      for (let y = 0; y < numRows; y++) {
        const $cell = this._$cells[x][y];
        $cell.setAttribute('width', cellWidth);
        $cell.setAttribute('height', cellHeight);
        $cell.setAttribute('x', cellWidth * x);
        $cell.setAttribute('y', cellHeight * y);
      }
    }
  }

  _render() {
    const { numCols, numRows } = this.params;

    for (let x = 0; x < numCols; x++) {
      for (let y = 0; y < numRows; y++) {
        const $cell = this._$cells[x][y];
        const value = this._values[x][y];

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
}

export default Matrix;
