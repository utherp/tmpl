import BXFileUploader from '../../bower_components/bluemix-components/consumables/js/es2015/file-uploader';

export default class FileUploader extends BXFileUploader {
  static validOptions() { return {
    'labelSelector': { type: 'string', desc: "The CSS selector to find the label for the file name." }
  }; }
}

/**
 * The component options.
 * @member {Object} FileUploader#options
 * @property {string} [labelSelector] The CSS selector to find the label for the file name.
 */

/**
 * The map associating DOM element and file uploader instance.
 * @type {WeakMap}
 */
FileUploader.components = BXFileUploader;
