import Component from '@ember/component';

import { computed, get } from '@ember/object';

export default Component.extend({
  fstRow: computed('value', function() {
    return get(this, 'value')[0];
  }),
  sndRow: computed('value', function() {
    return get(this, 'value')[1];
  }),
  thrRow: computed('value', function() {
    return get(this, 'value')[2];
  }),
});
