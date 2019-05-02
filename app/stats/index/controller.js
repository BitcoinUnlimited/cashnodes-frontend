import Controller from '@ember/controller';
import { computed, get, set } from '@ember/object';

import NodesDataMixin from '../../mixins/nodes-data';

export default Controller.extend(NodesDataMixin, {
  selectedBasicTab: 0,

  userAgentPieOptions: computed(function() {
    return {
      chartArea: {width: '100%', height: '100%'},
      title: 'Nodes by User Agent',
      height: 500,
      width: 500,
      legend: {alignment: 'center', position: 'right'},
      colors: ['#4CAF50', '#8BC34A', '#FFC107', '#D9D9D9', '#FF9800']
    };
  }),
  nodesByUserAgentPie: computed('nodesByUserAgent', function() {
    // pie chart: *abc* *bu* *xt* others (user agent)
    const byUserAgent = get(this, 'nodesByUserAgent');
    let pieData = {};
    Object.keys(byUserAgent).forEach((userAgent) => {
      let pieUserAgent = 'Others';
      if (userAgent.match(/.*bu.*/i)) {
        pieUserAgent = 'Bitcoin Unlimited';
      } else if (userAgent.match(/.*xt.*/i)) {
        pieUserAgent = 'XT';
      } else if (userAgent.match(/.*abc.*/i)) {
        pieUserAgent = 'ABC';
      }
      } else if (userAgent.match(/.*bchd.*/i)) {
        pieUserAgent = 'BCHD';
      }
      const curr = get(pieData, pieUserAgent) || 0;
      set(pieData, pieUserAgent, curr + byUserAgent[userAgent]);
    });
    const pieDataTable = Object.keys(pieData).map((key) => {
      return [key, pieData[key]];
    });
    return [['User Agent', 'Count']].concat(pieDataTable);
  }),

  geoData: computed('nodesCountByCountry', function() {
    return [['Country', 'Popularity']].concat(
      get(this, 'nodesCountByCountry').map((node) => {
        return [node.country, node.count];
      }));
  }),
});
