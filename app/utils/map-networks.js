export default function mapNetworks(network) {
  if (['Hangzhou Alibaba Advertising Co.,Ltd.', 'Alibaba (China) Technology Co., Ltd.'].includes(network)) {
    return 'ALIBABA';
  }

  if (['DigitalOcean, LLC', 'Digital Ocean, Inc.'].includes(network)) {
    return 'DO';
  }

  if ('Amazon.com, Inc.' == network) {
    return 'AWS';
  }

  if ('Linode, LLC' == network) {
    return 'LINODE';
  }

  if ('Hetzner Online GmbH' == network) {
    return 'HETZNER';
  }

  if ('OVH SAS' == network) {
    return 'OVH';
  }

  if ('Choopa, LLC' == network) {
    return 'CHOOPA';
  }

  if ('Comcast Cable Communications, LLC' == network) {
    return 'COMCAST';
  }

  if ('Contabo GmbH' == network) {
    return 'CONTABO';
  }

  if ('Tor network' == network) {
    return 'TOR';
  }

  if ('Online S.a.s.' == network) {
    return 'ONLINE';
  }

  if ('WorldStream B.V.' == network) {
    return 'WORLD STREAM';
  }

  if ('Time Warner Cable Internet LLC' == network) {
    return 'TIME WARNER';
  }

  if ('Deutsche Telekom AG' == network) {
    return 'DEUTSCHE TELEKOM';
  }

  if ('Google LLC' == network) {
    return 'GOOGLE';
  }

  if ('Microsoft Corporation' == network) {
    return 'MICROSOFT';
  }

  if ('Liberty Global Operations B.V.' == network) {
    return 'LIBERTY GLOBAL OP';
  }

  if ('OOO Network of data-centers Selectel' == network) {
    return 'OOO NET';
  }

  if ('Shaw Communications Inc.' == network) {
    return 'SHAW COMM';
  }

  if ('Xs4all Internet BV' == network) {
    return 'XS4ALL';
  }

  if ('HostUS' == network) {
    return 'HOSTUS';
  }

  if ('MCI Communications Services, Inc. d/b/a Verizon Business' == network) {
    return 'MCI';
  }

  if ('Virgin Media Limited' == network) {
    return 'VIRGIN';
  }

  if ('AT&T Services, Inc.' == network) {
    return 'AT&T';
  }

  if ('Host Europe Gmbh' == network) {
    return 'HOST EUROPE';
  }

  if ('Hurricane Electric LLC' == network) {
    return 'HURRICANE';
  }

  if ('QuadraNet, Inc' == network) {
    return 'QUADRANET';
  }

  return 'MISC';
}
