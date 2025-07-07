const { rng } = require("./funcs.js");

function randomIQ() {
  const random = rng(120);
  return random;
};

function randomIQMessage() {
  const random = rng(120);
  const basemessage = `Your IQ is ${random}, `
  if (random <= 1) {
    return basemessage + `you're so lucky, i might aswell put some secret additional multiplier on ?bet just for this number if u get it. But eh im too lazy for rn.`
  }
  if (random < 10) {
    return basemessage + `you are dumber than a rock...?`
  }
  else if (random < 30) {
    return basemessage + `you are dumber than a 4 year old... gogo gaga 👶.`
  }
  else if (random < 40) {
    return basemessage + `you are dumber than an 8 year old, please grow the fuck up.`
  }
  else if (random < 60) {
    return basemessage + `you are dumber than a fish (and a horse combined), please shut the fuck up.`
  }
  return basemessage + `you're so smart!`;
};

module.exports = { randomIQ, randomIQMessage }
