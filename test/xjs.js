


const RDD = require("../lib/RemoteDeviceDriver");

console.log(`sym: ${RDD.SC.ESUCCESS.sym}, val: ${RDD.SC.ESUCCESS.val}` );

for (let s of Object.keys(RDD)) {
  console.log(s);
}

// const code = function(aName, aValue, aMessage) {
//   let s = Symbol();
//   return [aName,{name : aName, val : aValue, msg : aMessage}];
// };

//  // let STATUS1 = new Map([
//  //      code( ESUCCESS, 0, "Success" ),
//  //      code( EPERM, -1, "Operation not permitted"),
//  //      code( ENOENT, -2, "No such file or directory"),
//  //      code( ESRCH, -3, "No such process")
//  //      ]);

//  let STATUS2 = {
//       ESUCCESS : { name : "ESUCCESS", val : 0, msg : "Success" },
//       EPERM : { name : "EPERM", val : -1, msg : "Operation not permitted" },
//       ENOENT : { name : "ENOENT", val : -2, msg : "No such file or directory" },
//       ESRCH : { name : "ESRCH", val : -3, msg : "No such process" }
//     };

//  // let STATUS3 = new Map([
//  //      [[ESUCCESS], [{ name : "ESUCCESS", val : 0, msg : "Success" }]],
//  //      [[EPERM], [{ name : "EPERM", val : -1, msg : "Operation not permitted" }]],
//  //      [[ENOENT], [{ name : "ENOENT", val : -2, msg : "No such file or directory" }]],
//  //      [[ESRCH], [{ name : "ESRCH", val : -3, msg : "No such process" }]]
//  //      ]);

//  let STATUS4 = {
//       ESUCCESS : { val : 0, msg : "Success" },
//       EPERM : { val : -1, msg : "Operation not permitted" },
//       ENOENT : { val : -2, msg : "No such file or directory" },
//       ESRCH : { val : -3, msg : "No such process" }
//     };

// console.log(Object.keys(STATUS4));
// console.log("--5--");

// let STATUS5 = new Map();

// for (let s of Object.keys(STATUS4)) {
//   STATUS5.set(s,{sym : s, val : STATUS4[s].val, msg : STATUS4[s].msg});
// }
// for (let s of Object.keys(STATUS4)) {
//   STATUS5.set(STATUS4[s].val,{sym : s, val : STATUS4[s].val, msg : STATUS4[s].msg});
// }

// for (let s of STATUS5) {
//   console.log(s);
// }
// console.log("--6--");

// let STATUS6 = {};

// for (let s of Object.keys(STATUS4)) {
//   STATUS6[STATUS4[s].val] = {sym : s, val : STATUS4[s].val, msg : STATUS4[s].msg};
// }
// for (let s of Object.keys(STATUS4)) {
//   STATUS6[s] = {sym : s, val : STATUS4[s].val, msg : STATUS4[s].msg};
// }

// for (let s of Object.keys(STATUS6)) {
//   console.log(s,STATUS6[s]);

// }
// console.log("-----");

// let response = {value : 4, name : "something", status : STATUS6.ESRCH.val};

// console.log(`response: ${response}, response.status: ${response.status}`);
// console.log(`STATUS6[response.status].sym: ${STATUS6[response.status].sym}`);
