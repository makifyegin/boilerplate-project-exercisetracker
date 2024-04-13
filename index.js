const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// username should be a mandotry field
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);




app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const { v4: uuidv4 } = require("uuid");


app.get('/mongo-health', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
}
);


app.post("/api/users", (req, res) => {
  const username = req.body.username;
  User.findOne({ username
  }, (err, data) => {
    if (err) {
      res.send("Error");
    } else if (data) {
      res.send("Username already taken");
    } else {
      const newUser = new User({
        username: username,
      });
      newUser.save((err, data) => {
        if (err) {
          res.send("Error");
        } else {
          res.json({
            username: data.username,
            _id: data._id,
          });
        }
      });
    }
  });
} 
);


//Make a get request ti get all the users as an array

app.get("/api/users", (req, res) => {
  let users= [];
  User.find({}, (err, data) => {
    if (err) {
      res.send("Error");
    } else {
      data.forEach((user) => {
        users.push({
          username: user.username,
          _id: user._id,
        });
      });
      res.send(users);
    }
  });
});

//You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.

app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;
  User.findById(userId, (err, data) => {
    if (err) {
      res.send("Error");
    } else {
      const log = data.log;
      let result = log;
      if (from) {
        result = result.filter((exercise) => new Date(exercise.date) > new Date(from));
      }
      if (to) {
        result = result.filter((exercise) => new Date(exercise.date) < new Date(to));
      }
      if (limit) {
        result = result.slice(0, limit);
      }
      res.json({
        _id: data._id,
        username: data.username,
        count: result.length,
        log: result,
      });
    }
  });

});

//You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used.

app.post("/api/users/:_id/exercises", (req, res) => {
  const userId = req.params._id;
  const description = req.body.description;
  const duration = req.body.duration;
  let date = req.body.date;
  if (!date) {
    date = new Date().toDateString();
  } else {
    date = new Date(date).toDateString();
  }
  User.findById(userId, (err, data) => {
    if (err) {
      res.send("Error");
    } else {
      res.json({
        username: data.username,
        description: description,
        duration: duration,
        _id: data._id,
        date: date,
      });
    }
  });
}
);



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
