// This is the main entry point for a simple demo of Johnny-Five controlling
// a Thermometer using a Remote Device Driver on an Arduino host through Firmata.
//
// This program is strict-mode throughout, and it uses some ES6 features.
//
// Doug Johnson, April 2016

const log4js = require("log4js");
const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('TRACE');

const five = require("johnny-five");

// Create and initialize a board object

const serialPortName = "COM42";

const board = new five.Board({port: serialPortName, repl: false});
const componentController = require("./CTL_MCP9808");

// When the board is ready, start blinking the LED and then trigger the rest of the program to run

board.on("ready", function() {
  log.info(`Connected to ${board.io.firmware.name}-${board.io.firmware.version.major}.${board.io.firmware.version.minor}`);
  const led = new five.Led(13);
  led.blink(2000);
  board.emit("blinking");
});

// Once the light is blinking, we're ready to really start work

board.on("blinking", function () {
  let sensor = new five.Thermometer({
    controller: componentController.CTL_MCP9808,
    custom: {unit: "MCP9808:0", flags: 1},
    freq: 1000
  });

  sensor.on("data", function(data) {
    log.debug(`data event: ${data.C}°C, ${data.F}°F, ${data.K}°K.`);
  });
});
