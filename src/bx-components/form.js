import eventMatches from '../../bower_components/bluemix-components/consumables/js/polyfills/event-matches';
import '../../bower_components/bluemix-components/consumables/js/polyfills/object-assign';
import on from '../../bower_components/bluemix-components/consumables/js/misc/on';
import $ from "../../bower_components/jquery/dist/jquery";

export default class Form {
  static validOptions() { return {
    // return option map here
    resultDataPath: { type: 'string', desc: 'An object-type path to the data in the response (i.e.  results.data)' },
    targetTableId:  { type: 'string', desc: 'The target data table id' },
    method: { type: 'string', desc: 'The submit method' },
    action: { type: 'string', desc: 'The submit url' },
    paginationId: { type: 'string', desc: 'The ID of the pagination element' },
    pageDataEvent: { type: 'string', desc: 'Event name to dispatch for the pagination data' },
    loadingClass: { type: 'string', desc: 'Classname to add while loading' },
    loadedClass: { type: 'string', desc: 'Classname to add after load' },
    loadingEvent: { type: 'string', desc: 'Event name to dispatch before loading' },
    loadedEvent: { type: 'string', desc: 'Event name to dispatch after load' }
  }; }

  static create(element, options) {
    return this.components.get(element) || new this(element, options);
  }

  static init(target = document, options) {
    if (target.nodeType !== Node.ELEMENT_NODE && target.nodeType !== Node.DOCUMENT_NODE) {
      throw new Error('DOM document or DOM element should be given to search for and initialize this widget.');
    }
    if (target.nodeType === Node.ELEMENT_NODE && target.dataset.form !== undefined) {
      this.create(target, options);
    } 
  }

/********************************************************************************/

  constructor(element, options = {}) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
      throw new TypeError('DOM element should be given to initialize this widget.');
    }
    this.element = element;
    this.options = Object.assign({
        resultDataPath: 'results',
        targetTableId:  'dataTable',
        method: 'POST',
        paginationId: 'pagination',
        pageDataEvent: 'pagedata',
        loadingClass: 'loading',
        loadingEvent: 'loading',
        loadedClass: 'loaded',
        loadedEvent: 'loaded'
        // option map here
    }, options);

    this.constructor.components.set(this.element, this);
    this.element.addEventListener('submit', (event) => this.submit(event));

    this.__pageData = {};
    this.__currentKey = -1;

    window.addEventListener('popstate', this.__fetch.bind(this));
    this.__submit = this.element.submit.bind(this.element);;
    this.element.submit = this.submit.bind(this);
  }

/********************************************************************************/

  setView(view) { this.view = view; }
  setPagination(pagination) { this.pagination = pagination; }

/********************************************************************************/

  getView() { 
    if (this.view) return this.view;
    return this.view = document.getElementById(this.options.targetTableId);
  }

  getPagination() {
    if (this.pagination) return this.pagination;
    return this.pagination = document.getElementById(this.options.paginationId);
  }

/********************************************************************************/

  getUrl() {
    return this.action || this.element.getAttribute('action');
  }

/********************************************************************************/

  static __make_key(values) { return values.query; }

/********************************************************************************/

  submit(event) {
    var values = {}, view = this.getView(), key;

    if (!view) return this.__submit(...arguments);

    [...this.element.elements].forEach((item) => {
        switch (item.type) {
          case ('checkbox'): 
            if (item.checked && !item.disabled) values[item.name] = item.value;
            break;
          default:
            if (!item.disabled) values[item.name] = item.value;
        }
    });

    if (event) event.preventDefault(true);

    return this.__fetch(values);

  }

/********************************************************************************/

  __modClass(act, cls) {
    var page = this.getPagination(), view = this.getView();
    this.element.classList[act](cls);
    if (page) page.classList[act](cls);
    if (view) view.classList[act](cls);
  }

/********************************************************************************/

  __fetch(values) {

    var key = false, page;

    if (values instanceof Event) {
      if (!(values.state instanceof Object) || !values.state.__formData__ || !values.state.key) return false;
      key = values.state.key;
      page = values.state.page;
      values = values.state.values;

      // set inputs to state of load
      [...this.element.elements].forEach((item) => {
        if (!item.disabled && (values[item.name] !== item.value))
          item.value = values[item.name];
      });

    } else {
      key = Form.__make_key(values);
      page = values.page;
    }

//    if (page && (key === this.__currentKey) && (this.__pageData[page]))

    if (this.__currentKey !== key) {
      //clear cache
      if (this.__currentKey !== -1)
        values.page = page = 1;
      this.__currentKey = key;
      this.__pageData = {};
    } else if (this.__currentPage === page)
      // same key, same page...
      return;

    var view = this.getView();

    this.__currentPage = page;
    if (this.__pageData[page]) {
      if (!view) return;
      view.clear(this.__fill.bind(this, ...this.__pageData[page]));
      return;
    }

    this.__modClass('add', this.options.loadingClass);
    if (view) view.clear();
    
    this.element.dispatchEvent(new CustomEvent(this.options.loadingEvent.toLowerCase(), { detail: this }));

    $.ajax(this.options.action, {
        data: values,
        method: this.options.method,
        dataType: 'json',
        error: this.__error.bind(this),
        success: this.__load.bind(this, values)
    });

    return true;
  }

/********************************************************************************/

  __error(xhr, stat, err) {
    console.log('NOTICE: Unable to complete form submition to "' + this.element.getAttribute('action') + '": ' + err, xhr, stat);
  }

/********************************************************************************/

  __load(values, data, stat, xhr) {
    /** History push state handler **/
    var recs, key, tmp = data, res_path = this.options.resultDataPath.split('.'), last = res_path.pop();

    res_path.forEach((i) => (tmp = (tmp[i] ? tmp[i] : tmp)));
    recs = tmp[last];
    delete tmp[last];

    key = Form.__make_key(values);
    this.__currentKey = key;
    this.__pageData[values.page] = [data, recs];

    var uri = '?';
    [...Object.keys(values)].forEach((n) => (uri += '&' + n + '=' + encodeURIComponent(values[n])));

    /** push state into history object for caching (handled above) **/
    window.history.pushState({
      __formData__: true,
      values: values,
      key: key,
      page: values.page
    }, '', window.location.pathname + uri);

    this.element.dispatchEvent(new CustomEvent(this.options.loadedEvent.toLowerCase(), { detail: { form: this, data: values } }));

    return this.__fill(data, recs);
  }

/********************************************************************************/

  __fill(data, records) {

    this.__modClass('remove', this.options.loadingClass);
    this.__modClass('add', this.options.loadedClass);

    var pagination = this.getPagination(), view = this.getView();

    if (pagination) pagination.dispatchEvent(
      new CustomEvent(this.options.pageDataEvent.toLowerCase(), { detail: {
        start: data.start,
        end: data.start + data.count - 1,
        total: data.total,
        pageCount: Math.ceil(data.total / data.count),
        page: parseInt(data.page)
      }})
    );

    if (view) view.populate(records);

  }

/********************************************************************************/

  release() {
    this.constructor.components.delete(this.element);
  }
}

/**
 * The map associating DOM element and data table instance.
 * @type {WeakMap}
 */
Form.components = new WeakMap();
