import BXCard from '../../bower_components/bluemix-components/consumables/js/es2015/card';

export default class Card extends BXCard {
  static validOptions() { return { 
    'selectorCard': { type: 'string', desc: "The CSS selector to find cards.", default: '.bx--card' } 
  }; }

  /**
   * The container for cards.
   * @implements Component
   * @param {HTMLElement} element The element working as a container.
   * @param {Object} [options] The component options.
   * @param {string} [options.selectorCard] The CSS selector to find cards.
   */
  constructor(element, options = {}) {
    super(element, options);
  }
}

/**
 * The component options.
 * @member {Object} Card#options
 * @property {string} [selectorCard] The CSS selector to find cards.
 */

/**
 * The map associating DOM element and card list instance.
 * @type {WeakMap}
 */
Card.components = BXCard.components;
