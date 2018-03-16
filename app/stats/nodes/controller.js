import Controller from '@ember/controller';
import { computed, get, set } from '@ember/object';

import { task, timeout } from 'ember-concurrency';

import NodesDataMixin from '../../mixins/nodes-data';

export default Controller.extend(NodesDataMixin, {
  filterQuery: '',

  tableColumns: computed(function() {
    return [
      {
        label: 'Address',
        valuePath: 'addressData',
        sortable: false,
        cellComponent: 'three-lines-cell',
        breakpoints: ['tablet', 'desktop', 'jumbo'],
        width: '35%'
      },
      {
        label: 'User Agent',
        valuePath: 'userAgentData',
        sortable: false,
        cellComponent: 'three-lines-cell',
        breakpoints: ['tablet', 'desktop', 'jumbo'],
        width: '30%'
      },
      {
        label: 'Location',
        valuePath: 'locationData',
        sortable: false,
        cellComponent: 'three-lines-cell',
        breakpoints: ['desktop', 'jumbo'],
        width: '17.5%'
      },
      {
        label: 'Network',
        valuePath: 'networkData',
        sortable: false,
        cellComponent: 'three-lines-cell',
        breakpoints: ['tablet', 'desktop', 'jumbo'],
        width: '17.5%'
      },
      {
        label: 'Nodes',
        valuePath: 'nodeSummary',
        sortable: false,
        cellComponent: 'four-lines-cell',
        breakpoints: ['mobile']
      }
    ]
  }),

  fileterNodesCount: computed('nodesData.[]', function() {
    return get(this, 'nodesData').length;
  }),

  doFilterNodes: task(function *(query) {
    yield timeout(200);
    set(this, 'filterQuery', query);
  }).restartable(),

  actions: {
    filterNodes(filter) {
      set(this, 'filter', filter);
      get(this, 'doFilterNodes').perform(filter);
    }
  }
});
