const fs = require('fs');
const Discord = require("discord.js")

function readData(userId) {
    var path = __dirname + `/save/${userId}.json`;
    if (!fs.existsSync(path)) {
        let data = { fish: 0, lastFished: 0, shop: {}, lastTransfer: 0, transferAmount: 0 };
        writeData(data, userId);
    }
    return JSON.parse(fs.readFileSync(path));
};

function writeData(data, userId) {
    var path = __dirname + `/save/${userId}.json`;
    fs.writeFileSync(path, JSON.stringify(data, null, 4));
};

function rngpercent(percentage) {
  return Math.random() * 100 < percentage;
};

function rng(max) {
  return Math.floor(Math.random() * max) + 1;
};

function easyembed(color, title, description) {
  const embed = new Discord.EmbedBuilder()
    .setColor(color !== null ? color : '#1ABC9C')
    .setTitle(title !== null ? title : 'a')
    .setDescription(description !== null ? description : 'a')
  return embed;
}

let cachedLeaderboard = {
    lastUpdated: 0,
    text: ''
};

function getLeaderboard() {
    const top = 10;
    const now = Date.now();
    const time = 60 * 1000;

    if (now - cachedLeaderboard.lastUpdated < time) {
        return cachedLeaderboard.text;
    }

    const folder = __dirname + '/save/';
    const files = fs.readdirSync(folder);

    let scores = [];

    for (let file of files) {
        const userId = file.replace('.json', '');
        const data = JSON.parse(fs.readFileSync(folder + file));
        scores.push({ userId: userId, fish: data.fish });
    }
    scores.sort((a, b) => b.fish - a.fish);
    const topScores = scores.slice(0, top);

    let text = 'No data yet.';
    if (topScores.length > 0) {
        text = topScores.map((entry, index) => {
            return `${index + 1}. <@${entry.userId}> - ${entry.fish} 🐟`;
        }).join('\n');
    }

    cachedLeaderboard.lastUpdated = now;
    cachedLeaderboard.text = text;

    return text;
}

module.exports = { readData, writeData, rngpercent,  rng, easyembed, getLeaderboard }
