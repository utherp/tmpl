import BXModal from '../../bower_components/bluemix-components/consumables/js/es2015/modals';

export default class Modal extends BXModal {
  static validOptions() { return {
    'classVisible': { type: 'string', desc: "The CSS class for the visible state." },
    'classNoScroll': { type: 'string', desc: "The CSS class for hiding scroll bar in body element while modal is shown." },
    'eventBeforeShown': { type: 'string', desc: "The name of the custom event fired before this modal is shown. Cancellation of this event stops showing the modal." },
    'eventAfterShown': { type: 'string', desc: "The name of the custom event fired after this modal is shown." },
    'eventBeforeHidden': { type: 'string', desc: "The name of the custom event fired before this modal is hidden. Cancellation of this event stops hiding the modal." },
    'eventAfterHidden': { type: 'string', desc: "The name of the custom event fired after this modal is hidden." }
  }; }
}

/**
 * The component options.
 * @member {Object} Modal#options
 * @property {string} [classVisible] The CSS class for the visible state.
 * @property {string} [classNoScroll] The CSS class for hiding scroll bar in body element while modal is shown.
 * @property {string} [eventBeforeShown]
 *   The name of the custom event fired before this modal is shown.
 *   Cancellation of this event stops showing the modal.
 * @property {string} [eventAfterShown] The name of the custom event fired after this modal is shown.
 * @property {string} [eventBeforeHidden]
 *   The name of the custom event fired before this modal is hidden.
 *   Cancellation of this event stops hiding the modal.
 * @property {string} [eventAfterHidden] The name of the custom event fired after this modal is hidden.
 */

/**
 * The map associating DOM element and modal instance.
 * @type {WeakMap}
 */
Modal.components = BXModal.components;
