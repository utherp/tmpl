import * as BXComponents from "./bx-components"; //../bower_components/bluemix-components/consumables/js/es2015/index";
import $ from "../bower_components/jquery/dist/jquery";

import Stack from './stack';


(function (undefined, $, BXComp_init) {

    // just checking.... if we've already loaded the dev version, don't load again...
    // this is just a hack around having to rebuild all the scripts during dev.
    if (window.__TMPL_DEV) return;

    // the global prefix for all templates not scoped
    const gbl = 'bx';

    var __debug =
      (window.location && (window.location.search.indexOf('_debug=1') !== -1))
      ? console.debug
      : () => (false);

    /********************************************************************************\
     * This is the mapping of javascript prototypes which are controllers for the
     * templates.  Resolution of the prototype is as follows:
     * If the tag matches a property in bx_comp_map, then its value is used as
     * the key in BXComponents, otherwise the template name is used.  if this key
     * matches a property in BXComponents, then it is used for the controller, otherwise
     * a matching function is searched for in the global scope.  If none are found, the
     * template is still rendered, it will just not have a controller.
     *
     * If the controller function has a property that is a function called 'validOptions',
     * it is called and expected to return either an object whos key names are the option
     * names, or an array containing the option names.
     *
     * All the attributes are then checked on the root element and any attributes who's
     * name matches one of the option names are stored in an options object.
     *
     * If the controller function has a property that is a function called 'init', then
     * it is called, otherwise the function itself is called with the 'new' operator.
     *
     * Both are passed two arguments: the first is the root element, the second is
     * an object containing any options returned from validOptions, and matching
     * attributes on the root element.
     *
     * see: instantiate, _get_options and _get_prototype of Tmpl.prototype
     *
     */

    var BXComponents = BXComp_init, bx_comp_map = {};
    for (var i in BXComponents)
        bx_comp_map[i.toLowerCase()] = i;
    bx_comp_map['modalbutton'] = 'Modal';
    bx_comp_map['uploader'] = 'FileUploader';
    bx_comp_map['overflow'] = 'OverflowMenu';

    /********************************************************************************/

    window.$ = $;

    var root_index = { output: window.document.body };
    Object.defineProperties(root_index, {
      children: { enumerable: true, configurable: false, set: () => (false), get: () => (Tmpl.get.children(root_index)) },
      parent: { enumerable: true, configurable: false, set: () => (false), get: () => (false) }
    });

    /********************************************************************************\
     * queryTmpl(ident),
     *        $$(ident):  Search for a template instance with the given identity
     *
     *  ident: a space-delimited list of identifiers.  These operate very much like
     *         selectors.  There are currently only the two ways to identify an instance,
     *         A normal string is considered the name of the template (tag name), if
     *         the string is prefixed with #, then it is considered to be an id.
     *         currently, combinding the two does not work, perhaps in a later release
     *         if necessary.
     *
     * returns: either a single instance, an array of instances if multiple match, or false.
     *
     *
    \********************************************************************************/

    var $$ = window.queryTmpl = window.$$ = function (ident) {
      var refs = [ ((this instanceof Tmpl) ? this.output : root_index.output ) ],
        names = ident.split(' ');

      for (var i  = 0; i  < names.length; i++) {
        var n = names[i],
          pattern = (n[0] === '#') ? '[' + gbl + '\\:tmpl]' : '[' + gbl + '\\:tmpl="' + n + '"]',
          tmp = $(pattern, refs);

        if (!tmp || !tmp.length) return false;
        refs = tmp;
      }

      if (refs.length === 1) return Tmpl.get.tmpl(refs[0]);

      return new MatchWrapper(refs);
    };

    /********************************************************************************\
    \********************************************************************************/

    function MatchWrapper(matches) {
      this.items = [...matches].map((i) => (Tmpl.get.tmpl(i)));
    }

    MatchWrapper.prototype = {
      set: function (n, v) {
        this.items.forEach((i) => {if (i.hasOwnProperty(n)) i[n] = v;});
      },
      get: function (n) {
        var res = [];
        this.items.forEach((i) => (i.hasOwnProperty(n) && res.push(i[n])));
        return res;
      }
    }

    /********************************************************************************\
    \********************************************************************************/

    function Tmpl (input, output, dataStack) {

        if ((dataStack instanceof $.fn.init) && !dataStack.length) dataStack = undefined;
        this.templates = {};
        this.__local_tmpl = {};
        this._points ={};
        this.__selector = Tmpl.__selector;
        this.tmpl_name = output[0].getAttribute('name');
        this.input = $(input);
        this.input.data('templates', this.templates);
        dataStack = dataStack || [];
        if (!(dataStack instanceof Array)) dataStack = [dataStack];
        this.stack = new Stack(dataStack, {
           ref: this,
          name: this.tmpl_name,
            id: this.input[0].hasAttribute('id') ? this.input[0].getAttribute('id') : undefined
          })

        Object.defineProperties(this, {
          parent:   { configurable: false, enumerable: true, set: () => (false), get: () => (Tmpl.get.parent(this.output)) },
          children: { configurable: false, enumerable: true, set: () => (false), get: () => (Tmpl.get.children(this.output)) }
        });

        this.tmpl = output;
        this.output = $(output).children();

        this.input.data(gbl + '-tmpl', this);
        this.output.data(gbl + '-tmpl', this);
        this.output.attr(gbl + ':tmpl', this.tmpl.data(gbl + '-tmpl-name'));

        this.markup_tags();

        this.stack.dive(this.input, this.output);

        this.rendered = false;

        this.merge_targets();

        this.parse_templates();

        for (var i in this.input[0].dataset)
          this.output[0].dataset[i] = this.input[0].dataset[i];

        this.markup_attributes();

        this.copy_attributes();
        this.markup_events();
        this.setup_emitters();

        this.input.replaceWith(this.output);

        if (this.input[0].__points)
          this.input[0].__points.forEach((i) => ((i.elem = (i.elem === this.input[0]) ? this.output[0] : i.elem)));

        /* super special case! */
        if (this.output.get(0).nodeName == 'TABLE') {
            var tmp = this.output.find('thead');
            if (tmp.length > 1) tmp.first().remove();
            tmp = this.output.find('tbody');
            if (tmp.length > 1) tmp.first().remove();
            tmp = this.output.find('tfoot');
            if (tmp.length > 1) tmp.first().remove();

        }

        this.instantiate();
        this.rendered = true;
        this.init_embedded();

        this.find_anchors();
        this.find_maps();

        return;
    }

    /********************************************************************************\
    \********************************************************************************/

    Object.assign(Tmpl, {

      /******************************************************************/

      get_closest_stack: function (elem) {
        // get the closest stack and unshift it
        return $(elem).closest('[tmpl-stack]').data(gbl + '-tmpl-stack');
      },

      /******************************************************************/

      get_closest_tmpl: function (elem) {
        return Tmpl.get.tmpl($(elem).closest('[' + gbl + '\\:tmpl]'));
      },

      /******************************************************************/

      __selector: function () {
        var localName = (this.templates === Tmpl.templates) ? gbl : this.tmpl_name,
          str = Object.keys(this.templates).map((i)=>(localName + '\\:' + i)).join(',');

        if (this.templates !== Tmpl.templates) str = Tmpl.__selector() + (str ? (','+str) : '');
        return str;
      },

      /******************************************************************/

      is: {

        /******************************************************/

        tmpl: function (elem) {
          elem = $(elem);
          return !!elem.data(gbl + '-tmpl') || !!elem.attr(gbl + ':tmpl') || (elem.get(0).nodeName.substr(0, 3).toLowerCase() === gbl + ':');
        },

        /******************************************************/

        rendered: function (elem) {
          elem = $(elem);
          if (!this.tmpl(elem)) return false;
          var tmpl = elem.data(gbl + '-tmpl');
          return tmpl ? tmpl.rendered : false;
        },

        /******************************************************/

        child: function (elem) {
          for (var tmp = elem.parentNode; tmp; tmp = tmp.parentNode) {
            if (this.tmpl(tmp)) return true;
          }
          return false;
        }
      },

      /******************************************************************/

      get: {

        /******************************************************/

        tmpl: function (elem) {
          if (!elem && this.output) elem = this.output;
          var tmpl;
          $(elem).each((i,item) => (tmpl = tmpl || $(item).data(gbl + '-tmpl')));
          return tmpl;
        },

        /******************************************************/

        parent: function (elem, type) {
          if (!type && elem && !(elem instanceof Object)) return this.parent(false, elem);
          if (!elem && this.output) elem = this.output;
          elem = $(elem);
          var tmpl;
          do {
            elem = elem.parent().closest(type ? ('[' + gbl + '\\:tmpl="' + type + '"]') : '[' + gbl + '\\:tmpl]');
            if (elem && elem.length)
              elem.each((i,x) => (tmpl = tmpl || $(x).data(gbl + '-tmpl')));
          } while (!tmpl && elem && elem.length);
          return tmpl;
        },

        /******************************************************/

        children: function (elem, type) {
          if (!type && elem && !(elem instanceof Object)) return this.children(false, elem);
          if (!elem && this.output) elem = this.output;

          var tmpl = [];

          $(elem).find(type ? ('[' + gbl + '\\:tmpl="' + type + '"]') : '[' + gbl + '\\:tmpl]').each((i, x) => {
            x = $(x);
            if (!type && x.parent().closest('[' + gbl + '\\:tmpl]').not(elem).length) return;
            if ((x = x.data(gbl + '-tmpl'))) tmpl.push(x);
          });

          tmpl.forEach((i) => {
            if (!tmpl[i.tmpl_name]) {
              tmpl[i.tmpl_name] = i;
              return;
            }
            if (!(tmpl[i.tmpl_name] instanceof Array)) tmpl[i.tmpl_name] = [ tmpl[i.tmpl_name] ];
            tmpl[i.tmpl_name].push(i);
          });
          return tmpl;
        },

        /******************************************************/

        valuePoints: function (elem) {
          if (!elem && this.output) elem = this.output;
          var points = {};
          $(elem).find('[' + gbl + '\\:value]').add(gbl + '\\:value', elem).each((i, x) => {
            if ($(x).closest('[' + gbl + '\\:tmpl]').not(elem).length) return;
            if (x.nodeName.toLowerCase()  == gbl + ':value')
              points[x.getAttribute('name')] = x;
            else
              points[x.getAttribute(gbl + ':value')] = x;
          });
          return points;
        }
      },
    });

    /********************************************************************************\
    \********************************************************************************/

    Tmpl.prototype = {

      $$: $$,
      /******************************************************************/

      parse_templates: function () {
        var self = this;
        this.matching('template').each((i, item) => {
          var tmpl = this.matching('template', $(item).parent(), 'closest'); //.closest(gbl + '\\:template
          if (tmpl.length && (tmpl[0] !== self.output[0].parentElement)) return;
          self.__template(item);
        });

        this.matching('target').each((i, item) => {
          var scope_def = (item.nodeName.toLowerCase() === (self.tmpl_name + ':target')) ? self.tmpl_name : $(item).attr('scope');
          if (!scope_def || (scope_def !== self.tmpl_name)) {
            var tmpl = $(item).parent().closest(gbl + '\\:template');
            if (tmpl.length && (tmpl[0] !== self.output[0].parentElement)) return;
          }
          item.setAttribute('scope', 'local');
          var marker = $('<' + gbl + ':marker></' + gbl + ':marker>');
          marker.replaceAll(item).append(item);
          var builder = self.__template(item, item.getAttribute('name'));
          builder.__marker = marker;
          if (builder) self.__local_tmpl[builder.__name] = builder;
        });

      },

      /******************************************************************/

      instantiate: function () {
        var options, proto = this._get_prototype();
        if (!proto) return false;

        options = this._get_options(proto);
        if (!(options instanceof Object))
          options = options ? { value: options } : {};

        options.scope = this;

        this.output[0].__bxproto = proto;
        if (proto.init instanceof Function)
          proto.init(this.output[0], options);
        else if (proto instanceof Function)
          new proto(this.output[0], options);

        return;
      },

      /******************************************************************\
       * _get_options: calls to Stack.prototype.options for retrieving all
       *               options for the instance prototype.
       *
       *  proto: the instance function.
       *
       *  returns: an object containing all the valid options returned from
       *           proto.validOptions.  If validOptions is not a function,
       *           then a stack variable named 'options' is searched.  if
       *           found, and is a string, then it is parsed as JSON.  If
       *           parsing fails, then it is returned as-is.
       *
       *           if the parsed options attribute is an array, then each of
       *           its values are used as option names, and the corresponding
       *           option values are then search from the stack.
       */

      _get_options: function (proto) {
        var valid = false, opts;
        if ((proto instanceof Object) && (proto.validOptions instanceof Function)) {
          valid = proto.validOptions();
          if (!(valid instanceof Array) && (valid instanceof Object))
            valid = Object.keys(valid);
        } else {
          valid = this.any('options');
          if (!valid) return {};
          if (typeof(valid) === 'string') try {
            let tmp = JSON.parse(valid);
            valid = tmp;
          } catch (e) {
            return valid;
          }
          if (!(valid instanceof Array)) return valid;
        }

        if (!valid) return undefined;

        /* search for all valid option names in the stack...
         * as an attribute, dataset or object property
         */

        return this.stack.__each(valid, 'any');
      },

      /******************************************************************/

      _get_prototype: function () {
         // as an attribute?
        var init = this.input.attr(gbl + ':init');

        // from the tag name?
        if (!init) init = this.input.get(0).nodeName.substr(3).toLowerCase().replace('-', '');

        if (!init) return false;

        // do we have a special mapping for it?
        if (bx_comp_map[init]) init = bx_comp_map[init];

        if (BXComponents[init])
          return BXComponents[init];

        if (window[init] instanceof Function)
          return window[init];

        return false;
      },

      /******************************************************************/

      process_embedded: function (item) {
        var prev = $(item).parents(this.__selector()); //$(item).closest(gbl + '\\:tmpl');
        if (prev.length) {
          var tmpl = Tmpl.get.tmpl(prev);
          if (!tmpl || (tmpl !== this)) return; // there's a previous un-rendered template
        }
        process(item, this);
      },

      /******************************************************************/

      init_embedded: function () {
        var self = this, ifs = this.matching('if');
        ifs.each((i, item) => (this.process_embedded(item)));

        this.init_targets();

        this.output.find(this.__selector())
          .addBack(this.__selector())
          .each((i, item) => (this.process_embedded(item)));

      },

      /******************************************************************/

      init_targets: function () {
        var self = this;
        [...Object.keys(this.__local_tmpl)].forEach((name) => {
          var builder = this.__local_tmpl[name];
          self.input.find(builder.__name).each((i, item) => {
            var copy = $(item).clone(true);
            builder.__marker.append(copy);
            builder(copy, self.stack.copy_up());
          });

          builder.__marker.replaceWith(builder.__marker.children());
        });
      },

      /******************************************************************/

      markup_tags: function () {
        var localName = this.tmpl_name;
        this.matching('tag').each((i, elem) => {
          var out = document.createElement(elem.getAttribute('tag:name'));
          elem.removeAttribute('tag:name');
          while (elem.firstChild) out.appendChild(elem.firstChild);
          if (elem.attributes) {
            [...elem.attributes].forEach((attr) => {
              attr.ownerElement.removeAttributeNode(attr);
              out.attributes.setNamedItem(attr);
            });
          }
          elem.parentNode.replaceChild(out, elem);
        });

        this.output = this.tmpl.children();
      },

      /******************************************************************/

      find_anchors: function () {
        var self = this, maps = {}, depth = {}, local = {}, localName = this.tmpl_name;
        this.matching('attr:anchor').each((i, target) => {
          var jq = $(target), local = false, i,
          attr = jq.attr(gbl + ':anchor');
          if (!attr) {
            local = true;
            attr = jq.attr(localName + ':anchor');
          }

          for (i = 0; jq && !jq.is(this.output); i++, jq = jq.parent());
          if (depth[attr] && (depth[attr] < i)) return;
          maps[attr] = target;
          depth[attr] = i;
        });

        [...Object.keys(maps)].forEach((attr) => {
          var target = maps[attr],
          conf = Object.getOwnPropertyDescriptor(self, attr);
          if (conf && !conf.configurable) {
            __debug('cannot recreate anchor ' + attr);
            return;
          }

          Object.defineProperty(self, attr, { configurable: false, enumerable: true,
            set: () => (false),
            get: function (t) { return Tmpl.get.tmpl(t) || t; }.bind(self, target)
          });
        });
      },

      /******************************************************************/

      matching: function (str, from, how) { 
        var type = 'elem';

        if (str.indexOf(':') !== -1) {
          var tmp = str.split(':', 2);
          type = tmp[0];
          str = tmp[1];
        }
          
        var these = $(), matches = [
          `${this.tmpl_name}\\:${str}`,
          `${gbl}\\:${str}`
        ];

        if (type === 'attr') matches = matches.map((v) => ('[' + v + ']'));
        if (type === 'all') matches = [...matches, ...matches.map((v) => ('[' + v + ']'))];

        str = matches.join(',');        

        if ((typeof(from) === 'string') && (these[from] instanceof Function)) {
          how = from;
          from = false;
        }

        if (!how) how = 'find';

        if (from instanceof $.fn.init) from = [ from ];

        if (!(from instanceof Array)) {
          if (!from) from = 'output';
          switch (from) {
            case ('all'): from = [ this.output, this.input ]; break;
            case ('in'):
            case ('input'): from = [ this.input ]; break;
            default:
            case ('out'):
            case ('output'): from = [ this.output ]; break;
          }
        }

        from.forEach((f) => { 
          these = these.add(
            f[how](str)
              .addBack(str)
          ); 
        });

        return these;
      },

      /******************************************************************/

      find_maps: function () {
        var self = this, maps = {}, depth = {}, localName = this.tmpl_name;

        this.matching('attr:maps').each((i, target) => {

          var jq = $(target), scopes = {};
          if (target.hasAttribute(gbl + ':maps')) scopes[gbl] = true;
          if (target.hasAttribute(localName + ':maps')) scopes[localName] = true;

          [...target.attributes].forEach((attr) => {

            var name = attr.name.split(':'), scope, i;
            if (name.length == 1) return;

            scope = (name.length == 2) ? localName : name.shift();
            if (!scopes[scope]) return;
            if (name[0] !== 'map') return;
            name = name[1];

            for (i = 0; jq && !jq.is(self.output); i++, jq = jq.parent());

            if (depth[name] && (depth[name] < i)) return;
            maps[name] = {
              target: target,
              name: name,
              value: attr.value
            };
            depth[name] = i;

          }); // end of target.attributes.forEach

          [...Object.keys(maps)].forEach((name) => {

            var map = maps[name], keys, last,
                conf = Object.getOwnPropertyDescriptor(self, name);

            if (conf && !conf.configurable) {
              __debug('cannot recreate map "' + name + '"');
              return;
            }

            keys = map.value.split('.'), last = keys.pop();

            Object.defineProperty(self, name, 
              { configurable: false, enumerable: true,

              set: function (k, l, v) {
                var tgt = self;
                for (var i = 0; tgt && (i < k.length); i++) tgt = tgt[k[i]];
                if (tgt) tgt[l] = v;
              }.bind(self, keys, last),

              get: function (k, l) {
                var tgt = self;
                for (var i = 0; tgt && (i < k.length); i++) tgt = tgt[k[i]];
                return tgt ? tgt[l] : undefined;
              }.bind(self, keys, last)

            }); // end of defineProperty

          }); // end of maps.forEach

        }); // end of matching.each
      },

      /******************************************************************/

      merge_targets: function () {
        /*****
         * markup all content targets: targets are where content is placed
         * within the template..  there are two uses:
         *
         * The tag:   <gbl:target name='[source tagname | markup string]'></gbl:target>
         * attribute: <sometag gbl:target='[source tagname | markup string]'>....</sometag>
         *
         *  where 'source tagname' is a tagname within the input tree who's content will
         *  be used as the source data; and 'markup string' represents a string which is
         *  used as the source data.  Strings in markup matching: "${word}" will be replaced
         *  with the value of the input tag's attribute named 'word'.  The string matching:
         *  "$_" will be marked up with the value of the attribute with that name.
         *
         *  Any tag in the template may reference which attributes are to be marked up
         *  by defining an attribute called gbl + ':attrs' containing a comma-delimited list
         *  of attributes.  If an attribute is referenced, but not actually *defined*,
         *  then the attribute of the same name from the input is used, closest in scope.
         *
         *  NOTE: all attributes on the input tags *not* used explicitly for template
         *  attributes (by naming it in gbl:attrs, and not defining a pattern) will be
         *  added to the template's root element.  This means, if you want an attribute
         *  to be added to a child *and* the root element, then define the attribute on
         *  the child template tag 'tagname="$_"'.  this will use the same content, but
         *  still add it io the root element
         *
         */

        var self = this, count = 0;

        var my_id = this.tmpl_name + '\\:value';

        this.matching('all:value').each((i, target) => {
          target = $(target);

          var scoped = false, attr = target.attr(gbl + ':value');
          if (!attr) {
            attr = target.attr(self.tmpl_name + ':value');
            if (attr) scoped = self.tmpl_name;
          }

          if (!scoped) {
            var tmpl = target.closest(gbl + '\\:template');
            if (tmpl.length && (tmpl[0] !== self.output[0].parentElement)) return;

            for (var tmp = target; tmp.get(0) != self.tmpl.get(0); tmp = tmp.parent()) {
              var name = tmp.get(0).nodeName.toLowerCase().split(':');
              if ((name.length < 2) || (name[0] !== gbl) || (name[1] === 'value')) continue;
              return; // target of a sub-template
            }
          }

          var is_value = false, is_attr = false, value = false, how = 'append', anchor = false;

          if (attr) {
            target.attr((scoped ? scoped : gbl) + ':value', null);
            is_attr = true;
            var tmp = attr.split(':', 2);
            if (tmp.length > 1) {
              attr = tmp[1];
              anchor = tmp[0];
              is_value = true;
            }
          } else {
            attr = target.attr('value');
            if (!attr) attr = target.text();
            anchor = target.attr('anchor');
            if (anchor) {
              target.attr('anchor', null);
              is_value = true;
            }
            how = 'replaceWith';
          }

          if (is_value) {
            if (!is_attr) target.attr(gbl + ':value', anchor + ':' + attr);
            var conf = Object.getOwnPropertyDescriptor(self, attr);

            if (!conf || conf.configurable) {
              var opts = {
                configurable: false,
                enumerable: true,
                get: self._read_value.bind(self, attr),
                set: self._update_value.bind(self, attr)
              };
              Object.defineProperty(self, attr, opts);
            }

            var val;
            self._points[attr] = {
              attr: is_attr,
              elem: target.get(0),
              value: (val = self.stack.resolve(attr)),
              events: {}
            };

            if (!target[0].__points) target[0].__points = [];
            target[0].__points.push(self._points[attr]);

            if (val) self[attr] = val;
            return;
          }

          count++;
          // has the attribute gbl:target: contents are appended as children
          if (attr === '*') // '*': all additional input contents are used
            return target[how](self.stack.current.contents());

          value = self.markup(attr);
          if (value !== attr) return target[how](value);

          value = self.stack.current.children(attr);
          if (!value.length) return false;

          var last = target, rm = false;

          value.each((i, item) => {
            var block = target.clone(true);
            item = $(item).children();
            self.stack.dive(this.input, item);
            self.markup_attributes(block);
            self.stack.pop();
            last.after(block);
            block[how](item);
            last = block;
          });
          if (rm) target.remove();
        });

        if (count) this.merge_targets();
        return;
      },

      /******************************************************************/

      _read_value: function (name) {
        var point = this._points[name];
        if (!point) return;
        return point.attr ? $(point.elem).val() : point.value;
      },

      /******************************************************************/

      _update_value: function (name, value) {
        var point = this._points[name];
        if (!point) return;
        var orig = point.value;
        point.value = value;

        if (!point.attr) {
          if (!(value instanceof Node)) value = document.createTextNode(value);
          point.elem.parentElement.replaceChild(value, point.elem);
          point.elem = value;
        } else {
          $(point.elem).val(value);
          if (value !== orig) $(point.elem).trigger('change');
        }

        if ((orig != point.value) && point.events.change) point.events.change();
      },

      /******************************************************************/

      markup: function (str, def) {
        var expr = /\$(?:\{([^\}]+)\}|(_))/g,
          out = '', match, last = 0, hit = false;

        while ((match = expr.exec(str))) {
          var s, value = false, i, tmp,
            type = 'any', scope = -1, scope_val = '', name = match[1];

          out += str.substring(last, match.index);

          value = match[1] ? this.stack.resolve(match[1]) : def;

          if (value === str) value = '';

          if (value) out += value;
          hit = true;

          last = match.index + match[0].length;
        }

        out += str.substring(last);

        return (hit && (str !== out))  ? this.markup(out) : out;
      },

      /******************************************************************/

      markup_events: function (output) {
        output = output || this.output;
        this.matching('attr:events', [ output ]).each((i, target) => {
          var events = {}, attrs = [];

          [...target.attributes].forEach((attr) => {
            var tmp = attr.name.split(':');
            if (tmp.length == 1) return;
            switch (tmp[0]) {
              case ('for'):
              case ('as'):
              case ('when'):
                attrs.push(attr);
            }
            return;
          });

          if (target === this.input[0])
            target = this.output[0];

          attrs.forEach((attr) => {
            var val = attr.value,
              self = this,
              stack_index = this.stack.index,
              evt = attr.name.toLowerCase().split(':');

            if (evt.length == 1) evt.unshift('when');
            evt = { how: evt[0], name: evt[1] };

            $(target).on(evt.name, (events[evt.name] = function (ev) {
              __debug('called event listener for ' + evt.name + ' on ', this, ' for ', self);

              var tmp_index = self.stack.index, code, func, ret;
              self.stack.moveTo(stack_index);

              code = self.markup(val).trim();
              if (code.substr(-1) !== ';') code += ';';
              code = eval('(function (ev) { ' + code + ' })');
              ret = code.call(this, ev);

              if (ev) {
                if (evt.how !== 'as')
                  ev.preventDefault();
                if (evt.how === 'for')
                  ev.stopPropagation();
              }

              self.stack.moveTo(tmp_index);

              return ret;
            }));

            __debug('added event listener for ' + evt.name + ' on ', target, ' for ', self);

          });

          var attr_name = target.getAttribute(gbl + ':value');
          if (attr_name && this._points[attr_name]) this._points[attr_name].events = events;

        });
        return;
      },

      /******************************************************************/

      setup_emitters: function (output) {
        output = output || this.output;
        this.matching('attr:emit', [ output ]).each((idx, target) => {
          var self = this,
            emitters = (target.getAttribute(gbl + ':emit') || target.getAttribute(this.tmpl_name + ':emit') ).split(',').map((i)=>(i.trim()));

          emitters.forEach((evt) => {
            var tmp = evt.split(':').map((i)=>(i.trim())),
            emit = tmp[1].toLowerCase(),
            ename = tmp[0].toLowerCase();

            $(target).on(ename, (e) => {
              target.dispatchEvent(
                new CustomEvent(emit, { bubbles: true, cancelable: true, composed: true, detail: { tmpl: self, sourceEvent: e } })
              );
              __debug('dispatched event ' + emit + ' from ' + evt, e, self);
            });
            __debug('setup emitter on ' + evt + ' for ' + emit, this);
          });
        });
      },

      /******************************************************************/

      copy_attributes: function () {
        var out = this.output[0], inp = this.input[0];
        [...inp.attributes].forEach((attr) => {
          var append = false, name = attr.name;
          attr = attr.cloneNode(); //.ownerElement.removeAttributeNode(attr);

          if ((append = out.attributes[name + '+'])) {
            append.ownerElement.removeAttributeNode(append);
            attr.value += append.value;
            out.attributes.setNamedItem(attr);
            return;
          } else if ((attr.name.substr(-1) === '+') && (append = out.attributes[name]))
            append.value += attr.value;
          else if (!out.attributes[name])
            out.attributes.setNamedItem(attr);
        });
      },

      markup_attributes: function (output) {
        output = output || this.output;
        var created = {}, self = this;
        // markup attributes

        this.matching('attr:attrs', [ output ]).each((i, target) => {
          // the list of attributes to markup
//          if (!$(target).closest(this.__selector()).addBack(this.__selector()).is(output)) return;
          var list = target.getAttribute(gbl + ':attrs');
          if (!list) list = target.getAttribute(this.tmpl_name + ':attrs');
          list.split(',').map((i) => (i.trim()))
          .forEach((name) => {
            var val, attr = target.attributes[name], def, concat = false;

            if (!attr) {
              attr = target.attributes[name + '+'];
              if (attr) {
                concat = true;
//                name += '+';
              }
            }

            if (attr) {
              val = attr.value;
              attr.ownerElement.removeAttributeNode(attr);
            } else {
              val = '';
              concat = true;
            }

            val = this.markup(val);
            if (concat) {
              var tmp = this.stack.resolve(name);
              if (tmp) val = tmp + val;
            }

            if (val) {
              target.setAttribute(name, val);
              created[name] = true;
            }
          });
          target.removeAttribute(gbl + ':attrs');
        });


        return;
      }

      /******************************************************************/

  };


    /********************************************************************************
     * Templates (template builder)
     */
    // invoke our own tmpl instance
    Tmpl.templates =
  Object.assign(
    function (elem, name) {
      var base = $(elem), sc = base.attr('scope'), base_stack, builder, sc, scoped = false;

      name = name || base.attr('name').toLowerCase();

      if (this instanceof Tmpl) base_stack = this.stack.copy_up();
      else {
        base_stack = [];
        if (base.parent().closest(this.__selector()).length) return;
      }

      base.remove();
      base.data(gbl + '-tmpl-name', name);

      builder = (input, stack) => {
        var prev, tmpl;
        input = $(input);
        stack = stack || [];

        input.attr(gbl + ':tmpl', name);

        if (!scoped) {
          prev = input.parent().closest(Tmpl.__selector());
          if (prev.length && (prev.get(0) !== input.get(0))) {
            tmpl = Tmpl.get.tmpl(prev);
            if (!tmpl || !tmpl.rendered) return; // don't init sub-templates of unrendered instances
          }

          prev = Tmpl.get_closest_stack(input);
          if (prev)
            stack = [...prev, ...stack];
        }
        new Tmpl(input, base.clone(true), stack);
      };

      builder.__name = name;

      if (sc && (sc === 'local'))
        builder.__scoped = scoped = true;
      else this.templates[name] = builder;

      return builder;
    },

    /************************************************************
     * templates statics
     */
    {

      /****************************************/

      tag: function () { },
      options: function () { },

      /****************************************/

      fetch: function (elem) {

        elem = $(elem);
        var params = elem.attr('params'),
          method = elem.attr('method'),
          href = elem.attr('href'),
          loaded = elem.attr('when:loaded');

        if (!params) params = '';

        var opts = {};
        params.split(',').map((i)=>(i.trim())).forEach((i) => (opts[i] = JSON.parse(elem.attr(i))));

        if (!method) method = 'GET';

        if ((method.toLowerCase() !== 'post') && params) {
          var uri = '';
          [...Object.keys(opts)].forEach((i) => (uri += '&' + i + '=' + encodeURIComponent(JSON.stringify(opts[i]))));
          if (href.indexOf('?') === -1) href += '?';
          href += uri;
          opts = '';
        }

        elem.load(href, opts, () => {
          elem.replaceWith(elem.children());
          if (loaded) eval(loaded);
          return;
        });
      },

      /****************************************/

      if: function (elem) {
        elem = $(elem);
        var conditions = elem.children('then'), selected; //.querySelectorAll('then'), selected;

        conditions = (!conditions || !conditions.length) ? [...elem] : [...conditions];

        var _else = elem.children('else').get(0);

        var scope = Tmpl.get_closest_tmpl(elem);

        conditions.some((cond) => {
          var result, attr = cond.getAttribute('cond');
          if (scope) attr = scope.markup(attr);
          try {
            result = eval(attr);
          } catch (e) {
            __debug('error evaluating gbl:if (' + attr + ')');
            result = false;
          }
          if (!result) return false;
          selected = cond;
          return true;
        });

        if (!selected && !(selected = _else)) {
          elem.remove();
          return;
        }

        elem = elem[0];

        var last = false;
        [...selected.childNodes].reverse().forEach((item) => {
          if (!last) {
            elem.parentNode.replaceChild(item, elem);
          } else {
            last.parentNode.insertBefore(item, last);
          }
          last = item;
        });

        if (_else) conditions.push(_else);

        conditions.forEach((i) => (i.parentElement ? i.parentElement.removeChild(i) : null));

        return;
      }
    }
  ); /* end of obj.assign */

    Tmpl.templates.template = Tmpl.templates.bind(Tmpl),
    Tmpl.prototype.__template = Tmpl.templates;

    /********************************************************************************\
    \********************************************************************************/

    function process(rec, scope) {
      if (!scope) scope = Tmpl.get.parent(rec);

      if (scope) {
        var name = rec.nodeName;
        if ((scope instanceof Object) && scope.__local_tmpl[name]) {
          scope.__local_tmpl[name](rec);
          return;
        }
        if (rec.nodeName.substr(0, 3) !== 'BX:') return;
      } else if (Tmpl.is.child(rec)) {
        // don't process embedded tags here.
        return;
      }

      var templates;

      var name = rec.nodeName.substr(3).toLowerCase();

      if (scope) do {
        templates = scope.templates;
      } while (!templates[name] && (scope = Tmpl.get.parent(scope)));

      if (!templates || !templates[name]) templates = Tmpl.templates;
      if (!templates[name]) return;
      templates[name](rec);
    }

    /********************************************************************************\
    \********************************************************************************/

    var observer = new MutationObserver((records) => {
      records = [...records];
      records.forEach((rec) => {
        var added = [...rec.addedNodes],
            removed = [...rec.removedNodes];
        added.forEach((rec)=> {
          if (rec.parentElement && !rec.__bxproto)
            process(rec);
        });
        removed.forEach((rec) => {
          var proto = rec.__bxproto || false;
          if (!proto || !proto.components) return;
          proto.components.delete(rec);
        });
        return;
      });
      return;
    });

    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(window.document.body, {childList: true, subtree: true});
      $(gbl + '\\:template').each((i, elem) => (process(elem)));
      for (var name in Tmpl.templates)
        $(gbl + '\\:' + name).each((i, elem) => (process(elem)));
    });

    /********************************************************************************\
    \********************************************************************************/

})(this, $, BXComponents);

