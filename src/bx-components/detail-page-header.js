import BXDetailPageHeader from '../../bower_components/bluemix-components/consumables/js/es2015/detail-page-header';

export default class DetailPageHeader extends BXDetailPageHeader {
  static validOptions() { return {}; }
}

/**
 * The map associating DOM element and detail page header instance.
 * @type {WeakMap}
 */
DetailPageHeader.components = BXDetailPageHeader.components;
