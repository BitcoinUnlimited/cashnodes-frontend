import Controller from '@ember/controller';
import { computed, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';

import { task, timeout } from 'ember-concurrency';
import moment from 'moment';

export default Controller.extend({
  filterQuery: '',
  snapshot: reads('model.getNodes.value.snapshot'),
  _nodes: reads('model.getNodes.value'),

  snapshotDate: computed('snapshot', function() {
    return moment.unix(parseInt(get(this, 'snapshot'))).format('dddd, MMMM DD, YYYY, HH:mmZ');
  }),

  _serviceBits(services) {
    let serviceBits = [];
    if (services & 1) { serviceBits.push('NODE_NETWORK'); }
    if (services & 2) { serviceBits.push('NODE_GETUTXO'); }
    if (services & 4) { serviceBits.push('NODE_BLOOM'); }
    if (services & 8) { serviceBits.push('NODE_WITNESS'); }
    if (services & 16) { serviceBits.push('NODE_XTHIN'); }
    return serviceBits;
  },

  nodes: computed('_nodes', function() {
    const _ns = get(this, '_nodes');
    return _ns.map(node => {
      return {
        address: `${node[0]}:${node[1]}`,
        protocolVersion: node[2],
        userAgent: node[3],
        connectedSince: node[4],
        services: node[5],
        height: node[6],
        hostname: node[7],
        city: node[8],
        countryCode: node[9],
        latitude: node[10],
        longitude: node[11],
        timezone: node[12],
        asn: node[13],
        organizationName: node[14]
      }
    });
  }),

  nodesData: computed('nodes', 'filterQuery', function() {
    const nodes = get(this, 'nodes');
    const filterQuery = get(this, 'filterQuery');
    const allNodes = nodes.map(node => {
      set(node, 'addressData', [
        node.address,
        node.hostname,
        `since ${moment.unix(node.connectedSince).from(moment())}`
      ]);
      set(node, 'userAgentData', [
        `${node.userAgent} (${node.protocolVersion})`,
        `${this._serviceBits(node.services).join(', ')}`,
        `height: ${node.height}`
      ]);
      set(node, 'locationData', [
        `${[node.countryCode, node.city].filter(e => {return e;}).join(',')}`,
        node.timezone,
        ''
      ]);
      set(node, 'networkData', [
        node.organizationName,
        node.asn,
        '',
      ]);
      return node;
    });

    if (!filterQuery) {
      return allNodes;
    }

    const filteredNodes = allNodes.filter((node) => {
      return node.address.match(filterQuery) || node.userAgent.match(filterQuery);
    });
    return filteredNodes;
  }),

  nodesCount: computed('nodes.[]', function() {
    return get(this, 'nodes').length;
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
