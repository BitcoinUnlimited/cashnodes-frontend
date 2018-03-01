import { computed, get } from '@ember/object';
import Row from 'ember-light-table/components/lt-row';

export default Row.extend({
  classNameBindings: ['rowColor'],

  rowColor: computed('row.idx', function() {
    let className = 'odd-row';
    if (get(this, 'row.idx') % 2) {
      className = 'even-row';
    }
    return [className];
  })
});
