// This module provides a high-level API interface to the Luni MCP9808
// temperature sensor device driver running on a remote Arduino under Firmata.
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
    CONFIG : 1,
    UPPER_TEMP : 2,
    LOWER_TEMP : 3,
    CRIT_TEMP : 4,
    AMBIENT_TEMP : 5,
    MANUF_ID : 6,
    DEVICE_ID : 7,
    RESOLUTION : 8
  };

  const MASK = {
    SHUTDOWN : 0x1,
    RESERVED : 0xF4,
    HYSTERESIS: 0x6,
    CRITICAL_LOCK: 0x80,
    WINDOW_LOCK: 0x40,
    CLEAR_INTERRUPT: 0x20,
    ALERT_STATUS: 0x10,
    ALERT_CONTROL: 0x8,
    ALERT_SELECT: 0x4,
    ALERT_POLARITY: 0x2,
    ALERT_MODE: 0x1,
    RESOLUTION: 0x3
  };

/**
 * Use the Luni device driver proxy to talk to a DDMCP9808
 * device driver running on a connected Arduino.
 */
class MCP9808API extends API.DeviceAPI {

  constructor(opts) {
    super(opts);
  }

  /**
   * Read the current temperature in degrees C
   *
   * @param  {[type]}   handle   [description]
   */
  readTempC(handle) {
    this.proxy.read(handle, 0, RDD.CDR.Stream, 2, (response) => {
      if (response.status >= 0) {
        this.emit("read",this.buildTemperatureResult(response));
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }

  /**
   * Read the current temperature in degrees C continuously at
   * the millisecond interval.
   *
   * @param  {[type]}   handle   [description]
   */
  readContinuousTempC(handle) {
    this.proxy.read(handle, RDD.DAF.MILLI_RUN, RDD.CDR.Stream, 2,  (response) => {
      if (response.status >= 0) {
        this.emit("read-continuous",this.buildTemperatureResult(response));
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }


  // Actually do the work of reading the temperature and converting it.
  // Private, not part of the public API.

  buildTemperatureResult(response) {
    log.trace(`buildTemperatureResult invoked for API readTempC().`);
    let LSB = response.datablock[0];
    let MSB = response.datablock[1];
    let t = ((((MSB << 8) | (LSB)) & 0x1FFF) << 3);
    t = t / 128;
    let result = {};
    result.status = RDD.SC.ESUCCESS.val;
    result.handle = response.handle;
    result.celsius = result.C = Math.round(100*t)/100;
    result.fahrenheit  = result.F = Math.round(100 * ((t * 1.8) + 32)) / 100;
    result.kelvin = result.K =  Math.round(100 * (t + 273.15)) / 100;
    return result;
  }

  /**
   * Turn on continuous conversion mode.
   *
   * @param {[type]}   handle   [description]
   */
  setHighPower(handle) {
    this.setShutdown(handle, false);
  }

  /**
   * Turn off all power-consuming activities.
   *
   * @param {[type]}   handle   [description]
   */
  setLowPower(handle) {
    this.setShutdown(handle, true);
  }

  // Actually do the work of power on/off.
  // Private, not part of the public API.

  setShutdown(handle,turnItOff) {
    this.proxy.read(handle, 0, REG.CONFIG, 2, (response) => {
      if (response.status >= 0) {
        if (turnItOff) {
          response.datablock[1] |= MASK.SHUTDOWN;
        } else {
          response.datablock[1] &= ~MASK.SHUTDOWN;
        }
        this.proxy.write(response.handle,RDD.DAF.NONE,REG.CONFIG,2,response.datablock,(response) => {
          if (response.status >= 0) {
            this.emit("write",{status : RDD.SC.ESUCCESS.val, handle : response.handle});
          } else {
            this.emit("error",{status : response.status, handle : response.handle});
          }
        });
      } else {
        log.error(`Error value from read(config) is ${response.status}`);
      }
    });
  }

}

module.exports.MCP9808API = MCP9808API;
module.exports.RDD = RDD;
