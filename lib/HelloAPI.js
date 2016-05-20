// This module provides a high-level API interface to a Luni device driver
// running on a remote Arduino under Firmata.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016

const log4js = require("log4js");

const RDD = require("../RemoteDeviceDriver");
const rddErr = require("../RDDStatus");
const rddCmd = require("../RDDCommand");

const path = require("path");
const thisModule = path.basename(module.filename,".js");
const logger = log4js.getLogger(thisModule);
logger.setLevel('TRACE');

/**
 * Use the Luni device driver proxy to talk to a DDHello device
 * driver running on a connected Arduino.
 */
class HelloAPI extends AbstractAPI {

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

      rdd.reg = reg;
      rdd.openFlags = opts.custom.flags || 1;
      rdd.openOpts = opts.custom.opts || 0;
      rdd.unit = opts.custom.unit || "MCP9808:0";
      rdd.board = opts.board || five.Board.mount();
      rdd.handle = 0;
      dd.open(rdd.unit,rdd.openFlags,rdd.openOpts, rdd.hook[0]);
    }
}

module.exports = {HelloAPI};
