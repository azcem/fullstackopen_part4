const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const User = require("../models/user");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const Blog = require("../models/blog");

const api = supertest(app);

describe("when there is initially some users saved", async () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await User.insertMany(helper.initialUsers);
  });

  test("username not included", async () => {
    const user = {
      name: "root",
      password: "root",
    };
    await api.post("/api/users").send(user).expect(400);
  });

  test("username shorter than 3 character", async () => {
    const user = {
      username: "ro",
      name: "Root",
      password: "root",
    };
    await api.post("/api/users").send(user).expect(400);
  });

  test("password not included", async () => {
    const user = {
      name: "root",
      username: "root",
    };
    await api.post("/api/users").send(user).expect(400);
  });

  test("password shorter than 3 character", async () => {
    const user = {
      username: "root",
      name: "Root",
      password: "ro",
    };
    await api.post("/api/users").send(user).expect(400);
  });

  test("unique username", async () => {
    const user = {
      username: "assem",
      password: "unique",
    };
    await api.post("/api/users/").send(user).expect(400);
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
