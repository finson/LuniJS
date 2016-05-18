// This module defines a Johnny-Five Controller object for use with the
// J-5 Servo Component and a DDServo device driver on an Arduino.
//
//
// This program is strict-mode throughout.
//
// Doug Johnson, April 2016

const log4js = require("log4js");
const five = require("johnny-five");

const RDD = require("../RemoteDeviceDriver");
const rddErr = require("../RDDStatus");
const rddCmd = require("../RDDCommand");

const path = require("path");
const thisModule = path.basename(module.filename,".js");
const logger = log4js.getLogger(thisModule);
logger.setLevel('TRACE');

/**
 * Create a Servo_RDD Controller object for use with a Servo Component.
 */
let Servo_RDD = {

  initialize: {
    value: function(opts) {
      // Can an externally defined Controller get at the state Map
      // defined in the associated Component?
      // let state = five.Servo.priv.get(this);
      // I'll use a single property 'rdd' instead ...
      this.rdd = {};

      let reg = {
        PIN: 256,
        RANGE_MICROSECONDS: 257,
        POSITION_DEGREES: 258,
        POSITION_MICROSECONDS: 259
      };
      this.rdd.reg = reg;

      this.rdd.openFlags = opts.custom.flags || 1;
      this.rdd.unit = opts.custom.unit || "Servo:0";
      this.rdd.board = opts.board || five.Board.mount();

      logger.trace(`Mode check: isServo(${this.pin}) is ${this.board.pins.isServo(this.pin)}`);

      let dd =  new RDD.RemoteDeviceDriver({board: this.rdd.board, skipCapabilities: false});
      this.rdd.dd = dd;
      this.rdd.handle = 0;
      dd.open(this.rdd.unit,this.rdd.openFlags,(response) => {
        logger.trace(`Callback openCB invoked.`);
        if (response.status >= 0) {
          logger.debug(`Status value from open() is ${response.status}`);
          this.rdd.handle = response.status;
          dd.read(this.rdd.handle,rddCmd.CDR.DriverVersion,256,(response) => {
            logger.trace(`readCB callback invoked.`);
            if (response.status >= 0) {
              logger.debug(`Status value from read() is ${response.status}`);
              this.rdd.sv = new rddCmd.SemVer(response.datablock);
              logger.info(`DeviceDriver '${this.rdd.sv.toString()}' is open on logical unit '${this.rdd.unit}' with handle ${this.rdd.handle}`);
              dd.write(this.rdd.handle,reg.PIN,2,[this.pin,0],(response) => {
                logger.trace(`writeCB callback invoked after setting pin = ${this.pin}.`);
                if (response.status >= 0) {
                  logger.debug(`Status value from write() is ${response.status}`);
                  logger.info(`Logical unit '${this.rdd.unit}' (handle ${this.rdd.handle}) is attached to pin ${this.pin}.`);
                  this.rdd.board.emit("servo_initialized");
                } else {
                  logger.error(`Error value from write() is ${response.status}`);
                }
              });
            } else {
              logger.error(`Error value from read() is ${response.status}`);
            }
          });
        } else {
          logger.error(`Error value from open() is ${response.status}`);
        }
      });
    }
  },

  servoWrite: {
    value: function(pin, degrees) {

      // If servo is already in position there is nothing to do

      if (this.last && this.last.degrees === degrees) {
        return this;
      }

      // make sure pos is an integer value and then put it in a byte buffer

      let pos = degrees | 0;
      let buf = new Buffer(2);
      buf.writeInt16LE(pos,0);

      // Tell servo to move to the new position

      this.rdd.dd.write(this.rdd.handle,this.rdd.reg.POSITION_DEGREES,2,buf,(response) => {
        logger.trace(`writeCB callback invoked after servo move to ${pos} degrees.`);
        if (response.status >= 0) {
          logger.debug(`Status value from write() is ${response.status}`);
        } else {
          logger.error(`Error value from write() is ${response.status}`);
        }
      });

    }
  }
};

module.exports = {Servo_RDD};
