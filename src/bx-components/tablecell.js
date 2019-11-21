import eventMatches from '../../bower_components/bluemix-components/consumables/js/polyfills/event-matches';
import '../../bower_components/bluemix-components/consumables/js/polyfills/object-assign';
import on from '../../bower_components/bluemix-components/consumables/js/misc/on';


export default class TableCell {
  static validOptions() { return {
    targetSelector: { type: 'string', desc: "The selector pattern for the container of the cell value" },
    replaceTarget:  { type: 'boolean', desc: "True to replace the target with the value, or append" }
  }; }

  static create(element, options) {
    return this.components.get(element) || new this(element, options);
  }

  static init(target = document, options) {
    if (target.nodeType !== Node.ELEMENT_NODE && target.nodeType !== Node.DOCUMENT_NODE) {
      throw new Error('DOM document or DOM element should be given to search for and initialize this widget.');
    }
    if (target.nodeType === Node.ELEMENT_NODE && target.dataset.tablecell !== undefined) {
      this.create(target, options);
    } 
  }

  constructor(element, options = {}) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      throw new TypeError('DOM element should be given to initialize this widget.');
    }
    this.element = element;
    this.options = Object.assign({
        targetSelector: '[bx\\:cellTarget]',
        replaceTarget:  false
    }, options);

    this.constructor.components.set(this.element, this);
    this.element.populate = this.populate.bind(this);
  }


  populate(data) {
    this._data = data, self = this;
    var container = this.element.querySelector(this.options.targetSelector);
    if (!container) {
        console.log('NOTICE: could not find the data target with pattern "' + this.options.targetSelector + '"', data);
        container = this.element;
    }

    while(container.firstChild) container.removeChild(container.firstChild);
    container.appendChild(document.createTextNode(data));
  }

}

TableCell.components = new WeakMap();

