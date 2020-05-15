import { reads } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';

import { computed, get, set } from '@ember/object';

import moment from 'moment';

import mapNetworks from '../utils/map-networks';

import semver from 'semver';

import CONSTANTS from '../utils/constants';

export default Mixin.create({
  snapshot: reads('model.getNodes.value.snapshot'),
  _nodes: reads('model.getNodes.value'),

  snapshotDate: computed('snapshot', function() {
    return moment.unix(parseInt(get(this, 'snapshot'))).format('ddd MMM DD YYYY, HH:mm [UTC]Z');
  }),

  _serviceBits(services) {
    let serviceBits = [];
    if (services & 1) { serviceBits.push('NODE_NETWORK'); }
    if (services & 2) { serviceBits.push('NODE_GETUTXO'); }
    if (services & 4) { serviceBits.push('NODE_BLOOM'); }
    if (services & 8) { serviceBits.push('NODE_WITNESS'); }
    if (services & 16) { serviceBits.push('NODE_XTHIN'); }
    if (services & 32) { serviceBits.push('NODE_CASH'); }
    if (services & 64) { serviceBits.push('NODE_GRAPHENE'); }
    if (services & 128) { serviceBits.push('NODE_WEAKBLOCKS'); }
    if (services & 256) { serviceBits.push('NODE_CF'); }
    if (services & 1024) { serviceBits.push('NODE_NETWORK_LIMITED'); }
    return serviceBits;
  },

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
        return escape(node.address).match(regexp) || escape(node.userAgent).match(regexp) ||
               escape(this._serviceBits(node.services).join(' ')).match(regexp);
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
      let userAgentWoEB = userAgent.split('(')[0] + '/';
      const curr = byUserAgent[userAgentWoEB] || 0;
      byUserAgent[userAgentWoEB] = curr + 1;
    });
    return byUserAgent;
  }),

  nodesByUserAgentInConsensus: computed('nodes.[]', function() {
    let byUserAgentInC = {};
    get(this, 'nodes').forEach((node) => {
      let userAgent = get(node, 'userAgent') || 'unknown';
      let userAgentWoEB = userAgent.split('(')[0] + '/';
      let nodeType = userAgentWoEB.split(':')[0].substr(1);
      let version  = userAgentWoEB.split(':')[1];
      version = semver.coerce(version.slice(0, -1));
      // Assuming all clients but BU and BAC to be in consensus
      if (((nodeType === 'BUCash') && semver.cmp(version, '>=', CONSTANTS.BUminVer))
      if (((nodeType === 'BCH Unlimited') && semver.cmp(version, '>=', CONSTANTS.BUminVer))
      || ((nodeType === 'Bitcoin ABC') && semver.cmp(version, '>=', CONSTANTS.ABCminVer))
      || ((nodeType === 'BCHD') && semver.cmp(version, '>=', CONSTANTS.BCHDminVer))
      || ((nodeType !== 'BUCash') && (nodeType !== 'Bitcoin ABC') && (nodeType !== 'BCHD') && && (nodeType !== 'BCH Unlimited'))) {
          const curr = byUserAgentInC[userAgentWoEB] || 0;
          byUserAgentInC[userAgentWoEB] = curr + 1;
      }
    });
    return byUserAgentInC;
  }),

  nodesCountByUserAgent: computed('nodesByUserAgent', function() {
    const nodesByUserAgent = get(this, 'nodesByUserAgent');
    if (!nodesByUserAgent) { return; }
    return Object.keys(nodesByUserAgent).map((key) => {
      return {userAgent: key, count: nodesByUserAgent[key]};
    }).sortBy('count').reverse();
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
});
