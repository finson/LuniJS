// This module exercises the high-level API interface to a DDHello
// Luni device driver running on a remote Arduino under Firmata.
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
const log = log4js.getLogger(thisModule);
log.setLevel('TRACE');

const firmata = require("firmata");

const portName = "COM46";

/**
 * Exercise the HelloAPI module and a Firmata-attached Arduino with
 * a DDHello LuniLib device driver.
 */

let hook = {
  cbNewBoard: function() {
    log.debug(`Board is ready.`);
  }
};

const opts = {};
const fbrd = new firmata.Board(portName,opts,hook.cbNewBoard);

// opts = {unit:"HW:0", board: fbrd};
// const api = new HelloAPI(opts);

// api.getGreeting(response);

// Console.log(response);

// api.close();



