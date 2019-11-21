/********************************************************************************\
 * Resolver:  
 *    The prototype parses a variable scope specifier.  After which,
 *    the prototype function 'within' can be called, passing a scope.
 *    A scope is an object whos properties are values to check supported
 *    scope specification against.  Currently these are only 'name' and 'id'.
 *
 *    Additionally, if the scope specifies a level count (^n), calls to 'within'
 *    keep track of the scopes against which it'd been checked... when that 
 *    count exceeds the level count, undefined is always returned, indicating 
 *    that no more climbing is possible.
 *
 * the spec is as follows:
 *
 *  [type:]name[@[(#id | called)][^levels]]
 *
 * type: what type of data:
 *    attr:  tag attribute
 *    data:  datapoint
 *    prop:  object property
 *     any:  first found (order: prop, attr, data) [default]
 *
 * name: the variable name
 *
 * #id: the id of the instance
 *  - or -
 * called: the name of the instance's template
 *
 * ^levels: the maximum number of levels to climb looking for the variable.
 *
 * examples:
 *    name:  any variable matching 'name'.  by default, only one stack is checked.
 *
 *    attr:name:  an 'attribute' matching 'name'
 *
 *    name@table:  any variable matching 'name' from a template called 'table'
 *
 *    prop:name@#mytable:  a property matching 'name' from an instance with the id 'mytable'
 *
 *    data:name@^5: a dataset matching 'name' from the first instance that has it, search
 *                  up to 5 stack levels.
 *
 *    name@*: any variable matching 'name', any number of stack levels up.
 *
 */

var Resolver = function (spec, scope) {
  if (spec instanceof Resolver) return spec.within(scope);

  this.__map = new WeakMap([]);
  this._parse(spec);
  return;
}

Resolver.prototype = {
  name: '',       // the name of the value we're resolving
  type: 'any',    // the type of the value we're resolving
  _use: false,    // false to use levels, otherwise it is the prop name to check
  levels: 1,      // how many levels to climb 
  _idx: 0,        // the number of levels remaining to climb
  called: '',     // the scope specifier string, (value to check prop against)
  through: false, // whether to check *through* each level
  _spec: '',      // original spec

  /*********************************************************************************/

  within: function (scope) {
    if (!this._use) {
      if ((this.levels === -1) || this.__map.has(scope)) return true;
      if (this._idx === this.levels) return undefined;
      this.__map.set(scope, ++this._idx);
      return true;
    }

    if (this.__map.has(scope))
      return this.__map.get(scope); // will be true of false based on 'through' or matched

    // If levels is set then we've already reached 
    // the top.  If it wasn't in the map, then it 
    // doesn't match.  levels can be used to indicate
    // the depth at which the resolution ended
    //
    // return undefined to indicate that there is no further climbing
    if (this.levels) return undefined; 

    this._idx++;

    if (scope[this._use] === this.called) {
      this.levels = this._idx;
      this.__map.set(scope, true);
      return true;
    }

    this.__map.set(scope, this.through);

    return this.through;
  },

  /*********************************************************************************/

  _parse: function (spec) {
    this._spec = spec;
    this.name = spec;

    var tmp = spec.split(':', 2);
    if (tmp.length != 1) {
      this.type = tmp[0];
      this.name = spec = tmp[1];
    }

    var tmp = /[@~\^\*]/.exec(spec);

    if (!tmp) {
      this.through = true;
      this._use = false;
      this.levels = -1;
      return;
    }

    this.name = spec.substr(0, tmp.index);
    var how = spec[tmp.index];
    spec = spec.substr(tmp.index + 1);

    switch (how) {
      case ('~'): 
        this.levels = 1; 
        this._use = false;
        this.through = false;
      break;

      case ('*'): 
        this.levels = -1; 
        this._use = false;
        this.through = true; 
      break;

      case ('@'):
        this.levels = 0;
        if (spec[0] === '#') {
          spec = spec.substr(1);
          this._use = 'id';
        } else {
          this._use = 'name';
        }
        this.called = spec;
        this.through = false;
      break;

      case ('^'):
        this.through = true;
        this.levels = 0;

        if (!spec.length) {
          this._use = false;
          this.levels = 2;
          break;
        }
        
        if (!spec.match(/[^0-9]/)) {
          this._use = false;
          this.levels = parseInt(spec);
          break;
        }

        if (spec[0] === '#') {
          spec = spec.substr(1);
          this._use = 'id';
        } else {
          this._use = 'name';
        }

        this.called = spec;
      break;
    }
  }
  /*********************************************************************************/
};

export default Resolver;

