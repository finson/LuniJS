// This module provides a high-level API interface to the Luni MCP9808
// temperature sensor device driver running on a remote Arduino under Firmata.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016

const log4js = require("log4js");

const RDD = require("../lib/RemoteDeviceDriver");
const RDDAPI = require("../lib/AbstractAPI");

const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('INFO');

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

let cbReadTempC = [];
let cbBeginContinuousReadTempC = [];
let cbSetHighPower = [];
let cbSetLowPower = [];
let cbIsHighPower = [];

/**
 * Use the Luni device driver proxy to talk to a DDMCP9808
 * device driver running on a connected Arduino.
 */
class MCP9808API extends RDDAPI.AbstractAPI {

/**
 * This class receives user calls to MCP9808API methods and translates
 * them to the appropriate device driver calls and forwards them on using
 * Firmata.
 * @param  {object} opts Options associated with this class instance
 */
  constructor(opts) {
    super(opts);

    //====> Define the readTempC() callback chain

    cbReadTempC.push((response) => {
      cbReadTempC.pop()(response);
    });

    //====> Define the beginContinuousReadTempC() callback chain

    cbBeginContinuousReadTempC.push((response) => {
      cbBeginContinuousReadTempC.pop()(response);
    });

    //====> Define the setHighPower() callback chain

    // 0.  Process read(config) response, begin write(config) query

    cbSetHighPower.push((response) => {
      if (response.status >= 0) {
        response.datablock[1] &= ~SHUTDOWN;
        this.write(response.handle,RDD.DAF.NONE,REG.CONFIG,2,response.datablock,cbSetHighPower[1]);
      } else {
        log.error(`Error value from read(config) is ${response.status}`);
      }
    });

    // 1.  Process write(config) response, tell caller we're done

    cbSetHighPower.push((response) => {
       cbSetHighPower.pop()(response);
    });

    //====> Define the setLowPower() callback chain

    // 0.  Process read(config) response, begin write(config) query

    cbSetLowPower.push((response) => {
      if (response.status >= 0) {
        response.datablock[1] |= SHUTDOWN;
        this.write(response.handle,RDD.DAF.NONE,REG.CONFIG,2,response.datablock,cbSetLowPower[1]);
      } else {
        log.error(`Error value from read(config) is ${response.status}`);
      }
    });

    // 1.  Process write(config) response, tell caller we're done

    cbSetLowPower.push((response) => {
       cbSetLowPower.pop()(response);
    });

    //====> Define the isHighPower() callback chain

    cbIsHighPower.push((response) => {
      if (response.status >= 0) {
      } else {
        log.error(`Error value from read(config) is ${response.status}`);
      }
      cbIsHighPower.pop()(response);
    });
  }

  /**
   * Read the current temperature in degrees C
   *
   * @param  {[type]}   handle   [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  readTempC(handle, callback) {
    cbReadTempC.push(callback);
    this.read(handle, 0, RDD.CDR.Stream, 256, cbReadTempC[0]);
  }

  /**
   * Initiate reception of the current temperature in degrees C at the
   * millisecond interval
   *
   * @param  {[type]}   handle   [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  beginContinuousReadTempC(handle, callback) {
    cbBeginContinuousReadTempC.push(callback);
    this.read(handle, RDD.DAF.MILLI_RUN, RDD.CDR.Stream, 256, cbBeginContinuousReadTempC[0]);
  }

  /**
   * [setHighPower description]
   * @param {[type]}   handle   [description]
   * @param {Function} callback [description]
   */
  setHighPower(handle, callback) {
    cbSetHighPower.push(callback);
    this.read(handle, 0, REG.CONFIG, 256, cbSetHighPower[0]);
  }

  /**
   * [setLowPower description]
   * @param {[type]}   handle   [description]
   * @param {Function} callback [description]
   */
  setLowPower(handle, callback) {
    cbSetLowPower.push(callback);
    this.read(handle, 0, REG.CONFIG, 256, cbSetLowPower[0]);
  }

  /**
   * Set the millisecond interval between continuous reads.
   *
   * @param {[type]}   handle   [description]
   * @param {[type]}   millis   [description]
   * @param {Function} callback [description]
   */
  setInterval(handle, millis,callback) {
    cbSetInterval.push(callback);
    let data = new Buffer(8);
    data.writeUInt32LE(0);
    data.writeUInt32LE(millis,4);
    this.write(handle, 0,RDD.CDR.Intervals,8,data,callback);
  }
}

module.exports = {MCP9808API};
