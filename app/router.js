import EmberRouter from '@ember/routing/router';
import config from 'cashnodes/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

//Router.map(function() {
//  this.route('stats', {path: '/'}, function() {
//    this.route('nodes');
//  });
//});
//
//export default Router;
Router.map(function () {});
