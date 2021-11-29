import { set } from '@ember/object';

import Component from '@glimmer/component';

import CashNodes from '../models/cash-nodes';

export default class NodesSummaryTablesComponent extends Component {
  get cashNodes() {
    return new CashNodes(this.args.nodes);
  }

  _topTen(data) {
    let rank = 1;
    return data.slice(0, 10).map((r) => {
      set(r, 'rank', rank);
      set(r, 'value', r.value);
      rank += 1;
      return r;
    });
  }

  get nodesByCountry() {
    const byCountry = this.cashNodes.nodesCountByCountry;
    return this._topTen(
      byCountry.map((c) => {
        return { value: c.country, count: c.count };
      })
    );
  }

  get nodesByUA() {
    const byUA = this.cashNodes.nodesCountByUserAgent;
    return this._topTen(
      byUA.map((c) => {
        return { value: c.userAgent, count: c.count };
      })
    );
  }

  get nodesByNetwork() {
    const byNet = this.cashNodes.nodesCountByNetwork;
    return this._topTen(
      byNet.map((c) => {
        return { value: c.net, count: c.count };
      })
    );
  }
}
