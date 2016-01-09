// Need File System to Open CSV and Save CFG File
var fs = require('fs');

var interface = (params) => {
  return (
    `\nint ${params.vlanInt}\n`+
    `  no ip redirects\n`+
    `  ip address ${params.intIp}/${params.mask}\n`+
    `  no ipv6 redirects\n`+
    `  ip pim sparse-mode\n`+
    `  hsrp version 2\n`+
    `  hsrp ${params.vlanId}\n`+
    `    ip ${params.virtIp}\n`+
    `  description ${params.name}\n`+
    `  no shutdown\n!`
  );
};

var returnFileContents = (callback) => {
  fs.readFile('./host_records_56_1.csv', 'utf8', (err, content) => {
    if(err) callback(err, null);
    // console.log(content);
    callback(null, content.split('\r\n'));
  });
};

returnFileContents((err, svis) => {
  if(err) return new Error(err);
  var cfgs = '';
  svis.reduce((str, svi) => {
    var configs = svi.split(',');
    cfgs += interface({
      vlanInt: configs[0],
      intIp: configs[1],
      mask: configs[2],
      vlanId: configs[0].replace('vlan ', ''),
      virtIp: configs[3],
      name: configs[4]
    });
    return cfgs;
  }, cfgs);
  console.log(cfgs);
})
