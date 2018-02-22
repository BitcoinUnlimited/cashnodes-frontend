import Controller from '@ember/controller';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import moment from 'moment';

export default Controller.extend({
  _nodes: reads('model.getNodes.value'),

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

  nodesData: computed('nodes', function() {
    const nodes = get(this, 'nodes');
    return nodes.map(node => {
      node['addressData'] = [
        node.address,
        node.hostname,
        moment.unix(node.connectedSince).from(moment())
      ];
      node['userAgentData'] = [
        `${node.userAgent} (${node.protocolVersion})`,
        'SERVICE BITS, HERE',
        ''
      ];
      node['locationData'] = [
        `${[node.countryCode, node.city].filter(e => {return e;}).join(',')}`,
        node.timezone,
        ''
      ];
      node['networkData'] = [
        node.hostname,
        node.asn,
        ''
      ];
      return node;
    });
  }),

  nodesCount: computed('nodesData.[]', function() {
    return get(this, 'nodes').length;
  })
});
