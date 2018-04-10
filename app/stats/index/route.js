import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    const nodes_stats = this.modelFor('stats');
    return nodes_stats;
  }
});
