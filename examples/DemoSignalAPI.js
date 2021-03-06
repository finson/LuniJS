// This module exercises the high-level API interface to a DDSignal
// Luni device driver running on a remote Arduino under Firmata.
//
// This program is strict-mode throughout.
//
// Doug Johnson, June 2016


const log4js = require("log4js");
const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('TRACE');

const API = require("../lib/SignalAPI");
const RDD = API.RDD;

const Sequencer = require("../lib/Sequencer").Sequencer;
const firmata = require("firmata");

const portName = "COM40";
const unitName = "GPIO:0";
const exitAtEnd = false;

let firmataBoard;
let proxyRDD;
let api;

let seq;

let handle;
let pc;
let opts;

// Pin numbers for Analog Input are analog pin numbers [0..15]
// Pin numbers for other combinations are full-range digital pin numbers [0..TotalPins-1]

const inputChannels = [
  {op: API.OP.ANALOG, config: API.CONFIG.INPUT, analogPin: 6},    // pot 0
  {op: API.OP.ANALOG, config: API.CONFIG.INPUT, analogPin: 7},    // pot 1
  {op: API.OP.DIGITAL, config: API.CONFIG.INPUT, digitalPin: 5},  // sw 0
  {op: API.OP.ANALOG, config: API.CONFIG.INPUT, analogPin: 8},    // pot 2
  {op: API.OP.ANALOG, config: API.CONFIG.INPUT, analogPin: 9},    // pot 3
  {op: API.OP.DIGITAL, config: API.CONFIG.INPUT_PULLUP, digitalPin: 10}    // button 0
 ];

const showPins = () => {
  log.debug(`Analog pins: ${firmataBoard.analogPins}`);
  log.debug(`All pins:`);
  for (let p=0; p<firmataBoard.pins.length; p++) {
    let thePin = firmataBoard.pins[p];
    let theAnalogPin = (thePin.analogChannel !== 127) ? thePin.analogChannel : '..';
    let currentModeAndValue = '';
    if (typeof thePin.mode !== 'undefined') {
      currentModeAndValue = `, cur: m ${thePin.mode}, v ${thePin.value}`;
    }
    log.debug(`${p} [${theAnalogPin}] avail: ${thePin.supportedModes}${currentModeAndValue}`);
  }
};

// Set up

const init = () => {
  opts = {skipCapabilities: false};
  firmataBoard = new firmata.Board(portName,opts,() => {
    log.debug(`Board is ready.`);

    opts = {board: firmataBoard};
    proxyRDD = new RDD.RemoteDeviceDriver(opts);
    log.debug(`RemoteDeviceDriver is ready.`);

    api = new API.SignalAPI({driver : proxyRDD});
    log.debug(`SignalAPI is created.`);

    seq = new Sequencer(api,["open", "read", "write", "close", "read-continuous"]);
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
  showPins();
  api.open(unitName,RDD.DAF.FORCE,0);
},

(apiResult) => {
  log.info(`Opened ${apiResult.unitName} with handle ${apiResult.handle}.`);
  handle = apiResult.handle;
  api.setChannelList(handle, API.DIR.INPUT, inputChannels);
},

(apiResult) => {
  log.debug(`Channel descriptors written: ${inputChannels}`);
  api.readOneScan(handle);
},

(apiResult) => {
  log.debug(`One scan of data read. ${apiResult.data.length} values.`);
  log.debug(`Data values: ${apiResult.data}`);
  showPins();
  api.setIntervals(handle,null,1000);
},

(apiResult) => {
  log.info(`New intervals have been set.`);
  api.readContinuousScans(handle);
},

(apiResult) => {
  log.info(`Continuous scanning started.`);
  if (exitAtEnd) {
    api.close(handle);
  } else {
    api.on("read-continuous", (apiResult) => {
      log.info(`${unitName} says ${apiResult.data}`);
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

log.info(`Program ${thisModule} is running.`);
init();
