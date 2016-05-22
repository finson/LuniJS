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
 * forwards them on using Firmata.  [Or it will when actually implemented!
 * Right now it's just a base for the API classes to extend so that common
 * methods can be added easily later on.]
 *
 * @param  {object} opts Options
 */
  constructor(opts) {
      super(opts);
  }
}

module.exports = {AbstractAPI};
