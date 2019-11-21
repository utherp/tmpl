//var $ = require('jquery'); //'../../bower_components/jquery/dist/jquery';
var $ = require('jquery-easing');

import BXTable from '../../bower_components/bluemix-components/consumables/js/es2015/table';

export default class Table extends BXTable {

  static validOptions() { return {
    'selectorTitle':          { type: 'string', desc: "The CSS selector to find column titles." },
    'selectorRow':            { type: 'string', desc: "The CSS selector to find rows." },
    'selectorCheckbox':       { type: 'string', desc: "The CSS selector to find check boxes." },
    'selectorRecord':         { type: 'string', desc: "The selector pattern for finding the rows." },
    'selectorHeader':         { type: 'string', desc: "The selector pattern for finding the header cells (defining the columns)." },

    'addRecordsBefore':       { type: 'string', desc: 'If specified, the selector is uesd to find the row which all records will be inserted *before*' },
    'addRecordsAfter':        { type: 'string', desc: 'If specified, the selector is used to find the row which all records will be inserted *after*' },
        // NOTE: if neither are specified, the records are appended to the tbody

    'classSortState':         { type: 'string', desc: "The CSS class for the sorting state." },
    'classCheckState':        { type: 'string', desc: "The CSS class for the checked state." },

    'eventBeforeSortToggled': { type: 'string', desc: "The name of the custom event fired before a column's sorting is toggled." },
    'eventAfterSortToggled':  { type: 'string', desc: "The name of the custom event fired after a column's sorting is toggled." },
    'eventBeforeCheckToggled':{ type: 'string', desc: "The name of the custom event fired before a check box is toggled." },
    'eventAfterCheckToggled': { type: 'string', desc: "The name of the custom event fired after a check box is toggled." },

    'sourceForm':             { type: 'string', desc: "The ID of the form element which returns the data for this table." },

    'headerFieldAttribute':   { type: 'string', desc: "The attribute name for table headers which signifies the field name" },
    'headerIdFieldAttribute': { type: 'string', desc: "The attribute name for table headers which signifies the field is the primary identifier" },

    'recordIdAttribute':      { type: 'string', desc: "The attribute name for table rows which contains the record's id" },
    'recordTemplate':         { type: 'string', desc: "The template name for new rows" },

    'rmDelay':  { type: 'number', desc: 'Microseconds for removal transistion' },
    'rmDelayFade':  { type: 'number', desc: 'Microseconds for removal fade transistion' },
    'rmEasing':  { type: 'string', desc: 'Easing function for removal' },

    'addDelay':  { type: 'number', desc: 'Microseconds for adding transistion' },
    'addDelayFade':  { type: 'number', desc: 'Microseconds for adding transistion' },
    'addEasing':  { type: 'string', desc: 'Easing function for adding records' }

  }; }

  /**
   * Data table.
   * @implements Component
   * @param {HTMLElement} element The element working as a data table.
   * @param {Object} [options] The component options.
   * @param {string} [options.selectorTitle] The CSS selector to find column titles.
   * @param {string} [options.selectorRow] The CSS selector to find rows.
   * @param {string} [options.selectorCheckbox] The CSS selector to find check boxes.
   * @param {string} [options.classSortState] The CSS class for the sorting state.
   * @param {string} [options.classCheckState] The CSS class for the checked state.
   * @param {string} [options.eventBeforeSortToggled] The name of the custom event fired before a column's sorting is toggled.
   * @param {string} [options.eventAfterSortToggled] The name of the custom event fired after a column's sorting is toggled.
   * @param {string} [options.eventBeforeCheckToggled] The name of the custom event fired before a check box is toggled.
   * @param {string} [options.eventAfterCheckToggled] The name of the custom event fired after a check box is toggled.
   */

/****************************************/

  constructor(element, options = {}) {
    super(element, options);

    this.__init_options();

    this.element.populate = this.populate.bind(this);
    this.element.clear = this.clear.bind(this);
  }

/****************************************/

  __init_options() {
    this.options = Table.__defaults(this.options || {});
    this.options.actions = Table.__default_actions(this.options.actions || {});

    [...Object.keys(this.options.actions)].forEach((n) => (this[n] = function() { this.__action(n, ...arguments); }));

    return this.options;
  }

/****************************************/

  static __defaults(opts) {
    if (!opts) opts = {};
    return Object.assign(this._defaults, opts || {});
  }

/****************************************/

  static __default_actions(actions) {
    if (!actions) actions = {};

    [...Object.keys(this._actions)].forEach((n) => {
      var act = actions[n] || {};
      if (act instanceof Function)
        act = { proc: act };
      act.events = Object.assign(this._actions[n].events, act.events || {});
      actions[n] = Object.assign(this._actions[n], act);
      return;
    });
    return actions;
  }

/****************************************/

  _discoverModel() {
    var fields = this._fields = [], self = this;
    [...this.element.querySelectorAll(this.options.headerSelector)].forEach((item) => {
        fields[item.cellIndex] = item.getAttribute(self.options.headerFieldAttribute);
        if (item.hasAttribute(self.options.headerIdFieldAttribute))
            self._idField = fields[item.cellIndex];
    });
    if (!this._idField) this._idField = 'id';
  }

/****************************************/

  __check_height(cb) {
    var callback = cb || (() => (false));
    if (this.__recHeight) return callback();
    this.__newRecord(
      { source: "Nothing", title: "Nothing", description: "Nothing,Nothing,Nothing,Nothing,Nothing,Nothing,Nothing,Nothing,Nothing,Nothing,Nothing", link: "", creation_date: "88/88/8888", last_updated: "88/88/8888", more_link: "" },
      { class: 'invisible', id: '__table_probe__'}
    );
    setTimeout(() => {
      var row = this.element.querySelector('#__table_probe__');
      this.__recHeight = $(row).height();
      row.parentNode.removeChild(row);
      callback();
    }, 2);
  }

/****************************************/

  __action(t, d, cb) {
    var callback = cb || (()=>(false)), data = d, type = t;
    if ((undefined == cb) && (d instanceof Function)) {
      data = undefined;
      callback = d;
    }
    if (!this.__recHeight) return this.__check_height(this.__action.bind(this, type, data, callback));

    var action= this.options.actions[type];
    if (!action) return callback();

    if (!this._idField) this._discoverModel();

    if (this.__changing) {
      this.__delayScale /= 1;
      if ((this.__changing !== type) && !action.events.__bound) {
        this.element.addEventListener(action.events.trigger, () => {
          if (!action.events.__bound) return;
          action.events.__bound = false;
          this.__action(type, data, callback);
        }, { once: true });
        action.events.__bound = true;
      }
      return;
    }

    action.events.__bound = false;

    return action.proc(this, data, () => {
      this.__changing = type;
      this.__delayScale = 1;
      return setTimeout(() => { 
        return action.effect(this, [...this.element.querySelectorAll(this.options.selectorRecord)], () => {
          this.__changing = false;
          this.element.dispatchEvent(new CustomEvent(action.events.emit, { detail: this }));
          callback();
        });
      }, 10);
    });
  }

/****************************************/

  markup(str, rec) {
    var expr = /\$(?:\{([^\}]*)\}|(_))/g,
        out = '', match, last = 0, hit = false;

    while ((match = expr.exec(str))) {
        var value = false;
        out += str.substring(last, match.index);

        value = match[1] ? rec[match[1]] : '';

        if (value) out += value;
        hit = true;
        last = match.index + match[0].length;
    }

    out += str.substring(last);

    return hit ? this.markup(out, rec) : out;
  }

/****************************************/

  __newRecord(rec, attrs, css) {
    var tmpl = this.markup(this.options.recordTemplate, rec),
        elem = document.createElement(tmpl);

    for (var i in rec) elem.setAttribute('data-' + i, rec[i]);

    if (attrs instanceof Object)
      for (var i in attrs) elem.setAttribute(i, attrs[i]);

    if (css instanceof Object)
      $(elem).css(css);

    this.addRecord(elem);
  }

/****************************************/

  addRecord(rec) {
    var elem;

    if (this.options.addRecordsBefore) {
      elem = this.element.querySelector(this.options.addRecordsBefore);
      if (elem) {
        elem.parentNode.insertBefore(rec, elem);
        return;
      }
    }

    if (this.options.addRecordsAfter) {
      elem = this.element.querySelector(this.options.addRecordsAfter);
      if (elem) {
        if (elem.nextSibling) {
          elem.parentNode.insertBefore(rec, elem);
        } else {
          elem.parentNode.appendChild(rec);
        }
        return;
      }
    }

    this.element.querySelector('tbody').appendChild(rec);

    return;
  }

/********************************************************************************/

  release() {
    this.constructor.components.delete(this.element);
  }
}

/**
 * The component options.
 * @member {Object} Table#options
 * @property {string} [selectorTitle] The CSS selector to find column titles.
 * @property {string} [selectorRow] The CSS selector to find rows.
 * @property {string} [selectorCheckbox] The CSS selector to find check boxes.
 * @property {string} [classSortState] The CSS class for the sorting state.
 * @property {string} [classCheckState] The CSS class for the checked state.
 * @property {string} [eventBeforeSortToggled] The name of the custom event fired before a column's sorting is toggled.
 * @property {string} [eventAfterSortToggled] The name of the custom event fired after a column's sorting is toggled.
 * @property {string} [eventBeforeCheckToggled] The name of the custom event fired before a check box is toggled.
 * @property {string} [eventAfterCheckToggled] The name of the custom event fired after a check box is toggled.
 */

/**
 * The map associating DOM element and data table instance.
 * @type {WeakMap}
 */

/********************************************************************************/

Table.components = BXTable.components;

/********************************************************************************/

Table._defaults = {
  selectorRecord: 'record',
  selectorHeader: '[bx\\:tmpl="th"]',
  addRecordsBefore: false,
  addRecordsAfter: false,
  headerFieldAttribute: 'bx:field',
  headerIdFieldAttribute: 'bx:idField',
  recordIdAttribute: 'bx:recordId',
  recordTemplate: 'bx:recordrow',

  rmDelay: 350,
  rmDelayFade: 200,
  rmEasing: 'easeOutCubic',

  addDelay: 400,
  addDelayFade: 300,
  addEasing: 'easeInCubic',
};

/********************************************************************************/

Table._actions= {

  /************************************************************************/

  clear: {

    /****************************************************************/

    events: {
      trigger: 'populated',
      emit: 'cleared'
    },

    /****************************************************************/

    proc: function (tbl, data, cb) { 
      return cb();
    },

    /****************************************************************/

    effect: function (tbl, ref, cb) { 
      var list = ref, callback = cb, 
      __rem = function () {

        var item = list.pop();
        if (!item) {
//          if (callback instanceof Function) callback();
          return true;
        }

        var count = list.length, delay = {
          full: this.options.rmDelay * this.__delayScale,
          fade: this.options.rmDelayFade * this.__delayScale,
          shrink: 0
        };
        delay.shrink = delay.full - delay.fade;

        $(item).animate({ opacity: 0 }, { duration: delay.fade, easing: this.options.rmEasing })
          .animate({ height: '0px' }, { duration: delay.shrink, easing: this.options.rmEasing, 
            complete: function () { 
              if (this.parentNode) this.parentNode.removeChild(this); 
              if (!count && (callback instanceof Function)) callback();
            } 
          });

        setTimeout(__rem, delay.full / 2);

      }.bind(tbl);

      if (list.length) return __rem();
      if (callback instanceof Function) callback();
    }
  },

  /************************************************************************/

  populate: {

    /****************************************************************/

    events: {
      trigger: 'cleared',
      emit: 'populated'
    },

    /****************************************************************/

    proc: function (tbl, data, cb) {
      data.forEach((rec) => (tbl.__newRecord(rec, { style: 'opacity: 0; height: 0px' })));
      setTimeout(cb, 10);
    },

    /****************************************************************/

    effect: function (tbl, ref, cb) {
      var list = ref, callback = cb,
      __add = function() {

        var item = list.shift();
        if (!item) {
          if (callback instanceof Function) callback();
          return true;
        }

        var delay = {
          full: this.options.addDelay * this.__delayScale,
          fade: this.options.addDelayFade * this.__delayScale,
          shrink: 0
        };
        delay.shrink = delay.full - delay.fade;

        $(item)
          .animate({ height: this.__recHeight }, { duration: delay.shrink, easing: this.options.addEasing })
          .animate({ opacity: 1 }, { duration: delay.fade, easing: this.options.addEasing, 
            complete: function () { 
              $(this).attr('style', null);  
            } 
          });

        setTimeout(__add, delay.full / 2);

      }.bind(tbl);
      return __add();
    }
  }

  /**********************************************************************/

};

