// This module provides a high-level API interface to a Luni device driver
// running on a remote Arduino under Firmata.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016

const log4js = require("log4js");
const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('DEBUG');

const API = require("../lib/DeviceAPI");
const RDD =  API.RDD;

const REG = {
    AVG_INTERVALS : 256,
    DRIVER_COUNT : 257,
    DRIVER_VERSION_LIST : 258,
    UNIT_NAME_PREFIX_LIST : 259
};

/**
 * Use the Luni device driver proxy to talk to a DDMeta device
 * driver running on a connected Arduino.  API functions specific to DDMeta
 * are defined here, and API functions common to all device drivers are
 * defined in DeviceAPI, the superclass.
 */
class MetaAPI extends API.DeviceAPI {

  constructor(opts) {
    super(opts);
  }

  /**
   * Read the number of drivers in the attached Arduino.
   *
   * @param  {[type]}   handle   [description]
   */
  getDriverCount(handle) {
    this.proxy.read(handle, 0, REG.DRIVER_COUNT, 2, (response) => {
      log.trace(`Callback invoked for Meta API getDriverCount(h=${response.handle}).`);
      if (response.status >= 0) {
        this.emit("read",{status : RDD.SC.ESUCCESS.val, handle : response.handle, data : response.datablock.readInt16LE(0)});
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }

}

module.exports.MetaAPI = MetaAPI;
module.exports.RDD = RDD;
