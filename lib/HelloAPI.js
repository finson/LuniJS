// This module provides a high-level API interface to a Luni device driver
// running on a remote Arduino under Firmata.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016

const log4js = require("log4js");

const RDD = require("../lib/RemoteDeviceDriver");
const rddErr = require("../lib/RDDStatus");
const RDDCMD = require("../lib/RDDCommand");
const RDDAPI = require("../lib/AbstractAPI");

const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('INFO');

const REG = {
  INTERJECTION : 256,
  OBJECT : 257
};

let cbSetGreeting = [];
let cbGetGreeting = [];
let cbSetInterval = [];
let cbBeginContinuousGreeting = [];

let words = new Array(2);

/**
 * Use the Luni device driver proxy to talk to a DDHello device
 * driver running on a connected Arduino.
 */
class HelloAPI extends RDDAPI.AbstractAPI {

/**
 * This class receives user calls to HelloAPI methods and translates
 * them to the appropriate device driver calls and forwards them on using
 * Firmata.
 * @param  {object} opts Options associated with this class instance
 */
  constructor(opts) {
    super(opts);

    //--- Define the setGreeting() callback chain

    // 0.  Process Interjection write response, begin Object write query

    cbSetGreeting.push((response) => {
        if (response.status >= 0) {
          log.debug(`Status value from write() is ${response.status}`);
          this.write(response.handle,RDDCMD.DAF.NONE,REG.OBJECT,words[1].length,words[1],cbSetGreeting[1]);
        } else {
          log.error(`Error value from write() is ${response.status}`);
        }
      });

    // 1.  Process Object write response, tell caller we're done

    cbSetGreeting.push((response) => {
        if (response.status >= 0) {
          log.debug(`Status value from write() is ${response.status}`);
        } else {
          log.error(`Error value from write() is ${response.status}`);
        }
        cbSetGreeting.pop()(response);
      });

    //--- Define the getGreeting() callback chain

    cbGetGreeting.push((response) => {
        if (response.status >= 0) {
          log.debug(`Status value from read() is ${response.status}`);
        } else {
          log.error(`Error value from read() is ${response.status}`);
        }
        cbGetGreeting.pop()(response);
      });


    //--- Define the setInterval() callback chain

    cbSetInterval.push((response) => {
        if (response.status >= 0) {
          log.debug(`Status value from write() is ${response.status}`);
        } else {
          log.error(`Error value from write() is ${response.status}`);
        }
        cbSetInterval.pop()(response);
      });

    //--- Define the beginContinuousGreeting() callback chain

    cbBeginContinuousGreeting.push((response) => {
        if (response.status >= 0) {
          log.debug(`Status value from read() is ${response.status}`);
        } else {
          log.error(`Error value from read() is ${response.status}`);
        }
        cbBeginContinuousGreeting.pop()(response);
      });

    }

    /**
     * Set the greeting that this Hello unit should be using.
     * The input greeting string should consist of two words or phrases
     * separated by a comma.  This method cuts the string into two parts
     * around the comma, and sets the Interjection value to the first
     * part, and the Object value to the second part.
     *
     * @param {[type]}   handle   [description]
     * @param {[type]}   greeting [description]
     * @param {Function} callback [description]
     */
    setGreeting(handle, greeting, callback) {
      let commaIndex = greeting.indexOf(',');
      if (commaIndex === -1) {
        words[0] = greeting;
        words[1] = "___";
      } else {
        words[0] = greeting.slice(0,commaIndex);
        words[1] = greeting.slice(commaIndex+1);
      }
      cbSetGreeting.push(callback);
      this.write(handle,RDDCMD.DAF.NONE,REG.INTERJECTION,words[0].length,words[0],cbSetGreeting[0]);
    }

    /**
     * Read the current greeting register.
     *
     * @param  {[type]}   handle   [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    getGreeting(handle, callback) {
      cbGetGreeting.push(callback);
      this.read(handle, 0, RDDCMD.CDR.Stream, 256, cbGetGreeting[0]);
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
      this.write(handle, 0,RDDCMD.CDR.Intervals,8,data,callback);
    }

    /**
     * Initiate a continuous sequence of read responses from the remote driver.
     * There will be an immediate response to the read(), followed by one every
     * time the millisecond interval expires.  Note that if the interval is 0,
     * the default, it will never expire and there will be no responses sent.
     *
     * @param  {[type]}   handle   [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    beginContinuousGreeting(handle,callback){
      cbBeginContinuousGreeting.push(callback);
      this.read(handle, RDDCMD.DAF.MILLI_RUN, RDDCMD.CDR.Stream, 256, callback);
    }
}

module.exports = {HelloAPI};
