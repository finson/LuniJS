// This is the main entry point for a simple demo of Johnny-Five controlling
// a Thermometer using a Remote Device Driver on an Arduino host through Firmata.
//
// This program is strict-mode throughout, and it uses some ES6 features.
//
// Doug Johnson, April 2016

const log4js = require("log4js");
const five = require("johnny-five");
const fn = require("../node_modules/johnny-five/lib/fn");

const RDD = require("../RemoteDeviceDriver");
const rddErr = require("../RDDStatus");
const rddCmd = require("../RDDCommand");

const path = require("path");
const thisModule = path.basename(module.filename,".js");
const logger = log4js.getLogger(thisModule);
logger.setLevel('TRACE');

// Create and initialize a board object

const serialPortName = "COM42";
// const serialPortName = "/dev/cu.usbmodem621";

const board = new five.Board({port: serialPortName, repl: false});
const componentController = require("../thermometer/MCP9808_RDD").MCP9808_RDD;

// Strings from Firmata host to client are usually error messages

board.on("string",function (remoteString) {
  logger.warn(`[STRING_DATA] ${remoteString}`);
});

// When the board is ready, start blinking the LED and then trigger the rest of the program to run

board.on("ready", function() {
  logger.debug(`Evt: ready.`);
  logger.info(`Connected to ${board.io.firmware.name}-${board.io.firmware.version.major}.${board.io.firmware.version.minor}`);
  const led = new five.Led(13);
  led.blink(2000);
  board.emit("blinking");
});

// Once the light is blinking, we're ready to really start work

board.on("blinking", function () {
  logger.debug(`Evt: blinking.`);

  let sensor = new five.Thermometer({
    controller: componentController,
    custom: {unit: "MCP9808:0", flags: 1},
    freq: 1000
  });

  sensor.on("data", function() {
    console.log(`celsius: ${this.C}, fahrenheit: ${this.F}, kelvin: ${this.K}`);
  });
});
