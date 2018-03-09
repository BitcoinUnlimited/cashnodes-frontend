import Controller from '@ember/controller';
import { computed, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';

import { task, timeout } from 'ember-concurrency';
import moment from 'moment';

import mapNetworks from '../utils/map-networks';

export default Controller.extend({
  filterQuery: '',
  selectedBasicTab: 0,
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

  nodes: computed('_nodes', function() {
    const _ns = get(this, '_nodes');
    return _ns.map(node => {
      return {
        address: `${node[0]}:${node[1]}`,
        protocolVersion: node[2],
        userAgent: node[3],
        connectedSince: parseInt(node[4]),
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
        mapNetworks(node.organizationName),
        node.asn,
        '',
      ]);
      set(node, 'nodeSummary', [
        `${node.address} (${mapNetworks(node.organizationName)})`,
        node.hostname,
        `${get(node, 'addressData')[2]} (${get(node, 'userAgentData')[2]})`,
        get(node, 'userAgentData')[0]
      ])
      return node;
    });

    let result = allNodes;
    if (filterQuery) {
      result = allNodes.filter((node) => {
        const regexp = new RegExp(escape(filterQuery), 'i');
        return escape(node.address).match(regexp) || escape(node.userAgent).match(regexp);
      });
    }
    return result.sortBy('connectedSince').reverse().map((node, idx) => {
      set(node, 'idx', idx);
      return node;
    });
  }),

  nodesCount: computed('nodes.[]', function() {
    return get(this, 'nodes').length;
  }),

  nodesByUserAgent: computed('nodes.[]', function() {
    let byUserAgent = {};
    get(this, 'nodes').forEach((node) => {
      let userAgent = get(node, 'userAgent') || 'unknown';
      const curr = byUserAgent[userAgent] || 0;
      byUserAgent[userAgent] = curr + 1;
    });
    return byUserAgent;
  }),

  nodesCountByUserAgent: computed('nodesByUserAgent', function() {
    const nodesByUserAgent = get(this, 'nodesByUserAgent');
    if (!nodesByUserAgent) { return; }
    return Object.keys(nodesByUserAgent).map((key) => {
      return {userAgent: key, count: nodesByUserAgent[key]};
    }).sortBy('count').reverse();
  }),

  userAgentPieOptions: computed(function() {
    return {
      chartArea: {width: '100%', height: '100%'},
      title: 'Nodes by User Agent',
      height: 500,
      width: 500,
      legend: {alignment: 'center', position: 'right'}
    };
  }),
  nodesByUserAgentPie: computed('nodesByUserAgent', function() {
    // pie chart: *abc* *bu* *xt* others (user agent)
    const byUserAgent = get(this, 'nodesByUserAgent');
    let pieData = {};
    Object.keys(byUserAgent).forEach((userAgent) => {
      let pieUserAgent = 'Others';
      if (userAgent.match(/.*bu.*/i)) {
        pieUserAgent = 'Bitcoin Unlimited';
      } else if (userAgent.match(/.*xt.*/i)) {
        pieUserAgent = 'XT';
      } else if (userAgent.match(/.*abc.*/i)) {
        pieUserAgent = 'ABC';
      }
      const curr = get(pieData, pieUserAgent) || 0;
      set(pieData, pieUserAgent, curr + byUserAgent[userAgent]);
    });
    const pieDataTable = Object.keys(pieData).map((key) => {
      return [key, pieData[key]];
    });
    return [['User Agent', 'Count']].concat(pieDataTable);
  }),

  mapChartOptions: computed(function() {
    return {colorAxis: {colors: ['yellow', 'green']}};
  }),

  nodesCountByCountry: computed('nodes.[]', function() {
    let byCountry = {};
    get(this, 'nodes').forEach((node) => {
      if (!node.countryCode) { return; }
      const curr = get(byCountry, node.countryCode) || 0;
      set(byCountry, node.countryCode, curr + 1);
    });
    return Object.keys(byCountry).map((key) => {
      return {country: key, count: byCountry[key]};
    }).sortBy('count').reverse();
  }),

  nodesCountByNetwork: computed('nodesData.[]', function() {
    let byNet = {};
    get(this, 'nodesData').forEach((node) => {
      const netData = get(node, 'networkData')
      if (!netData) { return; }
      if (!netData[0]) { return; }
      const curr = get(byNet, netData[0]) || 0;
      set(byNet, netData[0], curr + 1);
    });
    return Object.keys(byNet).map((key) => {
      return {net: key, count: get(byNet, key)};
    }).sortBy('count').reverse();
  }),

  geoData: computed('nodesCountByCountry', function() {
    return [['Country', 'Popularity']].concat(
      get(this, 'nodesCountByCountry').map((node) => {
        return [node.country, node.count];
      }));
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
