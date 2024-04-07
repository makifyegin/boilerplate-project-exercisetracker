const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const { v4: uuidv4 } = require("uuid");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
var users = [];
app.post("/api/users", (req, res) => {
  const username1 = req.body.username;
  const id = uuidv4();
  const newUser = { username: username1, _id: id };
  users.push(newUser);

  res.json({ username: username1, _id: id });
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {

  const { description, duration, date } = req.body;
  const userId = req.params._id;
  const user = users.find((user) => user._id === userId);
  if (!user) {
    return res.json({ error: "user not found" });
  }
  const newExercise = {
    description: description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    _id: userId,
    username: user.username,
  };
  res.json(newExercise);

});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
