const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
require("express-async-errors");
const User = require("../models/user");

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;
  if (!username || !password || username.length < 3 || password.length < 3) {
    return response.status(400).json({ error: "invalid username or password" });
  }

  const users = await User.find({});
  const usernames = users.map((user) => user.username);
  if (usernames.includes(username)) {
    return response.status(400).json({ error: "username already exists" });
  }
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    url: 1,
    title: 1,
    author: 1,
  });
  response.json(users);
});
module.exports = usersRouter;
