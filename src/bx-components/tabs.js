import BXTab from '../../bower_components/bluemix-components/consumables/js/es2015/tabs';

export default class Tab extends BXTab {
  static validOptions() { return {
    'selectorMenu': { type: 'string', desc: "The CSS selector to find the drop down menu used in narrow mode." },
    'selectorTrigger': { type: 'string', desc: "The CSS selector to find the button to open the drop down menu used in narrow mode." },
    'selectorTriggerText': { type: 'string', desc: "The CSS selector to find the element used in narrow mode showing the selected tab item." },
    'selectorButton': { type: 'string', desc: "The CSS selector to find tab containers." },
    'selectorButtonSelected': { type: 'string', desc: "The CSS selector to find the selected tab." },
    'selectorLink': { type: 'string', desc: "The CSS selector to find the links in tabs." },
    'classActive': { type: 'string', desc: "The CSS class for tab's selected state." },
    'classHidden': { type: 'string', desc: "The CSS class for the drop down menu's hidden state used in narrow mode." },
    'eventBeforeSelected': { type: 'string', desc: "The name of the custom event fired before a tab is selected. Cancellation of this event stops selection of tab." },
    'eventAfterSelected': { type: 'string', desc: "The name of the custom event fired after a tab is selected." }
  }; }
}

/**
 * The component options.
 * @member {Object} Tab#options
 * @property {string} [selectorMenu] The CSS selector to find the drop down menu used in narrow mode.
 * @property {string} [selectorTrigger] The CSS selector to find the button to open the drop down menu used in narrow mode.
 * @property {string} [selectorTriggerText] The CSS selector to find the element used in narrow mode showing the selected tab item.
 * @property {string} [selectorButton] The CSS selector to find tab containers.
 * @property {string} [selectorButtonSelected] The CSS selector to find the selected tab.
 * @property {string} [selectorLink] The CSS selector to find the links in tabs.
 * @property {string} [classActive] The CSS class for tab's selected state.
 * @property {string} [classHidden] The CSS class for the drop down menu's hidden state used in narrow mode.
 * @property {string} [eventBeforeSelected]
 *   The name of the custom event fired before a tab is selected.
 *   Cancellation of this event stops selection of tab.
 * @property {string} [eventAfterSelected] The name of the custom event fired after a tab is selected.
 */

/**
 * The map associating DOM element and tab container instance.
 * @type {WeakMap}
 */
Tab.components = BXTab.components;
