import $ from "../bower_components/jquery/dist/jquery";
import Resolver from './resolver';

/********************************************************************************\
\********************************************************************************/

function ObjDataWrapper (obj) {
    this._obj = obj;
}

ObjDataWrapper.prototype = {
    data: function (n, v) { 
        if (v !== undefined) obj[n] = v; 
        else if (v === null) delete obj[n]; 
        return obj[n]; 
    },
    find: function (sel) {
        var stack = sel.replace(/[^a-zA-Z_\.\: -]/g, '').split('.');
        var obj = this._obj;
        while (stack.length && (obj[stack[0]] instanceof Object))
            obj = obj[stack.shift()];
        return obj[stack[0]];
    },
    attr: function (name) {
        return this._obj[name];
    },
    children: () => ($('<a />')),
    closest: () => ($('<a />')),
};

/********************************************************************************\
\********************************************************************************/

var Stack = function (stacks, scope) {
  if (stacks instanceof Stack) {
    this.parent = stacks;
    stacks = [];
  }
  this._stack = stacks;
  this.depth = stacks.length;
  this.index = this.depth - 1;
  this.current = this._stack[this.index];
  this._matched = false;

  this.scope = (scope instanceof Object) ? scope : { name: scope };

  return;
};

/********************************************************************************/

Stack.prototype = {

  /****************************************/

  copy_up: function () {
    return this._stack.slice(0, this.index);
  },

  /****************************************\
   * __each: Search for all stack variables
   *         using the names in 'list',
   *         calling the function specified
   *         by 'how'.
   *
   *  list:  if list is an object, then all
   *         of its keys are searched, if
   *         its an array, then all of its
   *         values are searched.
   *
   *  returns: an object of all the variables
   *           that were found
   */
  __each: function (list, how) {
    if (!(list instanceof Array)) list = Object.keys(list);

    var values = {};
    list.forEach((name) => {
      var val = this[how](name);
      if (val) values[name] = val;
    });

    return values;
  },

  /****************************************\
   * any: search for a variable in the stack
   *      first checking datasets, then for
   *      an attribute.
   *
   * name: a string of the variable name
   *
   * returns: the value or undefined
   */
  any: function (name) {
    if (name instanceof Object) return this.__each(name, 'any');
    var value = undefined, c = -1;
    this.__noclimb = true;
    do {
      c++;
      if (undefined !== (value = this.data(name))) break;
      if (undefined !== (value = this.attr(name))) break;
    } while (this.climb());

    if (undefined !== value) this._matched = this.current;
    
    while (c--) this.dive();

    this.__noclimb = false;

    return value;
  },

  /****************************************/

  data: function (name) { 
    var value = undefined, i;
    if (this.__noclimb) return this.current.data(name) || (this.current.get(0).dataset ? this.current.get(0).dataset[name] : undefined);

    for (i = this.index; i >= 0; i--) {
      if (undefined !== (value = this._stack[i].data(name))) break;
      if (undefined !== (value = this._stack[i].get(0).dataset[name])) break;
    }
    if (undefined !== value) this._matched = this._stack[i];
    return value;
  },

  /****************************************/

  attr: function (name, def) {
    var searching, value;
    this._matched = false;

    do {
      if ((value = (searching = this.current).attr(name))) break;
      if ((value = (searching = this.current.children()).attr(name))) break;
//          if ((value = (searching = this.current.closest('[' + name.replace(/:/g, '\\:') + ']')).attr(name))) break;

      if (this.__noclimb || !this.climb()) return def;
      value = this.attr(name, def);
      this.dive();
      return value;

    } while (false);

    this._matched = searching;
    return value;
  },

  /****************************************/

  find: function (pattern) {
    var i = this.index, val, cur = this.current;
    if (this.__noclimb) return this.current.find(pattern);

    do {
      val = this._stack[i].find(pattern);
    } while (!val && (this._stack[--i]));

    if (val.jquery && !val.length) val = false;
    this._matched = val ? this._stack[i] : false;
    return val;
  },

  /****************************************/

  dive: function (elem, ctx) {
    if (elem) this.push(elem, ctx);
    if (!this._stack[++this.index])
      this.index--;
    return this.current = this._stack[this.index];
  },

  /****************************************/

  climb: function () {
    if (!this.index) return false
    return this.current = this._stack[--this.index];
  },

  /****************************************/

  moveTo: function (idx) {
    while (this.index < idx) this.dive();
    while (this.index > idx) this.climb();
  },

  /****************************************/

  push: function (elem, ctx) { 
    if (!(elem.closest instanceof Function)) {
      if (elem.nodeName) elem = $(elem);
      else elem = new ObjDataWrapper(elem);
    }

    this._stack.push(elem); 
    ctx = ctx || elem;
    if (!ctx.jquery) ctx = $(ctx);
    if (!ctx.get(0) || !ctx.get(0).nodeName) return;
    $(ctx).attr('tmpl-stack', '-').data('bx-tmpl-stack', [...this._stack]);
    return;
  },

  /****************************************/

  pop: function () {
    if (!this._stack.length) return false;
    var elem = this._stack.pop();
    if (this.index >= (this._stack.length)) {
      this.index = this._stack.length - 1;
      this.current = this._stack[this.index];
    }
    return elem;
  },

  /***************************************************
   * resolve:  using the variable spec, returns the 
   *           value of the variable, or undefined.
   *
   *           unlike the other functions, this is the
   *           only one that will traverse to it's parent
   *           stack searching for the variable.
   *
   * spec: The variable specification.  See Resolver
   *       for more details.
   */
  resolve: function (spec) {
    var value, within;

    if (!(spec instanceof Resolver))
      spec = new Resolver(spec);

    if (!spec.type) spec.type = 'any';
    else if (!(this[spec.type] instanceof Function)) return undefined;

    within = spec.within(this.scope);
    
    // we are not within the resolver spec and/or there is no more climbing
    if (undefined === within) return undefined;

    if (within) {
      // our scope is within the resolver spec
      value = this[spec.type](spec.name);
      if (value) return value;
    }

    return this.parent ? this.parent.resolve(spec) : undefined;
  },

};

export default Stack;

