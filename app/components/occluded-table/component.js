import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import Table from 'ember-light-table';

export default Component.extend({
  page: 0,
  dir: 'asc',
  sort: 'firstName',

  isLoading: false,
  canLoadMore: true,
  enableSync: true,

  model: null,
  meta: null,
  table: null,
  limit: 100,

  columns: computed(function() {
    return [
      {label: 'Address', valuePath: 'addressData', sortable: false, cellComponent: 'three-lines-cell'},
      {label: 'User Agent', valuePath: 'userAgentData', cellComponent: 'three-lines-cell'},
      {label: 'Location', valuePath: 'locationData', cellComponent: 'three-lines-cell'},
      {label: 'Network', valuePath: 'networkData', cellComponent: 'three-lines-cell'},
    ]
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    let table = new Table(get(this, 'columns'), get(this, 'model'), { enableSync: get(this, 'enableSync') });
    let sortColumn = get(table, 'allColumns').findBy('valuePath', get(this, 'sort'));

    // Setup initial sort column
    if (sortColumn) {
      set(sortColumn, 'sorted', true);
    }

    set(this, 'table', table);
    set(this, 'page', 1);
  },

  actions: {
    onScrolledToBottom() {
      if (get(this, 'canLoadMore')) {
        this.incrementProperty('page');
      }
    },

    onColumnClick(column) {
      if (column.sorted) {
        this.setProperties({
          dir: column.ascending ? 'asc' : 'desc',
          sort: column.get('valuePath'),
          canLoadMore: true,
          page: 0
        });
        this.get('model').clear();
      }
    }
  }
});
