// This module exercises the high-level API interface to a DDHello
// Luni device driver running on a remote Arduino under Firmata.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016

const log4js = require("log4js");

const RDD = require("../lib/RemoteDeviceDriver");

const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('INFO');

const firmata = require("firmata");
const RDDAPI = require("../lib/HelloAPI");

const portName = "COM46";
const unitName = "Hello:0";

let api;
let handle;
const lastLoop = 3;
let loopIndex = 0;

let hook = [];

// 0.  Process board ready event, begin open() query

hook.push(() => {
    log.debug(`Board is ready.`);
    opts = {board: fbrd};
    api = new RDDAPI.HelloAPI(opts);
    api.open(unitName,1,0,hook[1]);
  });

// 1.  Process open() response, begin getGreeting query

hook.push((response) => {
    if (response.status >= 0) {
      log.debug(`Status value from open() is ${response.status}`);
      handle = response.status;
      api.getGreeting(handle,hook[2]);
    } else {
      log.error(`Error value from open() is ${response.status}`);
    }
  });

// 2.  Process getGreeting response, loop getGreeting query a few times, then
//      initiate setGreeting

hook.push((response) => {
    if (response.status >= 0) {
      log.debug(`Status value from getGreeting() is ${response.status}`);
      log.info(`${unitName} says ${response.datablock}`);
      if (++loopIndex < lastLoop) {
        api.getGreeting(handle,hook[2]);
      } else {
        loopIndex = 0;
        api.setGreeting(handle, "blah, blah",hook[3]);
      }
    } else {
      log.error(`Error value from getGreeting() is ${response.status}`);
    }
  });

// 3.  Process setGreeting response, then initiate setInterval

hook.push((response) => {
    if (response.status >= 0) {
      log.debug(`Status value from setGreeting() is ${response.status}`);
      api.setInterval(handle,1000,hook[4]);
    } else {
      log.error(`Error value from setGreeting() is ${response.status}`);
    }
  });

// 4.  Process setInterval response, then initiate beginContinuousGreeting

hook.push((response) => {
    if (response.status >= 0) {
      log.debug(`Status value from setInterval() is ${response.status}`);
      api.beginContinuousGreeting(handle,hook[5]);
    } else {
      log.error(`Error value from setInterval() is ${response.status}`);
    }
  });

// 5.  Process beginContinuousGreeting response, loop getContinuousGreeting a
//     few times, then initiate setGreeting again.

hook.push((response) => {
    if (response.status >= 0) {
      log.debug(`Status value from getContinuousGreeting() is ${response.status}`);
      log.info(`${unitName} says ${response.datablock}`);

      switch (++loopIndex) {
        case lastLoop-1:
          api.setGreeting(handle, "Goodbye, until we meet again",hook[6]);
          break;

        case lastLoop:
          api.close(handle,0,hook[7]);
          break;
      }
    } else {
      log.error(`Error value from getContinuousGreeting() is ${response.status}`);
    }
  });

// 6.  Process setGreeting response

hook.push((response) => {
    if (response.status >= 0) {
      log.debug(`Status value from setGreeting() is ${response.status}`);
    } else {
      log.error(`Error value from setGreeting() is ${response.status}`);
    }
  });

// 7.  Process close() response

hook.push((response) => {
    if (response.status >= 0) {
      log.debug(`Status value from close() is ${response.status}`);
    } else {
      log.error(`Error value from close() is ${response.status}`);
    }
  });

let opts = {};
const fbrd = new firmata.Board(portName,opts,hook[0]);
