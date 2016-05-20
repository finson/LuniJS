// This module provides a high-level API interface to a Luni device driver
// running on a remote Arduino under Firmata.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016

const log4js = require("log4js");

const RDD = require("../lib/RemoteDeviceDriver");
const rddErr = require("../lib/RDDStatus");
const rddCmd = require("../lib/RDDCommand");

const path = require("path");
const thisModule = path.basename(module.filename,".js");
const logger = log4js.getLogger(thisModule);
logger.setLevel('TRACE');

/**
 * Use the Luni device driver proxy methods to talk to a device
 * driver running on a connected Arduino.
 */
class AbstractAPI extends RDD.RemoteDeviceDriver {

/**
 * This AbstractAPI class receives user calls to common device driver API
 * methods and translates them to the appropriate device driver calls and
 * forwards them on using Firmata.
 * @param  {object} opts Options associated with this
 */
  constructor(opts) {
      super(opts);
      const rdd = {};
      rdd.hook = {

      // Open response

      open: function (response) {
        logger.trace(`open() response hook invoked. (open(${rdd.unit}) response)`);
        if (response.status < 0) {
          throw new Error(`Open error: ${response.status}.`);
        } else {
          logger.debug(`Status value from open() is ${response.status}`);
          rdd.handle = response.status;
        }
      },

      // Read response

      read: function (response) {
        logger.trace(`read() response hook invoked.`);
        if (response.status < 0) {
          throw new Error(`Read error: ${response.status}.`);
        } else {
          logger.debug(`Status value from read() is ${response.status}`);
        }
      },

        // Write response

      write: function (response) {
        logger.trace(`write() response hook invoked.`);
        if (response.status < 0) {
          throw new Error(`Write error: ${response.status}.`);
        } else {
          logger.debug(`Status value from Write() is ${response.status}`);
        }
      },

        // Close response

      close: function (response) {
        logger.trace(`close() response hook invoked.`);
        if (response.status < 0) {
          throw new Error(`Close error: ${response.status}.`);
        } else {
          logger.debug(`Status value from Close() is ${response.status}`);
        }
      }
    };
  }
}

module.exports = {AbstractAPI};
