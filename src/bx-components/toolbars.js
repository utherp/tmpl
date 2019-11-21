import BXToolbars from '../../bower_components/bluemix-components/consumables/js/es2015/toolbars';

export default class Toolbars extends BXToolbars {
  static validOptions() { return {}; }
}

/**
 * The map associating DOM element and search button instance.
 * @type {WeakMap}
 */
Toolbars.components = BXToolbars.components;
