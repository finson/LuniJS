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
const RDDAPI = require("../lib/AbstractAPI");

const path = require("path");
const thisModule = path.basename(module.filename,".js");
const logger = log4js.getLogger(thisModule);
logger.setLevel('TRACE');

/**
 * Use the Luni device driver proxy to talk to a DDHello device
 * driver running on a connected Arduino.
 */
class HelloAPI extends RDDAPI.AbstractAPI {

/**
 * This class receives user calls to HelloAPI methods and translates
 * them to the appropriate device driver calls and forwards them on using
 * Firmata.
 * @param  {object} opts Options associated with this
 */
  constructor(opts) {
    super(opts);

      const rdd = {};

      const REG = {
        INTERJECTION : 256,
        OBJECT : 257
      };

      rdd.reg = REG;
      rdd.openFlags = opts.flags || 1;
      rdd.openOpts = opts.opts || 0;
      rdd.unit = opts.unit || "Hello:0";
      rdd.board = opts.board;
      rdd.handle = 0;
    }
}

module.exports = {HelloAPI};
