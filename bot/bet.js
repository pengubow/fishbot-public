const { randomIQ } = require("./iq.js");
const { easyembed } = require("./funcs.js");
const { getFish } = require("./fish.js");

function bet(amount, type, args) {
    const roll = randomIQ();
    let win = false;
    let multiplier = 0;

    if (type === "dumb") {
        if (roll <= 55) {
            win = true;
            multiplier = 1.9;
        }
    } 
    else if (type === "smart") {
        if (roll > 55 && roll < 111) {
            win = true;
            multiplier = 1.95;
        }
    } 
    else if (type === "range") {
        const [start, end] = args;
        if (roll >= start && roll <= end) {
            win = true;
            multiplier = 10;
        }
    } else if (type === "number") {
        const number = args[0];
        if (roll === number) {
            win = true;
            multiplier = 117;
        }
    }

    const result = {
        roll,
        win,
        winAmount: Math.floor(amount * multiplier),
        multiplier
    };

    return result;
};

module.exports = { bet }
