import Controller from '@ember/controller';
import { computed, get, set } from '@ember/object';

import NodesDataMixin from '../../mixins/nodes-data';

export default Controller.extend(NodesDataMixin, {
  selectedBasicTab: 0,

  userAgentPieOptions: computed(function() {
    return {
      chartArea: {width: '90%', height: '90%'},
      title: 'ALL NODES',
      height: 400,
      width: 400,
      legend: {alignment: 'center', position: 'bottom'},
      colors: ['#4CAF50', '#8BC34A', '#FFC107', '#D9D9D9', '#FF9800']
    };
  }),
  userAgentPieOptionsInC: computed(function() {
    return {
      chartArea: {width: '90%', height: '90%'},
      title: 'IN CONSENSUS',
      height: 400,
      width: 400,
      legend: {alignment: 'center', position: 'bottom'},
      colors: ['#4CAF50', '#8BC34A', '#FFC107', '#D9D9D9', '#FF9800']
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
