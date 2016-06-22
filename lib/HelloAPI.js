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
  INTERJECTION : 256,
  OBJECT : 257
};

let words = new Array(2);

/**
 * Use the Luni device driver proxy to talk to a DDHello device
 * driver running on a connected Arduino.  API functions specific to DDHello
 * are defined here, and API functions common to all device drivers are
 * defined in DeviceAPI, the superclass.
 */
class HelloAPI extends API.DeviceAPI {

  constructor(opts) {
    super(opts);
  }

  /**
   * Read the current greeting using the Stream register.
   *
   * @param  {[type]}   handle   [description]
   */
  getGreeting(handle) {
    this.proxy.read(handle, 0, RDD.CDR.Stream, 256, (response) => {
      log.trace(`proxy.read(${response.handle}) callback invoked for API getGreeting().`);
      if (response.status >= 0) {
        this.emit("read",{status : RDD.SC.ESUCCESS.val, handle : response.handle, data : response.datablock.toString("utf8")});
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }

  /**
   * Set the greeting that this Hello unit should use.
   * The input greeting string should consist of two words or phrases
   * separated by a comma.  This method cuts the string into two parts
   * around the comma, and sets the Interjection value to the first
   * part, and the Object value to the second part.
   *
   * @param {[type]}   handle   [description]
   * @param {[type]}   greeting [description]
   * @param {Function} callback [description]
   */
  setGreeting(handle, greeting) {
    let commaIndex = greeting.indexOf(',');
    if (commaIndex === -1) {
      words[0] = greeting;
      words[1] = "___";
    } else {
      words[0] = greeting.slice(0,commaIndex);
      words[1] = greeting.slice(commaIndex+1).trim();
    }
    this.proxy.write(handle,RDD.DAF.NONE,REG.INTERJECTION,words[0].length,words[0],(rA) => {
      log.trace(`Write(${rA.handle}) callback #1 invoked for API setGreeting().`);
      if (rA.status >= 0) {
        this.proxy.write(rA.handle,RDD.DAF.NONE,REG.OBJECT,words[1].length,words[1],(rB) => {
        log.trace(`Write(${rB.handle}) callback #2 invoked for API setGreeting().`);
        if (rB.status >= 0) {
          let result = {
            status : RDD.SC.ESUCCESS.val,
            handle : rB.handle,
            register : rB.register,
            flags : rB.flags
          };
          this.emit("write",result);
        } else {
          this.emit("error",{status : rB.status, handle : rB.handle});
        }
      });
    } else {
      this.emit("error",{status : rA.status, handle : rA.handle});
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
  getContinuousGreeting(handle){
    this.proxy.read(handle, RDD.DAF.MILLI_RUN, RDD.CDR.Stream, 256, (response) => {
      log.trace(`proxy.read(${response.handle}) callback invoked for API getContinuousGreeting().`);
      if (response.status >= 0) {
        this.emit("read-continuous",{status : RDD.SC.ESUCCESS.val, handle : response.handle,
          flags : response.flags, data : response.datablock.toString("utf8")});
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }
}

module.exports.HelloAPI = HelloAPI;
module.exports.RDD = RDD;
