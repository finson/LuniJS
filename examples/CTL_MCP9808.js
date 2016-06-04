// This module defines a johnny-five Controller object for use with the
// J-5 Thermometer Component and a DDMCP9808 temperature sensor device
// driver on an Arduino.
//
// This program is strict-mode throughout.
//
// Doug Johnson, April 2016

const log4js = require("log4js");
const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('DEBUG');

const API = require("../lib/MCP9808API");
const RDD = API.RDD;

const five = require("johnny-five");
const Sequencer = require("../lib/Sequencer").Sequencer;

const ctl = {};

/**
 * Create a CTL_MCP9808 Controller object for use with a Thermometer Component.
 *
 * @param custom.unit Logical unit name and number.  default "MCP9808:0"
 * @param custom.flags flags for device open.  default ForceOpen
 * @param freq Update period in milliseconds.  default : 250
 * @param board the Board object to use.  default five.Board.mount()
 */
let CTL_MCP9808 = {

  initialize: {
    value: function(opts, datahandler) {
      let handle = 0;

      let board = opts.board || five.Board.mount();

      let unitName = opts.custom.unit || "MCP9808:0";
      let openFlags = opts.custom.flags || 1;
      let openOpts = opts.custom.opts || 0;
      let freq = opts.freq || 250;

      let proxyRDD = new RDD.RemoteDeviceDriver({board: board});
      log.debug(`RemoteDeviceDriver is created.`);

      let api = new API.MCP9808API({driver : proxyRDD});
      log.debug(`MCP9808API is created.`);

      api.on("read-continuous", (apiResult) => {
        log.trace(`${unitName} says temp is ${apiResult.C}°C, ${apiResult.F}°F, ${apiResult.K}°K.`);
        datahandler(apiResult.C);
      });

      let seq = new Sequencer(api,["open", "read", "write", "close", "read-continuous"],{});
      log.debug(`Sequencer is created.`);

      seq.on("error", (apiError) => {
        log.error(`Error ${RDD.SC[apiError.status].sym} (${apiError.status}) ${RDD.SC[apiError.status].msg}.`);
      });

      seq.on("done", (apiResult) => {
          log.debug(`Initialization steps completed.`);
        }
      );


      let step = [

        (apiResult) => {
          log.debug(`Begin MCP9808 controller initialization processing.`);
          api.open(unitName,RDD.DAF.FORCE,0);
        },

        (apiResult) => {
          log.trace(`Opened ${apiResult.unitName} with handle ${apiResult.handle}.`);
          handle = apiResult.handle;
          api.setHighPower(handle);
        },

        (apiResult) => {
          log.trace(`High power (continuous conversion) set.`);
          api.setIntervals(handle,null,freq);
        },

        (apiResult) => {
          log.trace(`Report interval has been set.`);
          api.readContinuousTempC(handle);
        },

        (apiResult) => {
          log.debug(`Continuous temperature reading started.`);
        }
      ];

      seq.start(step);
    }
  }
};


module.exports = {CTL_MCP9808};
