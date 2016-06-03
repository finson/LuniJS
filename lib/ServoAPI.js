// This module provides a high-level API interface to the Luni Servo
// device driver running on a remote Arduino under Firmata.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016

const log4js = require("log4js");
const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('DEBUG');

const API = require("../lib/DeviceAPI");
const RDD =  API.RDD;

const REG = {
    PIN : 256,
    RANGE_MICROSECONDS : 257,
    POSITION_DEGREES : 258,
    POSITION_MICROSECONDS : 259
  };

/**
 * Use the Luni device driver proxy to talk to the
 * device driver running on a connected Arduino.
 */
class ServoAPI extends API.DeviceAPI {

  constructor(opts) {
    super(opts);
  }

  /**
   * Configure a servo motor after opening a logical unit for communication.
   *
   * @param  {[type]} handle [description]
   * @param  {[type]} pin    [description]
   * @param  {[type]} opts   range : range of motion in degrees
   *                         startAt : any number within range
   */
  attach(handle, pin, opts) {
    let options = opts || {};
    this.startAt = options.startAt || 90;
    this.range = options.range || [0, 180];
    this.position = this.clip(this.startAt,this.range);

    let buf  = new Buffer(2);
    buf.writeInt16LE(pin,0);
    this.proxy.write(handle,RDD.DAF.NONE,REG.PIN,2,buf,(response) => {
      log.trace(`Write(h = ${response.handle}, pin=${pin}) callback invoked for ServoAPI attach().`);
      if (response.status >= 0) {
        buf.writeInt16LE(this.position,0);
        this.proxy.write(response.handle,RDD.DAF.NONE,REG.POSITION_DEGREES,2,buf,(response) => {
          log.trace(`Write(h = ${response.handle}, pos=${this.position}) callback invoked for ServoAPI attach().`);
          if (response.status >= 0) {
            let result = {
              status : RDD.SC.ESUCCESS.val,
              handle : response.handle,
              register : response.register,
              flags : response.flags
            };
            this.emit("write",result);
          } else {
            this.emit("error",{status : response.status, handle : response.handle});
          }
        });
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }


  /**
   * Move the servo to the given position in degrees, within the limits of
   * the allowable range.
   *
   * @param  {[type]}   handle   [description]
   * @param  {[type]} degrees [description]
   */
  to(handle,degrees) {
    this.position = this.clip(degrees, this.range);
    let buf  = new Buffer(2);
    buf.writeInt16LE(this.position,0);
    this.proxy.write(handle,RDD.DAF.NONE,REG.POSITION_DEGREES,2,buf,(response) => {
      log.trace(`Write(h = ${response.handle}, pos=${this.position}) callback invoked for Servo API to().`);
      if (response.status >= 0) {
        let result = {
          status : RDD.SC.ESUCCESS.val,
          handle : response.handle,
          register : response.register,
          flags : response.flags
        };
        this.emit("write",result);
      } else {
        this.emit("error",{status : response.status, handle : response.handle});
      }
    });
  }

}

module.exports.ServoAPI = ServoAPI;
module.exports.RDD = RDD;
