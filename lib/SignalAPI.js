// This module provides a high-level API interface to a Luni device driver
// running on a remote Arduino under Firmata.
//
// This program is strict-mode throughout.
//
// Doug Johnson, June 2016

const log4js = require("log4js");
const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('DEBUG');

const API = require("../lib/DeviceAPI");
const RDD =  API.RDD;

const REG = {
  CHANNEL_VALUES: 256
};

const DIR = {
  INPUT: 0,
  OUTPUT: 1
};

const OP = {
  ANALOG: 0,
  DIGITAL: 1
};

const CONFIG = {
  INPUT: 0,
  OUTPUT: 1,
  INPUT_PULLUP: 2
};

/**
 * Use the Luni device driver proxy to talk to a DDSignal device
 * driver running on a connected Arduino.  API functions specific to DDSignal
 * are defined here, and API functions common to all device drivers are
 * defined in DeviceAPI, the superclass.
 */
class SignalAPI extends API.DeviceAPI {

  constructor(opts) {
    super(opts);
  }

/**
 * Tell the driver which pins we want to use and how.
 * @param {[type]} handle   [description]
 * @param {[type]} channels [description]
 */

  setChannelList(handle, direction, channelDescriptors) {
    let pb = new Buffer(2+(3*channelDescriptors.length));
    let byteIndex = 0;
    pb[byteIndex++] = direction;
    pb[byteIndex++] = channelDescriptors.length;
    for (let c = 0; c < channelDescriptors.length; c++) {
      let acd = channelDescriptors[c];
      if (!acd.hasOwnProperty("digitalPin")) {
        if (acd.hasOwnProperty("analogPin")) {
          acd.digitalPin = this.firmataBoard.analogPins[acd.analogPin];
        } else {
          this.emit("error", {status: RDD.SC.EBADR, handle: handle});
        }
      }
      pb[byteIndex++] = acd.op;
      pb[byteIndex++] = acd.config;
      pb[byteIndex++] = acd.digitalPin;
    }

    this.proxy.write(handle,RDD.DAF.NONE,RDD.CDR.Configure,pb.length,pb,(response) => {
      log.trace(`proxy.write(${response.handle}) callback invoked for API setChannelList().`);
      if (response.status >= 0) {
        this.emit("write",{status : RDD.SC.ESUCCESS.val, handle : response.handle, data : response.datablock});
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }

  /**
   * Read a single data scan.
   *
   * @param  {[type]}   handle   [description]
   */
  readOneScan(handle) {
    this.proxy.read(handle, RDD.DAF.NONE, REG.CHANNEL_VALUES, 256, (response) => {
      log.trace(`proxy.read(${response.handle}) callback invoked for API readOneScan().`);
      if (response.status >= 0) {
        let channelCount = response.datablock[0];
        log.trace(`Channel count is ${channelCount}.`);
        let channelValues = new Array(channelCount);
        let byteIndex = 1;
        for (let c=0; c < channelCount; c++) {
          channelValues[c] = response.datablock.readInt16LE(byteIndex);
          byteIndex += 2;
        }
        this.emit("read",{status : RDD.SC.ESUCCESS.val, handle : response.handle, data : channelValues});
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }

  /**
   * Initiate a continuous sequence of read responses from the remote driver.
   * There will be an immediate response to the read(), followed by one every
   * time the millisecond interval expires.  Note that if the interval is 0,
   * the default, it will never expire and there will be no responses sent.
   *
   * @param  {[type]}   handle   [description]
   */
  readContinuousScans(handle){
    this.proxy.read(handle, RDD.DAF.MILLI_RUN, REG.CHANNEL_VALUES, 256, (response) => {
      log.trace(`proxy.read(${response.handle}) callback invoked for API readContinuousScans().`);
      if (response.status >= 0) {
        let channelCount = response.datablock[0];
        log.trace(`Channel count is ${channelCount}.`);
        let channelValues = new Array(channelCount);
        let byteIndex = 1;
        for (let c=0; c < channelCount; c++) {
          channelValues[c] = response.datablock.readInt16LE(byteIndex);
          byteIndex += 2;
        }
        this.emit("read-continuous",{status : RDD.SC.ESUCCESS.val, handle : response.handle,
          flags : response.flags, data : channelValues});
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }
}

module.exports.SignalAPI = SignalAPI;
module.exports.DIR = DIR;
module.exports.OP = OP;
module.exports.CONFIG = CONFIG;
module.exports.RDD = RDD;
