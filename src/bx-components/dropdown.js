import BXDropdown from '../../bower_components/bluemix-components/consumables/js/es2015/dropdown';

export default class Dropdown extends BXDropdown {
  static validOptions() { return {
    'selectorItem': { type: 'string', desc: "The CSS selector to find clickable areas in dropdown items." },
    'selectorItemSelected': { type: 'string', desc: "The CSS selector to find the clickable area in the selected dropdown item." },
    'classSelected': { type: 'string', desc: "The CSS class for the selected dropdown item." },
    'eventBeforeSelected': { type: 'string', desc: "The name of the custom event fired before a drop down item is selected. Cancellation of this event stops selection of drop down item." },
    'eventAfterSelected': { type: 'string', desc: "The name of the custom event fired after a drop down item is selected." }
  }; }
}


/**
 * The component options.
 * @member {Object} Dropdown#options
 * @property {string} [selectorItem] The CSS selector to find clickable areas in dropdown items.
 * @property {string} [selectorItemSelected] The CSS selector to find the clickable area in the selected dropdown item.
 * @property {string} [classSelected] The CSS class for the selected dropdown item.
 * @property {string} [eventBeforeSelected]
 *   The name of the custom event fired before a drop down item is selected.
 *   Cancellation of this event stops selection of drop down item.
 * @property {string} [eventAfterSelected] The name of the custom event fired after a drop down item is selected.
 */

/**
 * The map associating DOM element and selector instance.
 * @type {WeakMap}
 */
Dropdown.components = BXDropdown.components;
