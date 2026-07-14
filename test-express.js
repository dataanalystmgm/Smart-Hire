const express = require('express');
const app = express();
app.post("https://script.google.com/macros/s/xyz/exec", (req, res) => res.send("ok"));
