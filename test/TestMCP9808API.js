// This module exercises the high-level API interface to a DDMCP9808
// Luni device driver running on a remote Arduino under Firmata.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016


const log4js = require("log4js");
const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('TRACE');

const API = require("../lib/MCP9808API");
const RDD = API.RDD;

const Sequencer = require("./Sequencer").Sequencer;
const firmata = require("firmata");

const portName = "COM42";
const unitName = "MCP9808:0";
const exitAtEnd = false;

let firmataBoard;
let proxyRDD;
let api;

let seq;

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

    api = new API.MCP9808API({driver : proxyRDD});
    log.debug(`MCP9808API is created.`);

    seq = new Sequencer(api,["open", "read", "write", "close", "read-continuous"],{});
    log.debug(`Sequencer is created.`);

    seq.on("error", (apiError) => {
      log.error(`Error ${RDD.SC[apiError.status].sym} (${apiError.status}) ${RDD.SC[apiError.status].msg}.`);
    });

    seq.on("done", (apiResult) => {
          if (exitAtEnd) {
            log.info(`Goodbye.`);
            firmataBoard.transport.close();
          } else {
            log.info(`Steps completed.`);
          }
        }
    );

  seq.start(step);
  });
};

// Everything has been opened and we have a handle by the time this step
// sequence is started.  Assuming that each of the following step functions
// will result in one of the events captured above, we will progress through
// the following async steps in order.

let step = [

(apiResult) => {
  log.info(`Begin step processing.`);
  api.open(unitName,RDD.DAF.FORCE,0);
},

(apiResult) => {
  log.info(`Opened ${apiResult.unitName} with handle ${apiResult.handle}.`);
  handle = apiResult.handle;
  api.setHighPower(handle);
},

(apiResult) => {
  log.info(`High power (continuous conversion) set.`);
  api.readTempC(handle);
},

(apiResult) => {
  log.info(`${unitName} says temp is ${apiResult.C}°C`);
  api.setIntervals(handle,null,1000);
},

(apiResult) => {
  log.info(`New intervals have been set.`);
  api.readContinuousTempC(handle);
},

(apiResult) => {
  log.info(`${unitName} says temp is ${apiResult.C}°C, ${apiResult.F}°F, ${apiResult.K}°K.`);
  log.info(`Continuous temperature reading started.`);
  if (exitAtEnd) {
    api.close(handle);
  } else {
    api.on("read-continuous", (apiResult) => {
      log.info(`${unitName} says temp is ${apiResult.C}°C, ${apiResult.F}°F, ${apiResult.K}°K.`);
    });
  }
},

(apiResult) => {
  if (apiResult.eventType === "close") {
    log.info(`Closed handle ${apiResult.handle}.  Goodbye.`);
    firmataBoard.transport.close();
  }
}
];

// Start the engine running

init();
