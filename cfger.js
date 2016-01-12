// Need File System to Open CSV and Save CFG File
var fs = require('fs'),
    path = require('path');

// Remove the First 2 Objects in the Argv List
process.argv.shift();
process.argv.shift();
var files = process.argv;

var interface = (params) => {
  var vlInt = params.vlanInt.replace(' ', '');
  vlInt = vlInt.substring(0,1).toUpperCase() + vlInt.substring(1);
  return (
    `${params.idx === 0 ? "": "\n"}`+
    `int ${vlInt}\n`+
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

var createCfg = (svis) => {
  var cfgs = '';
  return svis.reduce((str, svi, idx) => {
    var configs = svi.split(',');
    cfgs += interface({
      idx: idx,
      vlanInt: configs[0],                     // vlan 25
      intIp: configs[1],                       // int ip addrs
      mask: configs[2],                        // 24
      vlanId: configs[0].replace('vlan ', ''), // 25
      virtIp: configs[3],                      // hsrp ip address
      name: configs[4]                         // int description
    });
    return cfgs;
  }, cfgs);
};

var returnFileContents = (filePath, callback) => {
  fs.readFile(filePath, 'utf8', (err, content) => {
    if(err) return callback(err, null);
    // console.log(content);
    callback(null, content.split('\r\n'));
  });
};

var handleFileValidity = (headers) => {
  var headings = headers.split(',');
  if(headings[0].includes('VlanInt') &&
     headings[1].includes('IntIP') &&
     headings[2].includes('CIDR') &&
     headings[3].includes('VirtIP') &&
     headings[4].includes('DESC')) {
    return true;
  } else {
    return false;
  }
};

var writeFileContents = (filePath, payload, callback) => {
  fs.writeFile(filePath, payload, (err) => {
    if(err) callback(err, null);
    else callback(null, {success: true});
  });
};

// The Implementation
var runner = (args) => {
  if(args instanceof Array) {
    files = args;
  }
  return files.map((file, i) => {
    var newFN = `nxus_cfg0${i+1}.cfg`;
    var cfgs;
    var filePath;

    if(args) {
      // Node Module
      if(handleFileValidity(file.shift())) {
        return createCfg(file);
      }
    } else {
      returnFileContents(`./${file}`, (err, svis) => {
        if(err) return new Error(err);
        if(handleFileValidity(svis.shift())) {
          cfgs = createCfg(svis);
          filePath = `./${newFN}`;
          writeFileContents(filePath, cfgs, (err, result) => {
            if(err) console.error(err);
            if(result) console.log(`New file written successfully.`);
          });
        }
      });
    }
  });
};

if(files) {
  runner();
}
module.exports = runner;
