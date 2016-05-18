let fn = function(a) {
  this.something = a;
};

fn.prototype.pfn = function(arg) {
  console.log(`pfn speaking: ${arg}.`);
};
console.log(`fn is a ${typeof fn}`);

let b = new fn(2);
console.log(`b is an ${typeof b}`);

b.pfn('hi');

console.log(`\nenumerable keys in b are:`);
for (let k in b) {
  console.log(k);
}

console.log(`\nenumerable and non-enumerable keys in b are:`);
for (let k of Object.getOwnPropertyNames(b)) {
  console.log(k);
}

console.log(`\nkeys of fn:`);
for (let k of Object.getOwnPropertyNames(fn)) {
  console.log(k);
}

console.log(`\nkeys of fn.prototype:`);
for (let k of Object.getOwnPropertyNames(fn.prototype)) {
  console.log(k);
}
