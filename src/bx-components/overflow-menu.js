import toggleClass from '../../bower_components/bluemix-components/consumables/js/polyfills/toggle-class';
import BXOverflowMenu from '../../bower_components/bluemix-components/consumables/js/es2015/overflow-menu';

export default class OverflowMenu extends BXOverflowMenu {
  static validOptions() { return {}; }

  handleDocumentClick(event) {
    if (this.__button && this.__button.contains(event.target))
      return; // noop, this was just opened!
    return BXOverflowMenu.prototype.handleDocumentClick.call(this, event);
  }
}

OverflowMenu.components = BXOverflowMenu.components;
