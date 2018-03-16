import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    const nodes = this.modelFor('stats');
    return nodes;
  },
});
