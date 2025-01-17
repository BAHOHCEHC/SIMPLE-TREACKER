//http://localhost:5000/api/user/getUser
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const DATA_PATH = path.join(__dirname, "../DB/user.json");

// Получить юзера
router.get("/", (req, res) => {
  fs.readFile(DATA_PATH, "utf8", (err, data) => {
    if (err) return res.status(500).json({ message: "Error reading data" });
    res.json(JSON.parse(data));
  });
});

module.exports = router;
