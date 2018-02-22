import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('three-lines-cell', 'Integration | Component | three lines cell', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{three-lines-cell}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#three-lines-cell}}
      template block text
    {{/three-lines-cell}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
