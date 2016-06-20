// This module provides a high-level API interface to a Luni device driver
// running on a remote Arduino under Firmata.  All calls at the API level result
// in events, not callbacks.  If device-specific API functions are needed, the
// author should extend this class and define the needed functions in a subclass.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016

const log4js = require("log4js");
const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('TRACE');

const RDD = require("../lib/RDD/RemoteDeviceDriver");

const EventEmitter = require("events");

let proxy;

/**
 * Use the Luni device driver proxy methods to talk to a device
 * driver running on a connected Arduino.
 */
class DeviceAPI extends EventEmitter {

/**
 * This DeviceAPI class receives user calls to common device driver API
 * methods and translates them to the appropriate device driver calls and
 * forwards them on using Firmata.  The resulting callbacks are captured and
 * translated to events that the caller can act on.
 *
 * @param  {object} opts Options
 */
  constructor(opts) {
    super();
    this.proxy = opts.driver;
    this.firmataBoard = this.proxy.board;
  }

  /**
   * Open the specified unit
   *
   * @param  {[type]} unitName [description]
   * @param  {[type]} flags    [description]
   * @param  {[type]} opts     [description]
   * @return {[type]}          [description]
   */
  open(unitName, flags, opts) {
    log.trace(`open(${unitName})`);
    this.proxy.open(unitName, flags, opts,(response) => {
      log.trace(`proxy.open(${response.unitName}) callback invoked for API open().`);
      if (response.status >= 0) {
        this.emit("open",{status : RDD.SC.ESUCCESS.val, unitName : response.unitName, handle : response.handle});
      } else {
        this.emit("error",{status : response.status, unitName : response.unitName});
      }
    });
  }

  /**
   * Read data from the specified unit and register.
   *
   * @param  {[type]}   handle   [description]
   * @param  {[type]}   flags    [description]
   * @param  {[type]}   reg      [description]
   * @param  {[type]}   count    [description]
   * @event read            [description]
   */
  read(handle, flags, reg, count) {
    this.proxy.read(handle, flags, reg, count,(response) => {
      log.trace(`proxy.read(${response.handle}) callback invoked for API read().`);
      if (response.status >= 0) {
        let result = {
          status : RDD.SC.ESUCCESS.val,
          handle : response.handle,
          register : response.register,
          flags : response.flags,
          data : response.datablock
        };
        this.emit("read",result);
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }

  /**
   * Write data to the specified unit and register.
   *
   * @param  {[type]}   handle   [description]
   * @param  {[type]}   flags    [description]
   * @param  {[type]}   reg      [description]
   * @param  {[type]}   count    [description]
   * @param  {[type]}   data    [description]
   * @event write            [description]
   */
  write(handle, flags, reg, count,data) {
    this.proxy.write(handle, flags, reg, count,data,(response) => {
      log.trace(`proxy.write(${response.handle}) callback invoked for API write().`);
      if (response.status >= 0) {
        let result = {
          status : RDD.SC.ESUCCESS.val,
          handle : response.handle,
          register : response.register,
          flags : response.flags
        };
        this.emit("write",result);
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
        this.emit("close",{status : RDD.SC.ESUCCESS.val, handle : response.handle});
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
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
    this.proxy.read(handle, 0, RDD.CDR.Intervals, 8, (response) => {
      log.trace(`proxy.read(${response.handle}) callback invoked for API setIntervals().`);
      if (response.status >= 0) {
        if (typeof micros === "number") {
          response.datablock.writeUInt32LE(micros,0);
        }
        if (typeof millis === "number") {
          response.datablock.writeUInt32LE(millis,4);
        }
        this.proxy.write(response.handle,RDD.DAF.NONE,RDD.CDR.Intervals,8,response.datablock,(response) => {
          log.trace(`proxy.write(${response.handle}) callback invoked for API setIntervals().`);
          if (response.status >= 0) {
            let result = {
              status : RDD.SC.ESUCCESS.val,
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
 * Set the pin mode to PIN_MODE_DEVICE for the provided pin numbers to claim
 * them for use by a device driver.  Note that this just marks them as being
 * available for a device driver as far as firmata.js thinks about it, and gives
 * the Arduino side a chance to take responsibility for initializing and using
 * the pins.
 *
 * Note: in Firmata, the term "pin mode" refers to the expected usage of the
 * pin, not necessarily to an actual Arduino electrical pin mode. The
 * set pin mode command message in the Firmata protocol provides confirmation
 * to the client that some module on the Arduino will be able to handle
 * transactions in the given mode, and also gives that module a chance to do
 * any configuration that might be required before use.
 *
 * @param  {[type]} handle [description]
 * @param  {[type]} pins   an object with one or two properties: analogPins and
 *                         digitalPins.  The value of each property is a single
 *                         pin number or an array of pin numbers, drawn from
 *                         the analog set [0..15] or the full-range digital
 *                         set [0..total_pins - 1] respectively.
 * @return {[type]}        [description]
 */
claimDevicePins(handle, pins) {
  let pinArray = [];
  if (pins.hasOwnProperty("digitalPins")) {
    if (Array.isArray(pins.digitalPins)) {
      pinArray = Array.from(pins.digitalPins);
    } else {
      pinArray.push(pins.digitalPins);
    }
  }
  if (pins.hasOwnProperty("analogPins")) {
    if (Array.isArray(pins.analogPins)) {
      for (let idx=0; idx<pins.analogPins.length; idx++) {
        pinArray.push(this.firmataBoard.analogPins[pins.analogPins[idx]]);
      }
    } else {
      pinArray.push(pins.analogPins);
    }
  }

  log.trace(`claimDevicePins() has created this array of digital pin numbers: ${pinArray}.`);

  if (pinArray.length === 0) {
    this.emit("error",{status: RDD.SC.EINVAL.val, handle: handle});
  } else {
    for (let dPin of pinArray) {
      this.firmataBoard.pinMode(dPin,RDD.PIN_MODE_DEVICE);
    }
  }
}

clip(value, rangeMinMax) {
  return Math.max(rangeMinMax[0],Math.min(value,rangeMinMax[1]));
}


}

module.exports.DeviceAPI = DeviceAPI;
module.exports.RDD = RDD;
