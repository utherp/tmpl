import BXNumberInput from '../../bower_components/bluemix-components/consumables/js/es2015/number-input';

export default class NumberInput extends BXNumberInput {
  static validOptions() { return {}; }
}

/**
 * The map associating DOM element and number input UI instance.
 * @type {WeakMap}
 */
NumberInput.components = BXNumberInput.components;
