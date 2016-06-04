// This is the main entry point for a simple demo of Johnny-Five controlling
// a Servo using a Remote Device Driver controller.
//
// This program is strict-mode throughout, and it uses some ES6 features.
//
// Doug Johnson, April 2016

const log4js = require("log4js");
const path = require("path");
const thisModule = path.basename(module.filename,".js");
const log = log4js.getLogger(thisModule);
log.setLevel('TRACE');

const readline = require('readline');

const five = require("johnny-five");

// Create and initialize a board object

const serialPortName = "COM46";

const board = new five.Board({port: serialPortName, repl: false});
const componentController = require("./CTL_Servo");

// When the board is ready, start blinking the LED and then trigger the rest of the program to run

board.on("ready", function() {
  log.info(`Connected to ${board.io.firmware.name}-${board.io.firmware.version.major}.${board.io.firmware.version.minor}`);
  const led = new five.Led(13);
  led.blink(2000);
  board.emit("blinking");
});

// Once the light is blinking, we're ready to start work

board.on("blinking", function () {
  const servo = new five.Servo({
    controller: componentController.CTL_Servo,
    custom: {unit: "Servo:0",flags: 1},
    pin: 3,
    center: true
  });

  let pos = 90;
  let ctrlC = 0x3;

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  let keys = {
    '[' : -5,
    ']' : +5,
    '{' : -15,
    '}' : +15
  };

  process.stdin.on("keypress",(c) => {
    log.trace(`key: ${c}, type: ${typeof c}, num: ${c.charCodeAt(0)}`);
    if (keys.hasOwnProperty(c)) {
      pos += keys[c];
      servo.to(pos);
    } else if (c.charCodeAt(0) === ctrlC) {
      board.io.transport.close();
    }

  });

 });
