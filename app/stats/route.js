import { get, set } from '@ember/object';
import Route from '@ember/routing/route';
import fetch from 'fetch';
import { task } from 'ember-concurrency';

import ENV from 'cashnodes/config/environment';

export default Route.extend({
  model() {
    return {
      getNodes: this.getNodesTask.perform()
    };
  },

  getNodesTask: task(function *() {
    const snapshots_response = yield fetch(`${ENV.CashNodes.apiUrl}/snapshots`);
    const snapshots = yield snapshots_response.json();
    const snapshot = snapshots['snapshots'][0];
    const response = yield fetch(`${ENV.CashNodes.apiUrl}/snapshots/${snapshot}`);
    const nodes = yield response.json();
    set(nodes, 'snapshot', snapshot);
    return nodes;
  }).restartable()
});
