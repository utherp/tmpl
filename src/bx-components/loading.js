import BXLoading from '../../bower_components/bluemix-components/consumables/js/es2015/loading';
export default class Loading extends BXLoading {
  static validOptions() { return {
    'active': { type: 'boolean', desc: "true if this spinner should roll." }
  }; }
}

/**
 * The map associating DOM element and spinner instance.
 * @type {WeakMap}
 */
Loading.components = BXLoading.components;
