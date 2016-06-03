// This module provides a Javascript accessible interface to DeviceDrivers
// running on a remote Arduino host.  The transport protocol is
// ConfigurableFirmata with the addition of DEVICE_QUERY and DEVICE_RESPONSE.
//
// This module is strict-mode throughout, and it uses some ES6 features.
//
// Doug Johnson, April 2016

const log4js = require("log4js");
const path = require("path");
const thisModule = path.basename(module.filename,".js");
const logger = log4js.getLogger(thisModule);
logger.setLevel('ERROR');

const EventEmitter = require("events");
const CMD = require("./RDDCommand");
const ERR = require("./RDDStatus");

/**
 * Define the methods needed for the Firmata Remote Device Driver
 * implementation in Javascript.
 */
class RemoteDeviceDriver extends EventEmitter {
/**
 * Initialize a device driver object.
 * @param  {[type]} opts  options for this constructor or its superclass
 *                  board a Firmata Board object
 */
  constructor(opts) {
    super(opts);
    this.board = opts.board;

    // Set up mapping from response messages to response event types

    this.responseEvents = new Map();
    this.responseEvents.set(CMD.ACTION.OPEN, "DeviceResponseOpen");
    this.responseEvents.set(CMD.ACTION.READ, "DeviceResponseRead");
    this.responseEvents.set(CMD.ACTION.WRITE, "DeviceResponseWrite");
    this.responseEvents.set(CMD.ACTION.CLOSE, "DeviceResponseClose");

    // Tell Firmata that we will handle all DEVICE_RESPONSE messages that arrive.
    // The message is decoded as much as needed to derive a signature event which
    // is then emitted for further processing.

    this.board.sysexResponse(CMD.SYSEX.DEVICE_RESPONSE, (encodedMsgBody) => {
      logger.debug("\nSysex Device Response Handler invoked");

      let encodedMsgBodyBuffer = Buffer.from(encodedMsgBody);
      logger.trace("encoded Response Body length: ", encodedMsgBodyBuffer.length);
      logger.trace("encoded Response Body (b): ", encodedMsgBodyBuffer);

      let msgBody = Buffer.from(encodedMsgBodyBuffer.toString(),"base64");
      logger.trace("decoded Response Body length: ", msgBody.length);
      logger.trace("decoded Response Body (b): ", msgBody);

      let action = msgBody.readUInt8(0) & 0xF;
      let flags = (msgBody.readUInt8(0) >>> 4) & 0xF;
      logger.trace(`Rcvd DeviceResponse: action code: ${action}, flags: ${flags}`);

      let response;
      let eventName = "";

      switch (action) {
        case CMD.ACTION.OPEN:
          response = new CMD.DeviceResponseOpen(msgBody);
          eventName = this.responseEvents.get(CMD.ACTION.OPEN)+`-${response.unitName}`;
          break;

        case CMD.ACTION.READ:
          response = new CMD.DeviceResponseRead(msgBody);
          eventName = this.responseEvents.get(CMD.ACTION.READ)+`-${response.handle}-${flags}-${response.register}`;
          break;

        case CMD.ACTION.WRITE:
          response = new CMD.DeviceResponseWrite(msgBody);
          eventName = this.responseEvents.get(CMD.ACTION.WRITE)+`-${response.handle}-${flags}-${response.register}`;
          break;

        case CMD.ACTION.CLOSE:
          response = new CMD.DeviceResponseClose(msgBody);
          eventName = this.responseEvents.get(CMD.ACTION.CLOSE)+`-${response.handle}`;
          break;
      }

      if (eventName.length !== 0) {
        logger.debug(`About to emit ${eventName}`);
        this.emit(eventName, response);
      } else {
        let errString = `Invalid Device Response Action received from remote device: ${action}`;
        logger.error(errString);
        this.board.emit("string",errString);
      }
    });
  }

  //--------------------------------------------------------

 /**
  * This open() method sends a DEVICE_QUERY message to the Arduino to request
  * access to the named logical unit.
  *
  * @param  {[type]}   unitName [description]
  * @param  {[type]}   flags    [description]
  * @param  {[type]}   opts     [description]
  * @param  {Function} callback [description]
  * @return {[type]}            [description]
  */
  open(unitName, flags, opts, callback) {

    // Prepare to receive the open() response

    let openEvent = this.responseEvents.get(CMD.ACTION.OPEN)+`-${unitName}`;
    this.once(openEvent, (response) => {
      logger.trace(`${openEvent} handler invoked.`);
      if (response.status >= 0) {
        logger.debug(`Status value from open() is ${response.status}`);
        callback(response);
      } else {
        logger.error(`Error value from open() is ${response.status}`);
        callback(response);
      }
    });

    // Send the open() query message

    let message = new CMD.DeviceQueryOpen(unitName,flags, opts);
    this.board.sysexCommand(message.toByteArray());

    return this;
  }

  //--------------------------------------------------------

  /**
   * This read() method sends a DEVICE_QUERY message to the Arduino to request
   * a read from the device.
   * @param  {[type]}   handle   [description]
   * @param  {[type]}   flags    [description]
   * @param  {[type]}   reg      [description]
   * @param  {[type]}   count    [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  read(handle, flags, reg, count, callback) {

    // Prepare to receive the read() response

    let readEvent = this.responseEvents.get(CMD.ACTION.READ)+`-${handle}-${flags}-${reg}`;
    if (flags === CMD.DAF.MILLI_RUN) {
      this.on(readEvent, (response) => {
        logger.trace(`${readEvent} (continuous) handler invoked.`);
        if (response.status >= 0) {
          logger.debug(`Status value from continuous read() is ${response.status}`);
          callback(response);
        } else {
          logger.error(`Error value from continuous read() is ${response.status}`);
          callback(response);
        }
      });
    } else {
      this.once(readEvent, (response) => {
        logger.trace(`${readEvent} (one shot) handler invoked.`);
        if (response.status >= 0) {
          logger.debug(`Status value from read() is ${response.status}`);
          callback(response);
        } else {
          logger.error(`Error value from read() is ${response.status}`);
          callback(response);
        }
      });
    }

    // Send the read() query message

    let message = new CMD.DeviceQueryRead(handle, flags, reg, count);
    this.board.sysexCommand(message.toByteArray());

    return this;
  }

  //--------------------------------------------------------

/**
 * This write() method sends a DEVICE_QUERY message to the Arduino to request
 * a write to the device.
 * @param  {[type]}   handle   [description]
 * @param  {[type]}   flags    [description]
 * @param  {[type]}   reg      [description]
 * @param  {[type]}   count    [description]
 * @param  {[type]}   buf      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
  write(handle, flags, reg, count, buf, callback) {

  // Prepare to receive the write() response

    let writeEvent = this.responseEvents.get(CMD.ACTION.WRITE)+`-${handle}-${flags}-${reg}`;
    logger.trace(`Response event to listen for: ${writeEvent}`);
    this.once(writeEvent, (response) => {
      logger.trace(`${writeEvent} handler invoked.`);
      if (response.status >= 0) {
        logger.debug(`Status value from write() is ${response.status}`);
        callback(response);
      } else {
        logger.error(`Error value from write() is ${response.status}`);
        callback(response);
      }
    });

  // Send the write() query

    let message = new CMD.DeviceQueryWrite(handle, flags, reg, count,buf);
    this.board.sysexCommand(message.toByteArray());

    return this;
  }

  //--------------------------------------------------------

/**
 * This close() method sends a DEVICE_QUERY message to the Arduino to release
 * its claim to the open logical unit.
 * @param  {[type]}   handle   [description]
 * @param  {[type]}   flags    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
  close(handle, flags, callback) {

    // Prepare to receive the close() response

    let closeEvent = this.responseEvents.get(CMD.ACTION.CLOSE)+`-${handle}`;
    this.once(closeEvent, (response) => {
      logger.trace(`${closeEvent} handler invoked.`);
      if (response.status >= 0) {
        logger.debug(`Status value from close() is ${response.status}`);
        callback(response);
      } else {
        logger.error(`Error value from close() is ${response.status}`);
        callback(response);
      }
    });

    let message = new CMD.DeviceQueryClose(handle,flags);
    this.board.sysexCommand(message.toByteArray());

    return this;
  }
}

module.exports.RemoteDeviceDriver = RemoteDeviceDriver;
Object.assign(module.exports, ERR);
Object.assign(module.exports, CMD);
