import { get } from '@ember/object';
import Route from '@ember/routing/route';
import fetch from 'fetch';
import { task } from 'ember-concurrency';

export default Route.extend({
  model() {
    return {
      getNodes: get(this, 'getNodesTask').perform()
    };
  },

  getNodesTask: task(function *() {
    const snapshots_response = yield fetch('https://cashnodes.bitcoinunlimited.info/snapshots');
    const snapshots = yield snapshots_response.json();
    const snapshot = snapshots['snapshots'][0];
    const response = yield fetch(`https://cashnodes.bitcoinunlimited.info/snapshots/${snapshot}`);
    const nodes = yield response.json();
    return nodes;
  }).restartable()
});
