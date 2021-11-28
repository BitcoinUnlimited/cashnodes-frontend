import Component from '@glimmer/component';

import CashNodes from '../models/cash-nodes';

export default class NodesByUaPieComponent extends Component {
  nodesByUAOptions = {
    title: {
      text: 'Nodes by UserAgent',
    },
    chart: {
      type: 'pie',
    },
  };

  get nodesByUA() {
    const cashNodes = new CashNodes(this.args.nodes);
    const byUserAgent = cashNodes.nodesByUserAgent;
    let pieData = {};
    Object.keys(byUserAgent).forEach((userAgent) => {
      let pieUserAgent = userAgent.split(':')[0].substr(1);
      const curr = pieData[pieUserAgent] || 0;
      pieData[pieUserAgent] = curr + byUserAgent[userAgent];
    });

    const highPieData = Object.entries(pieData).map(([ua, count]) => {
      return {
        name: ua,
        y: count,
      };
    });

    return [
      {
        name: 'Nodes by UA',
        data: highPieData,
      },
    ];
  }
}
