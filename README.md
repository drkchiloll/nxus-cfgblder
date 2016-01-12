### Generate Cisco SVI CLI Configs

* Using CSV
  * Column1: vlan # (vlan 2)
  * Column2: Interface IP Address (10.x.x.x)
  * Column3: Subnet Mask # (24)
  * Column4: Virtual IP Addrs (10.x.x.1)
  * Column5: Interface Description (description_name)

##### Example CSV

```
vlan 2,10.255.2.4,23,10.255.2.1,voice_esx_cluster
```

#### Usage

Execute as "stand-alone" Script

```
bash$ node cfger.js file1.csv file2.csv
```

Execute as a "module"

```javascript
// In a New file with Access to cfger.js
var cfg = require('./cfger');
cfg(['..CSV_Data..', '..CSV_Data..', '...']);
```
