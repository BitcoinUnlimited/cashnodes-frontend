import { set } from '@ember/object';
import Route from '@ember/routing/route';
import fetch from 'fetch';
import { restartableTask } from 'ember-concurrency';

import CashNodes from '../models/cash-nodes';

import ENV from 'cashnodes/config/environment';

export default class StatsRoute extends Route {
  model() {
    return {
      getNodes: this.getNodesTask.perform(),
    };
  }

  @restartableTask
  *getNodesTask() {
    const snapshots_response = yield fetch(`${ENV.CashNodes.apiUrl}/snapshots`);
    const snapshots = yield snapshots_response.json();
    const snapshot = snapshots['snapshots'][0];
    const response = yield fetch(
      `${ENV.CashNodes.apiUrl}/snapshots/${snapshot}`
    );
    const nodes = yield response.json();
    set(nodes, 'snapshot', snapshot);
    return nodes;
  }

  get cashNodes() {
    return CashNodes(this.models.getNodes.value.nodes);
  }

  nodesByUAOptions = {
    chart: {
      type: 'pie',
    },
  };

  get nodesByUA() {
    const byUserAgent = this.cashNodes.nodesByUserAgent;
    let pieData = {};
    Object.keys(byUserAgent).forEach((userAgent) => {
      let pieUserAgent = userAgent.split(':')[0].substr(1);
      const curr = this.pieData[pieUserAgent] || 0;
      set(pieData, pieUserAgent, curr + byUserAgent[userAgent]);
    });

    return {
      data: Object.entries(pieData).map((ua, count) => {
        return {
          name: ua,
          y: count,
        };
      }),
    };
  }
}
