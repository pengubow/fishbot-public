require('dotenv').config();

let Discord = require("discord.js");
const { canFish, fish, getCooldown, getFish, addFish, removeFish } = require("./fish.js");
const { readData, writeData, rng, easyembed, getLeaderboard } = require('./funcs.js');
const { randomIQMessage } = require('./iq.js');
const { bet } = require("./bet.js");
const { checkBet, checkTransfer } = require("./check.js");
const { readShop, shopItemExists, buy, hasShopItem, getShopItem } = require("./shop.js");

var client = new Discord.Client({ intents: [ 
  Discord.GatewayIntentBits.Guilds,
  Discord.GatewayIntentBits.GuildMessages,
  Discord.GatewayIntentBits.MessageContent
  ] 
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity("fishing", { type: Discord.ActivityType.Competing })
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith("?") || message.author.bot) {
    return;
  }
  const channelId = message.channel.id;
  
  if (channelId !== "1364822073104662540" && channelId !== "1364720685313953892" && message.channel.parentId !== "1364720685313953892")
    return;
  
  const userId = message.author.id;

  let messagearray = message.content.split(" ");
  let args = messagearray.slice(1);

  message.content = message.content.replace(/\s/g, "");

  const mentioned = message.mentions.users.first();
 
  switch (message.content) {
    //
    // help
    //
    case '?help':
      const infoembed = easyembed('#1ABC9C', '**help**', null);
      //splitting text to make it more readable
      const fishtext = `?fish - fish for fish fr!! 🐟\nGives fish from 1-5 with a chance for an increased base mult.\nYou can also catch a shark (mult gets multiplied by 10x)\nHas a cooldown of 2 minutes\n\n`;
      const baltext = `?bal - check your 🐟 balance\nYou can also check someone else's balance using ?bal @user\n\n`;
      const bettext = `?bet (or ?gamble) [amount] [type: dumb smart range] [option for range: range of 10 numbers] - bet your 🐟 oh my god stake.com is real\ndumb - 55 IQ or less (1.9x)\nsmart - 56-110 IQ (1.95x)\nrange - range of 10 numbers (10x)\nExample: ?bet 10 dumb\n?bet 10 range 10-20 (or 10 20)\n`;
      const morebettext = `**WINNINGS ARE ROUNDED DOWN TO THE NEAREST LOW!\nTHIS MEANS IF YOU BET 1 🐟 ON DUMB, ON A WIN YOU'LL GET 1.\nIF YOU BET 10 ON DUMB, ON A WIN YOU'LL GET 19 🐟.**\nMaximum IQ is 110\n\n`;
      const transfertext = `?transfer (or ?pay) [amount] @user - transfers your 🐟 to another user\nExample: ?transfer 10 @user\n?pay 10 @user\n\n`;
      const leaderboardtext = `?leaderboard (or ?lb) - check the 🐟 leaderboard\n\n`;
      var shoptext = `?shop [shop type] - check the shop\nHas some items help you with 🐟.\nShop types: rod, net or item\nExample: ?shop net\n\n`;
      var buytext = `?buy [item id] - buy an item from the shop\nYou can find item ids to buy with from the shop.\nExample: ?buy shittyrod\n\n`;
      const iqtext = `?iq - check your IQ\n\n`;
      const transcendhelp = `?transcend - "Rebirth", lose everything, but gain ^ (^ is to the power of) to ?fish total fish caught`;
      infoembed.setDescription(fishtext + baltext + bettext + morebettext + transfertext + leaderboardtext + shoptext + buytext + iqtext + transcendhelp);
      await message.reply({ embeds: [infoembed], allowedMentions: {} });
      break;
    //
    // fish
    //
    case '?fish':
      const fishembed = easyembed('#FFFF00', 'fishing...', 'Please wait while you fish for some 🐟...');
      const sentmessage = await message.reply({ embeds: [fishembed], allowedMentions: {} });
      
      setTimeout(() => {
        if (!canFish(userId)) {
          const cooldown = getCooldown(userId);
          fishembed.setColor('#ED4245')
            .setTitle('**No fish** 🐟')
            .setDescription(`Unfortunately, there was no fish in the ocean this time :(\nYou're on **cooldown**.\nFish again in **${cooldown} seconds**!`);
          sentmessage.edit({ embeds: [fishembed] });
          return;
        }
        
        const fisheddata = fish(userId);
        var data = readData(userId);
        const newbal = data.fish;
        
        fishembed.setColor('#57F287').setTitle('**Success!**');
        
        let fishedtext = `You fished **${fisheddata.fishAmount}** 🐟`;
        
        let bonustext = `Base: ${fisheddata.baseAmount} 🐟`;
        let hasFishBonus = false;
        
        let multipliertext = `Multiplier: **${fisheddata.fishMultiplier}x**\nBase multiplier: ${fisheddata.baseMultiplier}x`;
        let hasMultBonus = false;
        
        let cooldowntext = `Cooldown: **${fisheddata.cooldown} seconds**`;
        //let hasCooldownBonus = false;
        
        let sharktext = `Shark chance: **${fisheddata.sharkchance}%**\nBase shark chance: 8%`;
        let hasSharkBonus = false;
        
        for (const { name, modifiers } of Object.values(fisheddata.items)) {
          for (const fishModifier of modifiers.fish) {
            bonustext += `\n+${fishModifier.amount} 🐟 **${name}**`;
            hasFishBonus = true;
          }
          for (const multModifier of modifiers.mult) {
            multipliertext += `\n+${multModifier.amount}x **${name}**`;
            hasMultBonus = true;
          }
          //for (const cooldownModifier of modifiers.cooldown) {
            //cooldowntext += `\n-${cooldownModifier.amount / 1000} seconds **${name}**`;
            //hasCooldownBonus = true;
          //}
          for (const sharkModifier of modifiers.shark) {
            sharktext += `\n+${sharkModifier.amount}% **${name}**`;
            hasSharkBonus = true;
          }
        }
        
        if (fisheddata.shark) {
          multipliertext += ` * 10x **shark**`;
          hasMultBonus = true;
        }
        
        if (hasFishBonus)
          fishedtext += `\n${bonustext}`;
        
        if (hasMultBonus || fisheddata.baseMultiplier !== 1) {
          if (hasSharkBonus && fisheddata.shark) {
            multipliertext += `\n\n` + sharktext;
          }
          fishedtext += `\n\n${multipliertext}`;
        }

        if (data.transcendpower) {
          fishedtext += `\n\n^${data.transcendpower + 1}`;
          hasMultBonus = true;
        }
        
        //if (hasCooldownBonus)
        fishedtext += `\n\n${cooldowntext}`;
        
        if (hasMultBonus || fisheddata.baseMultiplier !== 1) {
          fishedtext += `\n\nYour total fish caught is **${fisheddata.fishTotal}** 🐟`;
        }
        fishedtext += `\n\nYour new balance is **${newbal}** 🐟`;
        
        fishembed.setDescription(fishedtext);
        sentmessage.edit({ embeds: [fishembed] });
      }, rng(7500));
      break;
    //
    //balance check fr
    //
    case `?bal<@${mentioned?.id}>`:
      var balembed = easyembed('#206694', '🐟 **Balance**', null);
      if (!mentioned?.id) {
        balembed.setColor('#ED4245');
        balembed.setTitle('**Balance help**');
        balembed.setDescription('No people mentioned, please mention someone\nExample: ?bal @user');
        await message.reply({ embeds: [balembed] });
        break;
      }
      var bal = await getFish(mentioned.id);
      balembed.setDescription(`<@${mentioned.id}> has **${bal}** 🐟!`);
      await message.reply({ embeds: [balembed], allowedMentions: {} });
      break;
    case '?bal':
      var bal = await getFish(userId);
      var balembed = easyembed('#206694', '🐟 **balance**', `You have **${bal}** 🐟!`);
      await message.reply({ embeds: [balembed], allowedMentions: {} });
      break;
    //
    //bet
    //
    case `?gamble${args?.[0] || ""}${args?.[1] || ""}${args?.[2] || ""}${args?.[3] || ""}`:
    case `?bet${args?.[0] || ""}${args?.[1] || ""}${args?.[2] || ""}${args?.[3] || ""}`:
      let amount = args?.[0] || "";
      let type = args?.[1] || "";
      let range = args?.[2] || "";
      let rangeuntil = args?.[3] || "";
      switch (type) {
          case "d":
            type = "dumb";
            break;
          case "s":
            type = "smart";
            break;
          case "r":
            type = "range";
            break;
          case "n":
            type = "number";
            break;
        default:
      }

      args = [amount, type, range, rangeuntil];

      if (!(await checkBet(message, args)))
        break;

      const gamblingembed = easyembed('#FFFF00', 'gambling...', `Please wait while I gamble ${amount} 🐟...`);

      let rangeArgs = args[2]?.split("-") || [];
      if (range !== "" && rangeuntil !== "" && type === "range") {
        rangeArgs = [range, rangeuntil];
      }
      if (type === "number" && range !== "") {
        rangeArgs = [range];
      }
      if (type === "range" && (rangeArgs[1] - rangeArgs[0]) !== 10) {
        gamblingembed.setColor('#1ABC9C');
        gamblingembed.setTitle('**Bet Help**');
        gamblingembed.setDescription(`Range must be 10 numbers!\nExample: ?bet 10 range 10-20 (or 10 20)\nYou can't bet 10-21 or 10-19`)
        await message.reply({ embeds: [gamblingembed], allowedMentions: {} });
        break;
      }

      if (!(await removeFish(userId, amount))) {
        const bethelpembed = easyembed('#ED4245', '**Bet Unsuccessful**', 'Something went wrong while removing fish');
        await message.reply({ embeds: [bethelpembed], allowedMentions: {} });
        break;
      }
      
      const sentMessage = await message.reply({ embeds: [gamblingembed], allowedMentions: {} });
      const betresult = bet(amount, type, rangeArgs);
      setTimeout(() => {
        if (!addFish(userId, betresult.winAmount)) {
          gamblingembed.setColor('#ED4245');
          gamblingembed.setTitle('**Failed to bet**');
          gamblingembed.setDescription('Something bad is going on 🐟.\nPlease contant pengubow.');
          sentMessage.edit({ embeds: [gamblingembed] });
          return;
        }

        if (betresult.win) {
          gamblingembed.setColor('#57F287');
          gamblingembed.setTitle('**You won!**');
          gamblingembed.setDescription(`You won **${betresult.winAmount}** 🐟, congrats! \nRandomly picked fish IQ was **${betresult.roll}**.\nThe multiplier on your selected game type was **${betresult.multiplier}x**.\nYour new balance is **${getFish(userId)}** 🐟.`)
          sentMessage.edit({ embeds: [gamblingembed] });
        }
        else {
          gamblingembed.setColor('#ED4245');
          gamblingembed.setTitle('**You lost!**');
          gamblingembed.setDescription(`You lost **${amount}** 🐟, better luck next time! \nRandomly picked fish IQ was **${betresult.roll}**.\nYour new balance is **${getFish(userId)}** 🐟.`)
          sentMessage.edit({ embeds: [gamblingembed] });
        }
      }, rng(3650));
      break;
    //
    // transfer
    //
    case `?pay${args?.[0] || ""}`:
    case `?transfer${args?.[0] || ""}`:
      const transferhelpembed = easyembed(null, '**Transfer Help**', 'You need to specify a user\nExample: ?transfer 10 @user\n?pay 10 @user');
      await message.reply({ embeds: [transferhelpembed], allowedMentions: {} });
      break;
    case `?pay${args?.[0] || ""}<@${mentioned?.id || ""}>`:
    case `?transfer${args?.[0] || ""}<@${mentioned?.id || ""}>`:
      const user = mentioned?.id || "";
      let transferamount = args?.[0] || "";

      args = [transferamount, user];

      if (!(await checkTransfer(message, args))) {
        console.log("bad transfer");
        break;
      }
      
      const transferembed = easyembed(null, null, null);
      if (await addFish(user, transferamount)) {
        transferembed.setColor('#57F287');
        transferembed.setTitle('**Transferred**');
        transferembed.setDescription(`You transferred **${transferamount}** 🐟 to <@${user}>`);
        await message.reply({ embeds: [transferembed], allowedMentions: {} });
        break;
      }
      else {
        transferembed.setColor('#ED4245');
        transferembed.setTitle('**Failed to transfer**');
        transferembed.setDescription('Something went wrong while transferring your 🐟.');
        await message.reply({ embeds: [transferembed], allowedMentions: {} });
      }
      break;
    //
    // leaderboard
    //
    case '?lb':
    case '?leaderboard':
      const lbembed = easyembed('#F1C40F', '**Fish Leaderboard**', getLeaderboard());
      await message.reply({ embeds: [lbembed], allowedMentions: {} });
      break;
    //
    // iq
    //
    case '?iq':
      await message.reply(randomIQMessage());
      break;
    //
    // shop
    //
    case `?shop${args?.[0] || ""}`:
      const shopembed = easyembed(null, '**Shop**', null);
      let shoptype = args?.[0] || "";
      if (shoptype === "") {
        shopembed.setDescription('Please enter one of the shop types: rod, net, or item.\nExample: ?shop net');
        await message.reply({ embeds: [shopembed], allowedMentions: {} });
        break;
      }

      switch (shoptype) {
        case `rods`:
          shoptype = `rod`;
          break;
        case `nets`:
          shoptype = `net`;
          break;
        case `items`:
          shoptype = `item`;
          break;
      }
      
      if (!["rod", "net", "item"].includes(shoptype)) {
        shopembed.setDescription('Unknown shop type.\nShop types: rod, net or item.\nExample: ?shop net');
        await message.reply({ embeds: [shopembed], allowedMentions: {} });
        break;
      }
      
      const shopItems = readShop();
      shoptext = ``;
      if (shoptype === "rod") {
        shoptext += `**RODS**:\n`;
      }
      else if (shoptype === "net") {
        shoptext += `\n**NETS**:\n`;
      }
      else {
        shoptext += `\n**ITEMS**:\n`;
      }
      
      const itemIds = Object.keys(shopItems);
      for (const itemId of itemIds) {
        const shopitem = shopItems[itemId];
        const idtext = `(id: ${shopitem.visibleid ? itemId : "N/A"})`;
        if (shopitem.visible) {
          if (shopitem.type === "rod" && shoptype === "rod") {
            shoptext += `**${shopitem.name}** ${idtext}\n${shopitem.description}\nCosts **${shopitem.price}** 🐟\n\n`;
          }
          else if (shopitem.type === "net" && shoptype === "net") {
            shoptext += `**${shopitem.name}** ${idtext}\n${shopitem.description}\nCosts **${shopitem.price}** 🐟\n\n`;
          }
          else if (shopitem.type === "item" && shoptype === "item") {
            shoptext += `**${shopitem.name}** ${idtext}\n${shopitem.description}\nCosts **${shopitem.price}** 🐟\n\n`;
          }
        }
      }
      
      var buytext = `You can buy items with ?buy [item id]\nExample: ?buy shittyrod\n**ALL BOOSTS STACK**`;
      shopembed.setDescription(shoptext + buytext);
      await message.reply({ embeds: [shopembed], allowedMentions: {} });
      break;
    //
    // buy
    //
    case `?buy${args?.[0] || ""}`:
      let item = args?.[0] || "";
      const buyembed = easyembed(null, '**Buy Help**', 'You need to specify what you want to buy!\nExample: ?buy shittyrod');
      if (item === "") {
        buyembed.setDescription(`Please input an item you wanna buy!\nExample: ?buy shittyrod`);
        await message.reply({ embeds: [buyembed], allowedMentions: {} });
        break;
      }

      if (!shopItemExists(item)) {
        buyembed.setDescription(`This item doesn't exist.\nPlease check the shop for the correct item id.`);
        await message.reply({ embeds: [buyembed], allowedMentions: {} });
        break;
      }

      const shopItem = getShopItem(item);
      if (await buy(item, userId, message)) {
        buyembed.setColor('#57F287');
        buyembed.setTitle('**Successfully Bought**');
        buyembed.setDescription(`Bought **${shopItem.name}**, thanks for the purchase!`);
        await message.reply({ embeds: [buyembed], allowedMentions: {} });
      }
      break;
    case `?stats`:
      const statsembed = easyembed(null, '**Stats**', null);
      var data = await readData(userId);

      let balstat = `You have ${data.fish} 🐟\n`;
      let rodsstat = `\n**RODS**:\n`;
      let netsstat = `\n**NETS**:\n`;
      let itemsstat = `\n**ITEMS**:\n`;

      for (const itemId in data.shop) {
        const shopitem = getShopItem(itemId);

        if (shopitem.type === "rod") {
          rodsstat += `**${shopitem.name}** - ${shopitem.description}\n`;
        }
        else if (shopitem.type === "net") {
          netsstat += `**${shopitem.name}** - ${shopitem.description}\n`;
        }
        else {
          itemsstat += `**${shopitem.name}** - ${shopitem.description}\n`;
        }
      }

      if (rodsstat === `\n**RODS**:\n`)
        rodsstat += `You don't have any rods**.**\n`;
      if (netsstat === `\n**NETS**:\n`)
        netsstat += `You don't have any nets**.**\n`;
      if (itemsstat === `\n**ITEMS**:\n`)
        itemsstat += `You don't have any items**.**\n`;

      itemsstat += `\n`;
      
      statsembed.setDescription(balstat + rodsstat + netsstat + itemsstat);
      await message.reply({ embeds: [statsembed], allowedMentions: {} });
      break;
    case `?transcend${args?.[0] || ""}`:
      const transcendembed = easyembed(null, '**Transcend**', null);
      let confirm = args?.[0] || "";
      var data = await readData(userId);
      if (!data.transcendpower)
        data.transcendpower = 0;
      var fishAmount = data.fish;
      let transcendtext = `You're too broke, get 100k 🐟 first.`
      let fishAmountPower = 0.33 - (data.transcendpower * 0.025);
      let transcendpower = Math.floor(fishAmount ** fishAmountPower)/1000;
      transcendtext = `You will receive +^${transcendpower} on ?fish total fish caught.\nTo transcend, you have to ?transcend confirm and you also need at least 100k 🐟.\nThe math here is Math.floor(🐟 balance^(0.33 - (the +^ you have * 0.025)))/1000`;
      if (confirm === "confirm") {
        if (fishAmount < 100000) {
          transcendembed.setDescription(transcendtext);
          await message.reply({ embeds: [transcendembed], allowedMentions: {} });
          break;
        }
        data.transcendpower = transcendpower;
        data.shop = {};
        data.fish = 0;
        transcendembed.setColor('#57F287');
        transcendtext = `Everything is wiped, you got +^${transcendpower} on ?fish total fish caught.`;
        await writeData(data, userId);
      }
      transcendembed.setDescription(transcendtext);
      await message.reply({ embeds: [transcendembed], allowedMentions: {} });
    default:
      break;
  }
  return;
});

client.login(process.env.token);
