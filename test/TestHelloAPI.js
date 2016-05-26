// This module exercises the high-level API interface to a DDHello
// Luni device driver running on a remote Arduino under Firmata.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016

const log4js = require("log4js");

const RDD = require("../lib/RemoteDeviceDriver");
const RDDErr = require("../lib/RDDStatus");
const RDDCmd = require("../lib/RDDCommand");
const RDDAPI = require("../lib/HelloAPI");

const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('TRACE');

const firmata = require("firmata");
const EventEmitter = require('events');

const portName = "COM46";
const unitName = "Hello:0";

let firmataBoard;
let proxyRDD;
let api;
let sequencer = new EventEmitter();

let handle;
let pc;
let opts;

// Set up

const init = () => {
  opts = {};
  firmataBoard = new firmata.Board(portName,opts,() => {
    log.debug(`Board is ready.`);

    opts = {board: firmataBoard};
    proxyRDD = new RDD.RemoteDeviceDriver(opts);
    log.debug(`RemoteDeviceDriver is ready.`);

    api = new RDDAPI.HelloAPI({driver : proxyRDD});
    log.debug(`HelloAPI is created.`);

    api.on("error", (apiError) => {
      log.error(apiError);
    });

    api.on("open", (apiResult) => {
      handle = apiResult.handle;
      sequencer.emit("step",apiResult);
    });

    api.on("read",(apiResult) => {
      sequencer.emit("step",apiResult);
    });

    api.on("write",(apiResult) => {
      sequencer.emit("step",apiResult);
    });

    api.on("close",(apiResult) => {
      sequencer.emit("step",apiResult);
    });

    sequencer.on("step", (apiResult) => {
      if (++pc < step.length) {
       step[pc](apiResult);
      } else {
        log.info(`Completed all steps.  Goodbye.`);
        firmataBoard.transport.close();
      }
    });

  pc = 0;
  step[0](null);
  });
};

// Everything has been opened and we have a handle by the time this step
// sequence is started.  Assuming that each of the following step functions
// will result in one of the events captured above, we will progress through
// the following async steps in order.

let step = [

(apiResult) => {
  log.info(`${pc}: Begin step processing.`);
  api.open(unitName,RDDCmd.DAF.FORCE,0);
},

(apiResult) => {
  log.info(`${pc}: Opened ${apiResult.unitName} with handle ${apiResult.handle}.`);
  api.getGreeting(handle);
},

(apiResult) => {
  log.info(`${pc}: ${unitName} says ${apiResult.data}`);
  api.getGreeting(handle);
},

(apiResult) => {
  log.info(`${pc}: ${unitName} says ${apiResult.data}`);
  api.setGreeting(handle, "blah, blah");
},

(apiResult) => {
  log.info(`${pc}: New greeting has been set.`);
  api.getGreeting(handle);
},

(apiResult) => {
  log.info(`${pc}: ${unitName} says ${apiResult.data}`);
  api.setIntervals(handle,null,1000);
},

(apiResult) => {
  log.info(`${pc}: New intervals have been set.`);
  api.close(handle);
},

(apiResult) => {
  log.info(`${pc}: Closed handle ${apiResult.handle}.`);
  sequencer.emit("step",apiResult);
}
];

// Start the engine running

init();

// // 4.  Process setInterval response, then initiate beginContinuousGreeting

// hook.push((response) => {
//     if (response.status >= 0) {
//       log.debug(`Status value from setInterval() is ${response.status}`);
//       api.beginContinuousGreeting(handle,hook[5]);
//     } else {
//       log.error(`Error value from setInterval() is ${response.status}`);
//     }
//   });

// // 5.  Process beginContinuousGreeting response, loop getContinuousGreeting a
// //     few times, then initiate setGreeting again.

// hook.push((response) => {
//     if (response.status >= 0) {
//       log.debug(`Status value from getContinuousGreeting() is ${response.status}`);
//       log.info(`${unitName} says ${response.datablock}`);

//       switch (++loopIndex) {
//         case lastLoop-1:
//           api.setGreeting(handle, "Goodbye, until we meet again",hook[6]);
//           break;

//         case lastLoop:
//           api.close(handle,0,hook[7]);
//           break;
//       }
//     } else {
//       log.error(`Error value from getContinuousGreeting() is ${response.status}`);
//     }
//   });
