// This module exercises the high-level API interface to a DDMeta
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

const API = require("../lib/MetaAPI");
const RDD = API.RDD;

const Sequencer = require("../lib/Sequencer").Sequencer;
const firmata = require("firmata");

const portName = "COM46";
const unitName = "Meta:0";
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
  opts = {skipCapabilities: true};
  firmataBoard = new firmata.Board(portName,opts,() => {
    log.debug(`Board is ready.`);

    opts = {board: firmataBoard};
    proxyRDD = new RDD.RemoteDeviceDriver(opts);
    log.debug(`RemoteDeviceDriver is ready.`);

    api = new API.MetaAPI({driver : proxyRDD});
    log.debug(`MetaAPI is created.`);

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
  api.getDriverCount(handle);
},

(apiResult) => {
  let d0 = unitName;
  let d1 = (api.result === 1) ? "is " : "are ";
  let d2 = String(apiResult.data);
  let d3 = (api.result === 1) ? " " : "s ";

  let text = d0.concat(" says that there ",d1, d2, " device driver",d3, "installed.");
  log.info(text);
  api.close(handle);
},

(apiResult) => {
  if (apiResult.eventType === "close") {
    log.info(`Closed handle ${apiResult.handle}.  Goodbye.`);
    firmataBoard.transport.close();
  }
}
];

// Start the engine running

log.info(`Program ${thisModule} is running.`);
init();
