import BXHeaderNav from '../../bower_components/bluemix-components/consumables/js/es2015/header';

export default class HeaderNav extends BXHeaderNav {
  static validOptions() { return {
    'selectortriggerlabel': { type: 'string', desc: "The css selector to find the label for the selected menu item." },
    'selectormenu': { type: 'string', desc: "The css selector to find the container of the menu items." },
    'selectoritem': { type: 'string', desc: "The css selector to find the menu items." },
    'selectoritemlink': { type: 'string', desc: "The css selector to find the link in the menu items." },
    'selectorlabel': { type: 'string', desc: "The css selector to find the label of the menu items." },
    'classactive': { type: 'string', desc: "The css class for the visible state." },
    'eventbeforeshown': { type: 'string', desc: "The name of the custom event fired before this taxonomy menu is shown. cancellation of this event stops showing the taxonomy menu." },
    'eventaftershown': { type: 'string', desc: "The name of the custom event fired after this taxonomy menu is shown." },
    'eventbeforehidden': { type: 'string', desc: "The name of the custom event fired before this taxonomy menu is hidden. cancellation of this event stops hiding the taxonomy menu." },
    'eventafterhidden': { type: 'string', desc: "The name of the custom event fired after this taxonomy menu is hidden." },
    'eventbeforeselected': { type: 'string', desc: "The name of the custom event fired before a menu item is selected. cancellation of this event stops the selection." },
    'eventafterselected': { type: 'string', desc: "The name of the custom event fired after a menu item is selected." }
  }; }

}

/**
 * The component options.
 * @member {Object} HeaderNav#options
 * @property {string} [selectorTriggerLabel] The CSS selector to find the label for the selected menu item.
 * @property {string} [selectorMenu] The CSS selector to find the container of the menu items.
 * @property {string} [selectorItem] The CSS selector to find the menu items.
 * @property {string} [selectorItemLink] The CSS selector to find the link in the menu items.
 * @property {string} [selectorLabel] The CSS selector to find the label of the menu items.
 * @property {string} [classActive] The CSS class for the visible state.
 * @property {string} [eventBeforeShown]
 *   The name of the custom event fired before this taxonomy menu is shown.
 *   Cancellation of this event stops showing the taxonomy menu.
 * @property {string} [eventAfterShown] The name of the custom event fired after this taxonomy menu is shown.
 * @property {string} [eventBeforeHidden]
 *   The name of the custom event fired before this taxonomy menu is hidden.
 *   Cancellation of this event stops hiding the taxonomy menu.
 * @property {string} [eventAfterHidden] The name of the custom event fired after this taxonomy menu is hidden.
 * @property {string} [eventBeforeSelected]
 *   The name of the custom event fired before a menu item is selected.
 *   Cancellation of this event stops the selection.
 * @property {string} [eventAfterSelected] The name of the custom event fired after a menu item is selected.
 */

/**
 * The map associating DOM element and taxonomy menu instance.
 * @type {WeakMap}
 */
HeaderNav.components = BXHeaderNav.components;
