const express = require('express');
require("./bot/bot.js")

const app = express();

app.get("/", (req, res) => {
    res.send("hi");
});

app.listen(3000, () => {
    console.log("wow")
})