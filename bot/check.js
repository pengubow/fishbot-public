const { readData, writeData, easyembed } = require("./funcs.js");
const { getFish, removeFish } = require("./fish.js");

async function checkBet(message, args) {
    let userId = message.author.id;
    let amount = args[0];
    let type = args[1];
    let range = args[2];
    let rangeuntil = args?.[3] || "";
    const bethelpembed = easyembed(null, '**Bet Help**', 'You need to bet something! ?bet [amount] [type: dumb smart range] [option for range: range of ten numbers (for exmaple 1-11)]\nExample: ?bet 10 dumb');
    if (args[0] === "") {
        await message.reply({ embeds: [bethelpembed], allowedMentions: {} })
        return false;
    }
    if (!["dumb", "smart", "range", "number"].includes(type)) {
        bethelpembed.setDescription('Unknown type of bet!\nTypes: dumb, smart or range\nExample: ?bet 10 dumb');
        await message.reply({ embeds: [bethelpembed], allowedMentions: {} });
        return false;
    }
    if (type === "range" && !range.includes("-")) {
        if (rangeuntil === "") {
            bethelpembed.setDescription('You need to specify a range!\nExample: ?bet 10 range 1-11 (or 1 11)');
            await message.reply({ embeds: [bethelpembed], allowedMentions: {} });
            return false;
        }
    }
    if (type === "number" && range === "") {
        bethelpembed.setDescription('You need to specify a number!\nExample: ?bet 10 number 50');
        await message.reply({ embeds: [bethelpembed], allowedMentions: {} });
        return false;
    }
    if (type !== "range" && type !== "number" && range !== "") {
        bethelpembed.setDescription('3rd argument is only for range and number bets!');
        await message.reply({ embeds: [bethelpembed], allowedMentions: {} });
        return false;
    }
    if (Math.sign(amount) !== 1) {
        bethelpembed.setDescription(`You can only bet positive amount (more or equaled to 1) of 🐟.`);
        await message.reply({ embeds: [bethelpembed], allowedMentions: {} });
        return false;
    }
    if (amount % 1 !== 0) {
        bethelpembed.setDescription(`You can't bet a decimal!`);
        await message.reply({ embeds: [bethelpembed], allowedMentions: {} });
        return false;
    }
    if (amount > await getFish(userId)) {
        bethelpembed.setDescription(`You need more 🐟 to bet this amount! \nIf you don't have enough 🐟, you can fish with ?fish!`);
        await message.reply({ embeds: [bethelpembed], allowedMentions: {} });
        return false;
    }

    return true;
};

async function checkTransfer(message, args) {
    let transferamount = args[0];
    let user = message?.author.id || "";
    const transferhelpembed = easyembed(null, '**Transfer Help**', null);
    if (user === "" && transferamount === "") {
        transferhelpembed.setDescription('You need to specify a user and amount!\nExample: ?transfer 10 @user\n?pay 10 @user');
        await message.reply({ embeds: [transferhelpembed], allowedMentions: {} });
        return false;
    }
    if (user === "") {
        transferhelpembed.setDescription('You need to specify a user!\nExample: ?transfer 10 @user\n?pay 10 @user');
        await message.reply({ embeds: [transferhelpembed], allowedMentions: {} });
        return false;
    }
    if (transferamount === "") {
        transferhelpembed.setDescription('You need to specify an amount!\nExample: ?transfer 10 @user\n?pay 10 @user');
        await message.reply({ embeds: [transferhelpembed], allowedMentions: {} });
        return false;
    }
    if (Math.sign(transferamount) !== 1) {
        transferhelpembed.setDescription('You can only transfer a positive amount of 🐟.');
        await message.reply({ embeds: [transferhelpembed], allowedMentions: {} });
        return false;
    }
    if (transferamount % 1 !== 0) {
        transferhelpembed.setDescription('You can only transfer a whole number of 🐟.');
        await message.reply({ embeds: [transferhelpembed], allowedMentions: {} });
        return false;
    }
    
    let data = await readData(message.author.id);
    let datatransferamount = data?.transferAmount || 0;
    datalasttransfer = data?.lastTransfer || 0;
    let date = Date.now();
    let ok = date - 5 * 60 * 1000;
    if (datalasttransfer <= ok) {
        datatransferamount = 0;
        datalasttransfer = date;
    }
    datatransferamount += parseInt(transferamount);
    
    if (transferamount > data.fish) {
        transferhelpembed.setDescription(`You don't have enough 🐟 to transfer ${transferamount} 🐟.\nYou have ${getFish(message.author.id)} 🐟.`);
        await message.reply({ embeds: [transferhelpembed], allowedMentions: {} });
        return false;
    }
    if (datatransferamount > 10000) {
        transferhelpembed.setDescription(`You cannot transfer more than 10k fish 🐟 every 5 minutes.`);
        await message.reply({ embeds: [transferhelpembed], allowedMentions: {} });
        return false;
    }
    
    //if (!await removeFish(user, transferamount))
        //return false;
    data.fish -= transferamount * 1;
    data.lastTransfer = date;
    data.transferAmount = datatransferamount;
    await writeData(data, message.author.id);
    return true;
}

module.exports = { checkBet, checkTransfer }
