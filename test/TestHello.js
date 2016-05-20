// This module performs a test of the DDHello device driver running under
// Firmata on a remote Arduino.
//
// This program is strict-mode throughout.
//
// Doug Johnson, May 2016

const log4js = require("log4js");

const RDD = require("../RemoteDeviceDriver");
const rddErr = require("../RDDStatus");
const rddCmd = require("../RDDCommand");

const path = require("path");
const thisModule = path.basename(module.filename,".js");
const logger = log4js.getLogger(thisModule);
logger.setLevel('TRACE');

/**
 * Use the Luni device driver proxy to talk to a DDHello device
 * driver running on a connected Arduino.
 */
class HelloAPI {

/**
 * This HelloAPI class receives user calls to HelloAPI methods and translates
 * them to the appropriate device driver calls and forwards them on using
 * Firmata.
 * @param  {object} opts Options associated with this
 */
  constructor(opts) {

      const rdd = {};

      const REG = {
        INTERJECTION : 256,
        OBJECT : 257
      };

      rdd.reg = reg;
      rdd.openFlags = opts.custom.flags || 1;
      rdd.openOpts = opts.custom.opts || 0;
      rdd.unit = opts.custom.unit || "MCP9808:0";
      rdd.board = opts.board || five.Board.mount();
      rdd.freq = opts.freq || 25;

      rdd.hook = [

      // 0. Open response, read version query

      function (response) {
          logger.trace(`Response hook invoked. (Step 0, open(${rdd.unit}) response, read(version) query)`);
          if (response.status < 0) {
            throw new Error(`Open error during init (0): ${response.status}.`);
          } else {
            logger.debug(`Status value from open() is ${response.status}`);
            rdd.handle = response.status;
            dd.read(rdd.handle,0,rddCmd.CDR.DriverVersion,256,rdd.hook[1]);
          }
        },

      // 1. Read version response, read(Stream, once) query

      function (response) {
          logger.trace(`Response hook invoked. (Step 1, read(version) response), read(Stream, once) query)`);
          if (response.status < 0) {
            throw new Error(`Read error during init (1): ${response.status}.`);
          } else {
            logger.debug(`Status value from read() is ${response.status}`);
            rdd.sv = new rddCmd.SemVer(response.datablock);
            logger.info(`DeviceDriver '${rdd.sv.toString()}' is open on logical unit '${rdd.unit}' with handle ${rdd.handle}`);
            dd.read(rdd.handle,0,rddCmd.CDR.Stream,2,rdd.hook[2]);
          }
        },

        // 2. read(stream, once) response, write(intervals) query

      function (response) {
          logger.trace(`Response hook invoked. (Step 2, read(Stream, once) response, write(intervals) query)`);
          if (response.status < 0) {
            throw new Error(`Read error during init (2): ${response.status}.`);
          } else {
            logger.debug(`Status value from read() is ${response.status}`);
            logger.info(`Current temp is -not yet calculated-`);

            let buf = new Buffer(256);
            buf.writeUInt32LE(0,0);
            buf.writeUInt32LE(rdd.freq,4);
            logger.trace(`rdd.freq: ${rdd.freq}`);
            dd.write(rdd.handle,0,rddCmd.CDR.Intervals,8,buf,rdd.hook[3]);
          }
        },

        // 3. write(intervals) response, read(intervals) query

      function (response) {
          logger.trace(`Response hook invoked. (Step 3, write(intervals) response, read(intervals) query) `);
          if (response.status < 0) {
            throw new Error(`Write error during init (3): ${response.status}.`);
          } else {
            logger.debug(`Status value from write() is ${response.status}`);
            dd.read(rdd.handle,0,rddCmd.CDR.Intervals,8,rdd.hook[4]);
          }
        },

        // 4. read(intervals) response, read(stream continuous) query

      function (response) {
          logger.trace(`Response hook invoked. (Step 4, read(intervals) response, read(Stream, continuous) query) `);
          if (response.status < 0) {
            throw new Error(`Read error during init (4): ${response.status}.`);
          } else {
            logger.debug(`Status value from read() is ${response.status}`);
            logger.debug(`micros: ${response.datablock.readUInt32LE(0)}`);
            logger.debug(`millis: ${response.datablock.readUInt32LE(4)}`);
            dd.read(rdd.handle,rddCmd.DAF.MILLI_RUN,rddCmd.CDR.Stream,2,rdd.hook[5]);
          }
        },

        // 5. read(Stream, continuous) response

      function (response) {
          logger.trace(`Response hook invoked. (Step 5, read(Stream, continuous) response`);
          if (response.status < 0) {
            throw new Error(`Read error during init (5): ${response.status}.`);
          } else {
            logger.debug(`Status value from continuous read() is ${response.status}, (flags: ${response.flags})`);
            let upperByte = response.datablock.readInt8(0) & 0x1F;
            let lowerByte = response.datablock.readInt8(1);
            let result = (((upperByte << 8) & 0xF00) | (lowerByte & 0xFF))/16;
            if ((upperByte & 0x10) === 0x10) {
              logger.warn("Negative temp!");
              result = 256 - result;
            }
            logger.info(`Current temp is ${result} °C`);
            logger.debug(`Temp register bytes: ${(upperByte & 0x1F).toString(16)}  ${(lowerByte & 0xFF).toString(16)}` );
            datahandler(result);
          }
        }
      ];

      let dd =  new RDD.RemoteDeviceDriver({board: rdd.board, skipCapabilities: false});
      rdd.dd = dd;
      rdd.handle = 0;
      dd.open(rdd.unit,rdd.openFlags,rdd.openOpts, rdd.hook[0]);
    }
  }
};

module.exports = {DDHello};
