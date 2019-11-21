import toggleClass from '../../bower_components/bluemix-components/consumables/js/polyfills/toggle-class';
import BXOverflowMenu from '../../bower_components/bluemix-components/consumables/js/es2015/overflow-menu';

export default class OverflowButton extends BXOverflowMenu {
  static validOptions() { return {}; }

  static init(target = document) {
    if (target.nodeType !== Node.ELEMENT_NODE && target.nodeType !== Node.DOCUMENT_NODE) {
      throw new Error('DOM document or DOM element should be given to search for and initialize this widget.');
    }
    if (target.nodeType === Node.ELEMENT_NODE && target.getAttribute('overflow-id') !== undefined) {
      this.create(target);
    } else {
      [... target.querySelectorAll('[data-overflow-menu-id]')].forEach(element => this.create(element));
    }
  }

  getOverflowMenu() {
    if (!this.__overflow) {
      this.__overflow = document.getElementById(this.element.getAttribute('overflow-id'));
      if (this.__overflow) {
        var obj = BXOverflowMenu.create(this.__overflow);
        obj.__button = this.element;
      }
    }
    return this.__overflow;
  }

  handleDocumentClick(event) {
    const isOfSelf = this.element.contains(event.target);
    const shouldBeOpen = isOfSelf && !this.getOverflowMenu().classList.contains('bx--overflow-menu--open');

    if (isOfSelf && this.element.tagName === 'A') {
      event.preventDefault();
    }

    event.stopPropagation();

    toggleClass(this.getOverflowMenu(), 'bx--overflow-menu--open', shouldBeOpen);
  }

  handleKeyPress(event) {
    const key = event.key || event.which;
    if (key === 'Enter' || key === 13) {
      const isOfSelf = this.element.contains(event.target);
      const shouldBeOpen = isOfSelf && !this.getOverflowMenu().classList.contains('bx--overflow-menu--open');

      if (isOfSelf && this.element.tagName === 'A') {
        event.preventDefault();
      }

      toggleClass(this.element, 'bx--overflow-menu--open', shouldBeOpen);
    }
  }
}

OverflowButton.components = new WeakMap();
