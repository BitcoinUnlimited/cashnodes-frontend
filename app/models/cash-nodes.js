import { set } from '@ember/object';

import moment from 'moment';

import semver from 'semver';

const BCH_VERSIONS = {
  BUminVer: '1.9.2',
  BCHNminVer: '23.0.0',
  FloweeminVer: '1.0.0',
  BCHDminVer: '0.18.1',
  VerdeminVer: '2.0.1',
  KnuthminVer: '0.22.0',
};

export default class CashNodes {
  constructor(nodes) {
    this._nodes = nodes;
  }

  _serviceBits(services) {
    let serviceBits = [];
    if (services & 1) {
      serviceBits.push('NODE_NETWORK');
    }
    if (services & 2) {
      serviceBits.push('NODE_GETUTXO');
    }
    if (services & 4) {
      serviceBits.push('NODE_BLOOM');
    }
    if (services & 8) {
      serviceBits.push('NODE_WITNESS');
    }
    if (services & 16) {
      serviceBits.push('NODE_XTHIN');
    }
    if (services & 32) {
      serviceBits.push('NODE_CASH');
    }
    if (services & 64) {
      serviceBits.push('NODE_GRAPHENE');
    }
    if (services & 128) {
      serviceBits.push('NODE_WEAKBLOCKS');
    }
    if (services & 256) {
      serviceBits.push('NODE_CF');
    }
    if (services & 1024) {
      serviceBits.push('NODE_NETWORK_LIMITED');
    }
    return serviceBits;
  }

  _mapNetworks(network) {
    if (
      [
        'Hangzhou Alibaba Advertising Co.,Ltd.',
        'Alibaba (China) Technology Co., Ltd.',
      ].includes(network)
    ) {
      return 'ALIBABA';
    }

    if (['DigitalOcean, LLC', 'Digital Ocean, Inc.'].includes(network)) {
      return 'DO';
    }

    if ('Amazon.com, Inc.' == network) {
      return 'AWS';
    }

    if ('Linode, LLC' == network) {
      return 'LINODE';
    }

    if ('Hetzner Online GmbH' == network) {
      return 'HETZNER';
    }

    if ('OVH SAS' == network) {
      return 'OVH';
    }

    if ('Choopa, LLC' == network) {
      return 'CHOOPA';
    }

    if ('Comcast Cable Communications, LLC' == network) {
      return 'COMCAST';
    }

    if ('Contabo GmbH' == network) {
      return 'CONTABO';
    }

    if ('Tor network' == network) {
      return 'TOR';
    }

    if ('Online S.a.s.' == network) {
      return 'ONLINE';
    }

    if ('WorldStream B.V.' == network) {
      return 'WORLD STREAM';
    }

    if ('Time Warner Cable Internet LLC' == network) {
      return 'TIME WARNER';
    }

    if ('Deutsche Telekom AG' == network) {
      return 'DEUTSCHE TELEKOM';
    }

    if ('Google LLC' == network) {
      return 'GOOGLE';
    }

    if ('Microsoft Corporation' == network) {
      return 'MICROSOFT';
    }

    if ('Liberty Global Operations B.V.' == network) {
      return 'LIBERTY GLOBAL OP';
    }

    if ('OOO Network of data-centers Selectel' == network) {
      return 'OOO NET';
    }

    if ('Shaw Communications Inc.' == network) {
      return 'SHAW COMM';
    }

    if ('Xs4all Internet BV' == network) {
      return 'XS4ALL';
    }

    if ('HostUS' == network) {
      return 'HOSTUS';
    }

    if ('MCI Communications Services, Inc. d/b/a Verizon Business' == network) {
      return 'MCI';
    }

    if ('Virgin Media Limited' == network) {
      return 'VIRGIN';
    }

    if ('AT&T Services, Inc.' == network) {
      return 'AT&T';
    }

    if ('Host Europe Gmbh' == network) {
      return 'HOST EUROPE';
    }

    if ('Hurricane Electric LLC' == network) {
      return 'HURRICANE';
    }

    if ('QuadraNet, Inc' == network) {
      return 'QUADRANET';
    }

    return 'MISC';
  }

  get nodes() {
    const _ns = this._nodes;
    return _ns.map((node) => {
      return {
        address: `${node[0]}:${node[1]}`,
        protocolversion: node[2],
        useragent: node[3],
        connectedsince: parseInt(node[4]),
        services: node[5],
        height: node[6],
        hostname: node[7],
        city: node[8],
        countrycode: node[9],
        latitude: node[10],
        longitude: node[11],
        timezone: node[12],
        asn: node[13],
        network: node[14],
      };
    });
  }

  get nodesData() {
    const nodes = this.nodes;
    const filterQuery = this.filterQuery;
    const allNodes = nodes.map((node) => {
      set(node, 'addressData', [
        node.address,
        node.hostname,
        `since ${moment.unix(node.connectedSince).from(moment())}`,
      ]);
      set(node, 'userAgentData', [
        `${node.userAgent} (${node.protocolVersion})`,
        `${this._serviceBits(node.services).join(', ')}`,
        `height: ${node.height}`,
      ]);
      set(node, 'locationData', [
        `${[node.countryCode, node.city]
          .filter((e) => {
            return e;
          })
          .join(',')}`,
        node.timezone,
        '',
      ]);
      set(node, 'networkData', [
        this._mapNetworks(node.network),
        node.asn,
        '',
      ]);
      set(node, 'nodeSummary', [
        `${node.address} (${this._mapNetworks(node.organizationName)})`,
        node.hostname,
        `${node.addressData[2]} (${node.userAgentData[2]})`,
        node.userAgentData[0],
      ]);
      return node;
    });

    let result = allNodes;
    if (filterQuery) {
      result = allNodes.filter((node) => {
        const regexp = new RegExp(escape(filterQuery), 'i');
        return (
          escape(node.address).match(regexp) ||
          escape(node.userAgent).match(regexp) ||
          escape(this._serviceBits(node.services).join(' ')).match(regexp)
        );
      });
    }
    return result
      .sortBy('connectedSince')
      .reverse()
      .map((node, idx) => {
        set(node, 'idx', idx);
        return node;
      });
  }

  get nodesCount() {
    return this.nodes.length;
  }

  get nodesByUserAgent() {
    let byUserAgent = {};
    this.nodes.forEach((node) => {
      let userAgent = node.useragent || 'unknown';
      let userAgentWoEB = userAgent.split('(')[0] + '/';
      const curr = byUserAgent[userAgentWoEB] || 0;
      byUserAgent[userAgentWoEB] = curr + 1;
    });
    return byUserAgent;
  }

  get nodesByUserAgentInConsensus() {
    let heightCounts = {};
    let mostCommonHeightCount = 0;
    let mostCommonHeight = 0;
    this.nodes.forEach((node) => {
      if (heightCounts[node.height] === undefined)
        heightCounts[node.height] = 1;
      else heightCounts[node.height]++;
      if (heightCounts[node.height] > mostCommonHeightCount) {
        mostCommonHeightCount = heightCounts[node.height];
        mostCommonHeight = node.height;
      }
    });

    let byUserAgentInC = {};
    this.nodes.forEach((node) => {
      let userAgent = node.useragent || 'unknown';
      let userAgentWoEB = userAgent.split('(')[0] + '/';
      let nodeType = userAgentWoEB.split(':')[0].substr(1);
      let version = userAgentWoEB.split(':')[1];
      version = semver.coerce(version.slice(0, -1));
      if (node.height >= mostCommonHeight - 10) {
        if (
          (nodeType === 'BCH Unlimited' &&
            semver.cmp(version, '>=', BCH_VERSIONS.BUminVer)) ||
          (nodeType === 'Bitcoin Cash Node' &&
            semver.cmp(version, '>=', BCH_VERSIONS.BCHNminVer)) ||
          (nodeType === 'Flowee' &&
            semver.cmp(version, '>=', BCH_VERSIONS.FloweeminVer)) ||
          (nodeType === 'bchd' &&
            semver.cmp(version, '>=', BCH_VERSIONS.BCHDminVer)) ||
          (nodeType === 'Bitcoin Verde' &&
            semver.cmp(version, '>=', BCH_VERSIONS.VerdeminVer)) ||
          ((nodeType === 'kth-bch' || nodeType === 'kth') &&
            semver.cmp(version, '>=', BCH_VERSIONS.KnuthminVer))
        ) {
          const curr = byUserAgentInC[userAgentWoEB] || 0;
          byUserAgentInC[userAgentWoEB] = curr + 1;
        }
      }
    });
    return byUserAgentInC;
  }

  get nodesCountByUserAgent() {
    const nodesByUserAgent = this.nodesByUserAgent;
    if (!nodesByUserAgent) {
      return undefined;
    }
    return Object.keys(nodesByUserAgent)
      .map((key) => {
        return { userAgent: key, count: nodesByUserAgent[key] };
      })
      .sortBy('count')
      .reverse();
  }

  get nodesCountByCountry() {
    let byCountry = {};
    this.nodes.forEach((node) => {
      if (!node.countrycode) {
        return;
      }
      const curr = byCountry[node.countrycode] || 0;
      set(byCountry, node.countrycode, curr + 1);
    });
    return Object.keys(byCountry)
      .map((key) => {
        return { country: key, count: byCountry[key] };
      })
      .sortBy('count')
      .reverse();
  }

  get nodesCountByNetwork() {
    let byNet = {};
    this.nodesData.forEach((node) => {
      const netData = node.networkData;
      if (!netData) {
        return;
      }
      if (!netData[0]) {
        return;
      }
      const curr = byNet[netData[0]] || 0;
      set(byNet, netData[0], curr + 1);
    });
    return Object.keys(byNet)
      .map((key) => {
        return { net: key, count: byNet[key] };
      })
      .sortBy('count')
      .reverse();
  }
}
