import Component from '@ember/component';
import  { computed, get, set } from '@ember/object';

export default Component.extend({
  tableIdx: null,
  countriesData: null,
  networkData: null,
  userAgentData: null,

  variableName: computed('tableIdx', function() {
    const idx = get(this, 'tableIdx');
    if (!idx) {
      return 'Country';
    } else if (idx == 1) {
      return 'Network';
    } else if (idx == 2) {
      return 'User Agent';
    }

  }),

  rows: computed('tableIdx', 'countriesData', 'networkData', 'userAgentData', function() {
    const idx = get(this, 'tableIdx');
    let data;
    let value;
    if (!idx) {
      data = get(this, 'countriesData');
      value = 'country';
    } else if (idx == 1) {
      data = get(this, 'networkData');
      value = 'net';
    } else {
      data = get(this, 'userAgentData');
      value = 'userAgent';
    }
    let rank = 1;
    return data.slice(0, 10).map((r) => {
      set(r, 'rank', rank);
      set(r, 'value', get(r, value));
      rank += 1;
      return r;
    });
  })
});
