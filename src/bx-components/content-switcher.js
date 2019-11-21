import BXContentSwitcher from '../../bower_components/bluemix-components/consumables/js/es2015/content-switcher';

export default class ContentSwitcher extends BXContentSwitcher {
  static validOptions() { return {
    'selectorButton':         { type: 'string', desc: "The CSS selector to find switcher buttons." },
    'selectorButtonSelected': { type: 'string', desc: "The CSS selector to find the selected switcher button." },
    'classActive':            { type: 'string', desc: "The CSS class for switcher button's selected state." },
    'eventBeforeSelected':    { type: 'string', desc: "The name of the custom event fired before a switcher button is selected. Cancellation of this event stops selection of content switcher button." },
    'eventAfterSelected':     { type: 'string', desc: "The name of the custom event fired after a switcher button is selected." }
  }; }

  /**
   * Set of content switcher buttons.
   * @implements Component
   * @param {HTMLElement} element The element working as a set of content switcher buttons.
   * @param {Object} [options] The component options.
   * @param {string} [options.selectorButton] The CSS selector to find switcher buttons.
   * @param {string} [options.selectorButtonSelected] The CSS selector to find the selected switcher button.
   * @param {string} [options.classActive] The CSS class for switcher button's selected state.
   * @param {string} [options.eventBeforeSelected]
   *   The name of the custom event fired before a switcher button is selected.
   *   Cancellation of this event stops selection of content switcher button.
   * @param {string} [options.eventAfterSelected] The name of the custom event fired after a switcher button is selected.
   */
  constructor(element, options = {}) {
    super(element, options);
  }
}

/**
 * The component options.
 * @member {Object} ContentSwitcher#options
 * @property {string} [selectorButton] The CSS selector to find switcher buttons.
 * @property {string} [selectorButtonSelected] The CSS selector to find the selected switcher button.
 * @property {string} [classActive] The CSS class for switcher button's selected state.
 * @property {string} [eventBeforeSelected]
 *   The name of the custom event fired before a switcher button is selected.
 *   Cancellation of this event stops selection of content switcher button.
 * @property {string} [eventAfterSelected] The name of the custom event fired after a switcher button is selected.
 */

/**
 * The map associating DOM element and content switcher set instance.
 * @type {WeakMap}
 */
ContentSwitcher.components = BXContentSwitcher.components;
