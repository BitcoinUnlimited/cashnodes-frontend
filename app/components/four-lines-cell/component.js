import Component from '@ember/component';

import { computed, get } from '@ember/object';

export default Component.extend({
  fstRow: computed('value', function() {
    return this.value[0];
  }),
  sndRow: computed('value', function() {
    return this.value[1];
  }),
  thrRow: computed('value', function() {
    return this.value[2];
  }),
  fourthRow: computed('value', function() {
    return this.value[3];
  }),
});
