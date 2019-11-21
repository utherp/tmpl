import eventMatches from '../../bower_components/bluemix-components/consumables/js/polyfills/event-matches';
import '../../bower_components/bluemix-components/consumables/js/polyfills/object-assign';
import on from '../../bower_components/bluemix-components/consumables/js/misc/on';

export default class TableRow {
  static validOptions() { return {
    cellPattern: { type: 'string', desc: 'The selector pattern for finding the cells' },
    cellFieldAttribute: { type: 'string', desc: 'The attribute name containing the field name' }
  }; }

  static create(element, options) {
    return this.components.get(element) || new this(element, options);
  }

  static init(target = document, options) {
    if (target.nodeType !== Node.ELEMENT_NODE && target.nodeType !== Node.DOCUMENT_NODE) {
      throw new Error('DOM document or DOM element should be given to search for and initialize this widget.');
    }
    if (target.nodeType === Node.ELEMENT_NODE && target.dataset.tablerow !== undefined) {
      this.create(target, options);
    }
  }

  constructor(element, options = {}) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      throw new TypeError('DOM element should be given to initialize this widget.');
    }
    this.element = element;
    this.options = Object.assign({
        cellPattern: '[bx\\:tmpl="td"]',
        cellFieldAttribute: 'bx:field'
    }, options);

    this.constructor.components.set(this.element, this);
    this.element.populate = this.populate.bind(this);
  }


  populate(data) {
    this._data = data;
    var children = {}, self = this;
    [...this.element.querySelectorAll(this.options.cellSelector)].forEach((item) => (children[item.getAttribute(self.options.cellFieldAttribute)] = item));

    for (var name in children)
        children[name].populate(data[name]);
  }
}

TableRow.components = new WeakMap();
