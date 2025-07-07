const fs = require('fs');
const { readData, writeData, easyembed, rngpercent } = require("./funcs.js");
const shopPath = __dirname + "/shop.json";

let shopCache = null;
function readShop() {
  if (!shopCache) {
    if (!fs.existsSync(shopPath)) {
       fs.writeFileSync(shopPath, JSON.stringify({}, null, 4));
    }
    return JSON.parse(fs.readFileSync(shopPath));
  }
  return shopCache;
}

function shopItemExists(item) {
  const shopItems = readShop();
  return item in shopItems;
}

function getShopItem(item) {
  const shopItems = readShop();
  return shopItems[item];
}

function getAllShopItems() {
  const shopItems = readShop();
  return shopItems;
}

function buy(item, userId, message) {
  let data = readData(userId);
  const shopitem = getShopItem(item);
  if (hasShopItem(item, userId)) {
    var buyembed = easyembed(null, '**Already Bought**', null);
    buyembed.setDescription(`You already have **${shopitem.name}**`);
    message.reply({ embeds: [buyembed], allowedMentions: {} });
    return false;
  }
  
  const itemprice = shopitem.price;
  if (data.fish < itemprice) {
    var buyembed = easyembed(null, '**Buy Help**', null);
    buyembed.setDescription(`You don't have enough 🐟.\n**${shopitem.name}** costs ${itemprice} 🐟.\nYour balance is ${data.fish}.`);
    message.reply({ embeds: [buyembed], allowedMentions: {} });
    return false;
  }
  data.fish -= itemprice * 1;
  if (item === "wtor")
    data.fish = 0;
  data.shop[item] = true;
  writeData(data, userId);
  return true;
}

function hasShopItem(item, userId) {
  let data = readData(userId);
  if (!data?.shop) {
    data.shop = {};
    writeData(data, userId);
    return false;
  }
  if (!data.shop[item])
    return false;
  return true;
}

//not gonna lie half of this func was written using chatgpt but at least it explained things and i learned smth new!
function doTheItemsThing(data, fish, multiplier, sharkchance) {
  const shopItems = readShop();
  const items = {};

  for (const itemId of Object.keys(shopItems)) {
    const item = shopItems[itemId];
    
    if (data.shop?.[itemId]) {
      if (!items[itemId]) {
        items[itemId] = {
          name: item.name,
          modifiers: { fish: [], mult: [], cooldown: [], shark: [] }
        };
      }

      if (item.modifiers?.fish) {
        for (const fishModifier of item.modifiers.fish) {
          if (rngpercent(fishModifier.chance)) {
            items[itemId].modifiers.fish.push(fishModifier);
            fish += fishModifier.amount;
          }
        }
      }

      if (item.modifiers?.mult) {
        for (const multModifier of item.modifiers.mult) {
          if (rngpercent(multModifier.chance)) {
            items[itemId].modifiers.mult.push(multModifier);
            multiplier += multModifier.amount;
          }
        }
      }

      if (item.modifiers?.cooldown) {
        for (const cooldownModifier of item.modifiers.cooldown) {
          if (rngpercent(cooldownModifier.chance)) {
            items[itemId].modifiers.cooldown.push(cooldownModifier);
            data.lastFished -= cooldownModifier.amount;
          }
        }
      }

      if (item.modifiers?.shark) {
        for (const sharkModifier of item.modifiers.shark) {
          if (rngpercent(sharkModifier.chance)) {
            items[itemId].modifiers.shark.push(sharkModifier);
            sharkchance += sharkModifier.amount;
          }
        }
      }
    }
  }
  
  const returndata = {
    data,
    fish,
    items,
    multiplier,
    sharkchance
  }
  return returndata;
}

module.exports = { readShop, shopItemExists, buy, hasShopItem, getShopItem, doTheItemsThing }
