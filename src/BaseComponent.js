
class BaseComponent {
  constructor(options) {

  }

  // base components
  get value() {
    throw new Error('not implemented');
  }

  set value(val) {
    throw new Error('not implemented');
  }

  setParameter(name, value) {
    // ...
  }

  reset() {
    throw new Error('not implemented');
  }

  resize(width, height) {
    throw new Error('not implemented');
  }
}

export default BaseComponent;
