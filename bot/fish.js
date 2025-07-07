const { readData, writeData, rngpercent, rng, easyembed } = require("./funcs.js");
const { doTheItemsThing } = require("./shop.js");

function getFish(userId) {
    let data = readData(userId);
    return data.fish;
}

function addFish(userId, amount) {
    let data = readData(userId);
    // idk why
    data.fish += amount * 1;
    writeData(data, userId);
    return true;
}

function removeFish(userId, amount) {
    let data = readData(userId);
    data.fish -= amount * 1;
    writeData(data, userId);
    return true;
}

function canFish(userId) {
  const data = readData(userId);
  const lastFished = data.lastFished;
  let now = Date.now();
  const cooldown = 2 * 60 * 1000;
  return now - lastFished >= cooldown;
}

function fish(userId) {
  data = readData(userId);
  const now = Date.now();
  data.lastFished = now;
  
  let fishAmount = rng(5);
  const baseAmount = fishAmount;
  let shark = false;
  let baseMultiplier = 1;
  let sharkchance = 8;
    
  if (rngpercent(40)) {
    baseMultiplier = Math.floor(rng(1000) / 199);
    if (baseMultiplier === 0)
        baseMultiplier = 1;
  }

  const veryusefuldata = doTheItemsThing(data, fishAmount, baseMultiplier, sharkchance);
  data = veryusefuldata.data;
  fishAmount = veryusefuldata.fish;
  let items = veryusefuldata.items;
  let multiplier = veryusefuldata.multiplier;
  sharkchance = veryusefuldata.sharkchance;

  if (rngpercent(sharkchance)) {
    shark = true;
    multiplier *= 10;
  }
  if (!data.transcendpower)
      data.transcendpower = 0;

  const fishTotal = Math.floor((fishAmount * multiplier) ** (data.transcendpower + 1));
  data.fish += fishTotal;

  let nextFish = data.lastFished + 2 * 60 * 1000;
  let cooldown = Math.ceil((nextFish - now) / 1000);
  
  const funny = {
    fishAmount,
    fishMultiplier: multiplier,
    fishTotal,
    shark,
    sharkchance,
    items,
    baseAmount,
    baseMultiplier,
    cooldown
  };

  writeData(data, userId);
  return funny;
}

function getCooldown(userId) {
  const data = readData(userId);
  let nextFish = data.lastFished + 2 * 60 * 1000;
  return Math.ceil((nextFish - Date.now()) / 1000);
}

module.exports = { canFish, fish, getCooldown, getFish, addFish, removeFish }
