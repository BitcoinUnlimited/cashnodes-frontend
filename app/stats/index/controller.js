import Controller from '@ember/controller';
import { computed, get, set } from '@ember/object';

import NodesDataMixin from '../../mixins/nodes-data';

let userAgentColors = {
  "BCH Unlimited": "#4CAF50",
  "BUCash": "#4CAF50",
  "Bitcoin Cash Node": "#8BC34A",
  "bchd": "#009900",
  "Flowee": "#48A35C",
  "Bitcoin ABC": "#FFC107",
  "Bitcoin Verde": "#1AB326",
  "kth-bch": "#006DD4",
  "kth": "#006DD4",
};

function getUserAgentColors(byUserAgent)
{
  const uniqueUserAgents = new Set(Object.keys(byUserAgent).map(fullUserAgent => {
    return fullUserAgent.split(':')[0].substr(1);
  }));
  return [...uniqueUserAgents].map(userAgent => {
     if (!(userAgent in userAgentColors))
       return "#D9D9D9";
     console.log(`${userAgent} color = ${userAgentColors[userAgent]}`);
     return userAgentColors[userAgent];
  });
}

export default Controller.extend(NodesDataMixin, {
  selectedBasicTab: 0,

  userAgentPieOptions: computed(function() {
    return {
      chartArea: {width: '90%', height: '90%'},
      title: 'ALL NODES',
      height: 400,
      width: 400,
      legend: {alignment: 'center', position: 'bottom'},
      colors: getUserAgentColors(get(this, 'nodesByUserAgent'))
    };
  }),
  userAgentPieOptionsInC: computed(function() {
    return {
      chartArea: {width: '90%', height: '90%'},
      title: 'NOV 2020 UPGRADED',
      height: 400,
      width: 400,
      legend: {alignment: 'center', position: 'bottom'},
      colors: getUserAgentColors(get(this, 'nodesByUserAgentInConsensus'))
    };
  }),
  nodesByUserAgentPie: computed('nodesByUserAgent', function() {
    // pie chart: *abc* *bu* *xt* others (user agent)
    const byUserAgent = get(this, 'nodesByUserAgent');
    let pieData = {};
    Object.keys(byUserAgent).forEach((userAgent) => {
      let pieUserAgent = userAgent.split(':')[0].substr(1);
      const curr = get(pieData, pieUserAgent) || 0;
      set(pieData, pieUserAgent, curr + byUserAgent[userAgent]);
    });
    const pieDataTable = Object.keys(pieData).map((key) => {
      return [key, pieData[key]];
    });
    return [['User Agent', 'Count']].concat(pieDataTable);
  }),

  nodesByUserAgentPieInC: computed('nodesByUserAgentInConsensus', function() {
    // pie chart: *abc* *bu* *xt* others (user agent)
    const byUserAgent = get(this, 'nodesByUserAgentInConsensus');
    let pieData = {};
    Object.keys(byUserAgent).forEach((userAgent) => {
      let pieUserAgent = userAgent.split(':')[0].substr(1);
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
