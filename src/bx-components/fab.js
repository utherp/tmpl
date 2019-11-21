import BXFabButton from '../../bower_components/bluemix-components/consumables/js/es2015/fab';

export default class FabButton extends BXFabButton {
  static validOptions() { return {}; }
}

/**
 * The map associating DOM element and floating action button instance.
 * @type {WeakMap}
 */
FabButton.components = BXFabButton.components;
