// Need File System to Open CSV and Save CFG File
var fs = require('fs'),
    path = require('path');

// Remove the First 2 Objects in the Argv List
process.argv.shift();
process.argv.shift();
var files = process.argv;

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
  if(!args) return;
  if(args instanceof Array) {
    files = args;
  }
  files.forEach((file, i) => {
    returnFileContents(`./${file}`, (err, svis) => {
      if(err) return new Error(err);
      if(handleFileValidity(svis.shift())) {
        var cfgs = '';
        svis.reduce((str, svi, idx) => {
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
        var newFN = `nxus_cfg0${i+1}.cfg`;
        var filePath;
        // Store in Root DIR or File Directory
        if(args) {
          filePath = path.join(__dirname, `../files/${newFN}`);
        } else {
          filePath = `./${newFN}`;
        }
        writeFileContents(filePath, cfgs, (err, result) => {
          if(err) console.error(err);
          if(result) console.log(`New file written successfully.`);
        });
      }
    });
  });
};

if(files) {
  runner();
}
module.exports = runner;
