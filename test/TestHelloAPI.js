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
const RDDAPI = require("../lib/HelloAPI");

const portName = "COM46";

let api;
let handle;

let hook = {

  cbNewBoard: function() {
    log.debug(`Board is ready.`);
    opts = {board: fbrd};
    api = new RDDAPI.HelloAPI(opts);
    api.open("Hello:0",1,0,hook.cbOpen);
  },

  cbOpen: function(response) {
    if (response.status >= 0) {
      log.debug(`Status value from open() is ${response.status}`);
      handle = response.status;
      api.close(handle,0,hook.cbClose);
    } else {
      log.error(`Error value from open() is ${response.status}`);
    }
  },

  cbClose: function(response) {
    if (response.status >= 0) {
      log.debug(`Status value from close() is ${response.status}`);
    } else {
      log.error(`Error value from open() is ${response.status}`);
    }
  }
};

let opts = {};
const fbrd = new firmata.Board(portName,opts,hook.cbNewBoard);

// api.getGreeting(response);

// Console.log(response);
