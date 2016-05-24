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
const logger = log4js.getLogger(thisModule);
logger.setLevel('TRACE');

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

    // Prepare to receive an open() response

    this.cbOpen = function(response) {
      logger.trace(`Open() callback invoked.`);
      if (response.status >= 0) {
        this.emit("open",{unitName:"response.something", handle: response.handle});
      } else {
        logger.error(`Error value from open() is ${response.status}`);
      }
    }.bind(this);
  }
    // Send the open() query message

  open(unitName, flags, opts) {
    this.proxy.open(unitName, flags, opts, this.cbOpen);
  }
}


module.exports = {AbstractAPI};
