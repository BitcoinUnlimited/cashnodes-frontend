import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | colored row', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{colored-row}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#colored-row}}
        template block text
      {{/colored-row}}
    `);

    assert.dom('*').hasText('template block text');
  });
});
