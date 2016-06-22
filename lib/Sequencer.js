// This module provides a simple tool for stepping through a sequence of
// asynchronous operations.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016

const EventEmitter = require("events");
const log4js = require("log4js");

const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('INFO');

class Sequencer extends EventEmitter {

// ["open", "read", "write", "close", "read-continuous"]

/**
 * Initialize sequencer object.
 *
 * @param  {[type]} api    [the event emitter whose results we are listening to]
 * @param  {[type]} events [array of event names that trigger a step]
 * @param  {[type]} opts   [description]
 */
constructor(api, events) {
  super();
  api.on("error", (apiError) => {
    this.emit("error",apiError);
  });

  function makeEventListener(seq,evtName) {
    return function(apiResult) {
      apiResult.eventType = evtName;
      seq.next(apiResult);
    };
  }

  for (let name of events) {
    api.on(name, makeEventListener(this, name));
  }
}

/**
 * Execute the first step in the given sequence.
 *
 * @param  {[type]} steps [array of single argument functions to be executed]
 * @return {[type]}       [description]
 */
  start(stepsArray) {
    this.step = stepsArray;
    this.pc = 0;
    log.debug(`${this.pc}: First step.`);
    this.step[0](null);
  }

/**
 * Invoked after an api event has been captured.  Begins execution of the next
 * asynchronous step in the list.
 *
 * @param  {[type]}   apiResult [the result associated with the last event]
 */
  next(apiResult) {
    if (this.pc !== this.step.length) {
      this.pc += 1;
      if (this.pc < this.step.length) {
        log.debug(`${this.pc}: Next step.`);
        this.step[this.pc](apiResult);
      } else {
        log.debug(`${this.pc}: Completed all steps.`);
        this.emit("done");
      }
    }
  }
}

module.exports.Sequencer = Sequencer;
