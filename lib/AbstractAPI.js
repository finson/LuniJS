// This module provides a high-level API interface to a Luni device driver
// running on a remote Arduino under Firmata.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016

const EventEmitter = require("events");
const log4js = require("log4js");

const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('TRACE');

const RDD = require("../lib/RemoteDeviceDriver");
const RDDErr = require("../lib/RDDStatus");
const RDDCmd = require("../lib/RDDCommand");

let proxy;
let unitName;
let openFlags;
let openOpts;
let handle;
let cbOpen = [];

/**
 * Use the Luni device driver proxy methods to talk to a device
 * driver running on a connected Arduino.
 */
class AbstractAPI extends EventEmitter {

/**
 * This AbstractAPI class receives user calls to common device driver API
 * methods and translates them to the appropriate device driver calls and
 * forwards them on using Firmata.
 *
 * @param  {object} opts Options
 */
  constructor(opts) {
    super();
    this.proxy = opts.driver;
  }

  /**
   * Open the specified unit
   * @param  {[type]} unitName [description]
   * @param  {[type]} flags    [description]
   * @param  {[type]} opts     [description]
   * @return {[type]}          [description]
   */
  open(unitName, flags, opts) {
    this.proxy.open(unitName, flags, opts,(response) => {
      log.trace(`proxy.open(${response.unitName}) callback invoked for API open().`);
      if (response.status >= 0) {
        this.emit("open",{status : RDDErr.ESUCCESS, unitName : response.unitName, handle : response.handle});
      } else {
        this.emit("error",{status : response.status, unitName : response.unitName});
      }
    });
  }

  /**
   * Set one or both of the timer intervals
   *
   * @param {[type]} handle [description]
   * @param {[type]} micros [description]
   * @param {[type]} millis [description]
   */
  setIntervals(handle, micros, millis) {
    this.proxy.read(handle, 0, RDDCmd.CDR.Intervals, 8, (response) => {
      log.trace(`proxy.read(${response.handle}) callback invoked for API setIntervals().`);
      if (response.status >= 0) {
        if (typeof micros === "number") {
          response.datablock.writeUInt32LE(micros,0);
        }
        if (typeof millis === "number") {
          response.datablock.writeUInt32LE(millis,4);
        }
        this.proxy.write(response.handle,RDDCmd.DAF.NONE,RDDCmd.CDR.Intervals,8,response.datablock,(response) => {
          log.trace(`proxy.write(${response.handle}) callback invoked for API setIntervals().`);
          if (response.status >= 0) {
            let result = {
              status : RDDErr.ESUCCESS,
              handle : response.handle,
              register : response.register,
              flags : response.flags
            };
            this.emit("write",result);
          } else {
            this.emit("error",{status : response.status, handle : response.handle});
          }
        });
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }

  /**
   * Close the connection represented by the given handle.
   *
   * @param  {[type]} handle [description]
   * @param  {[type]} flags  [description]
   * @return {[type]}        [description]
   */
  close(handle, flags) {
    this.proxy.close(handle,flags,(response) => {
      log.trace(`proxy.close(${response.handle}) close callback invoked for API close().`);
      if (response.status >= 0) {
        this.emit("close",{status : RDDErr.ESUCCESS, handle : response.handle});
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }
}


module.exports = {AbstractAPI};
