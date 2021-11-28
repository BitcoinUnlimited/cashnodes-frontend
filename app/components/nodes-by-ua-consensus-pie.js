import Component from '@glimmer/component';

import CashNodes from '../models/cash-nodes';

export default class NodesByUaConsensusPieComponent extends Component {
  nodesByUAConsensusOptions = {
    title: {
      text: 'Nodes by UserAgent (consensus)',
    },
    chart: {
      type: 'pie',
    },
  };

  get nodesByUAConsensus() {
    const cashNodes = new CashNodes(this.args.nodes);
    const byUserAgent = cashNodes.nodesByUserAgentInConsensus;
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
        name: 'Nodes by UA in consensus',
        data: highPieData,
      },
    ];
  }
}
