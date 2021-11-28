import Component from '@glimmer/component';

import moment from 'moment';

export default class NodesSummaryComponent extends Component {
  get nodesCount() {
    return this.args.nodes.length;
  }

  get snapshotDate() {
    return moment
      .unix(parseInt(this.args.nodes.snapshot))
      .format('ddd MMM DD YYYY, HH:mm [UTC]Z');
  }
}
