// Need File System to Open CSV and Save CFG File
var fs = require('fs');

var interface = (params) => {
  return (
    `${params.idx === 0 ? "": "\n"}`+
    `int ${params.vlanInt}\n`+
    `  no ip redirects\n`+
    `  ip address ${params.intIp}/${params.mask}\n`+
    `  no ipv6 redirects\n`+
    `  ip pim sparse-mode\n`+
    `  hsrp version 2\n`+
    `  hsrp ${params.vlanId}\n`+
    `    authentication md5 key-string i6R#6Rj4!U4tJxJ!5\n`+
    `    ip ${params.virtIp}\n`+
    `  description ${params.name}\n`+
    `  no shutdown\n!`
  );
};

var returnFileContents = (filePath, callback) => {
  fs.readFile(filePath, 'utf8', (err, content) => {
    if(err) return callback(err, null);
    // console.log(content);
    callback(null, content.split('\r\n'));
  });
};

var writeFileContents = (filePath, payload, callback) => {
  fs.writeFile(filePath, payload, (err) => {
    if(err) callback(err, null);
    else callback(null, {succss: true});
  });
};

process.argv.shift();
process.argv.shift();
var files = process.argv;

(() => {
  files.forEach((file, i) => {
    returnFileContents(`./${file}`, (err, svis) => {
      if(err) return new Error(err);
      var cfgs = '';
      svis.reduce((str, svi, idx) => {
        var configs = svi.split(',');
        cfgs += interface({
          idx: idx,
          vlanInt: configs[0],
          intIp: configs[1],
          mask: configs[2],
          vlanId: configs[0].replace('vlan ', ''),
          virtIp: configs[3],
          name: configs[4]
        });
        return cfgs;
      }, cfgs);
      var newFN = `nxus_cfg_sw0${i+3}.cfg`;
      writeFileContents(`./${newFN}`, cfgs, (err, result) => {
        if(result) console.log(`New file written successfully.`);
      });
    });
  });
}());
