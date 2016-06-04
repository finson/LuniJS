// This module defines a Johnny-Five Controller object for use with the
// J-5 Servo Component and a DDServo device driver on an Arduino.
//
// This program is strict-mode throughout.
//
// Doug Johnson, April 2016

const log4js = require("log4js");
const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('TRACE');

const API = require("../lib/ServoAPI");
const RDD = API.RDD;

const five = require("johnny-five");
const Sequencer = require("../lib/Sequencer").Sequencer;

let api;
let handle;

/**
 * Create a CTL_Servo Controller object for use with a Servo Component.
 */
let CTL_Servo = {

  initialize: {
    value: function(opts) {
      handle = 0;

      let board = opts.board || five.Board.mount();

      let unitName = opts.custom.unit || "Servo:0";
      let openFlags = opts.custom.flags || 1;
      let openOpts = opts.custom.opts || 0;
      let freq = opts.freq || 250;

      let proxyRDD = new RDD.RemoteDeviceDriver({board: board});
      log.debug(`RemoteDeviceDriver is created.`);

      api = new API.ServoAPI({driver : proxyRDD});
      log.debug(`ServoAPI is created.`);

      let seq = new Sequencer(api,["open", "read", "write", "close", "read-continuous"],{});
      log.debug(`Sequencer is created.`);

      seq.on("error", (apiError) => {
        log.error(`Error ${RDD.SC[apiError.status].sym} (${apiError.status}) ${RDD.SC[apiError.status].msg}.`);
      });

      seq.on("done", (apiResult) => {
        log.debug(`Initialization steps completed.`);
      });

      log.trace(`Mode check: isServo(${this.pin}) is ${this.board.pins.isServo(this.pin)}`);

      let step = [

        (apiResult) => {
          log.debug(`Begin Servo controller initialization processing.`);
          api.open(unitName,RDD.DAF.FORCE,0);
        },

        (apiResult) => {
          log.trace(`Opened ${apiResult.unitName} with handle ${apiResult.handle}.`);
          handle = apiResult.handle;
          api.attach(handle, 3);
        },

        (apiResult) => {
          log.trace(`Servo attached to pin ${this.pin}.`);
        }
      ];

      seq.start(step);
    }},

   servoWrite: {
    value: function(pin, degrees) {
      api.to(handle, degrees);
    }
  }
};

module.exports = {CTL_Servo};
