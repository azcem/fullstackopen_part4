const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const Blog = require("../models/blog");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");

const api = supertest(app);

describe("when there is initially some notes saved", async () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.initialBlogs);
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs");
    assert.strictEqual(response.body.length, helper.initialBlogs.length);
  });

  test("identifier is named id", async () => {
    const response = await api.get("/api/blogs");
    assert("id" in response.body[0]);
    assert(!("_id" in response.body[0]));
  });

  test("posting new blog", async () => {
    const newBlog = {
      title: "testing",
      author: "Assem Ahmed",
      url: "http://localhost.com",
      likes: 1000,
    };
    await api
      .post("/api/blogs")
      .set(
        "Authorization",
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3QiLCJpZCI6IjY3NDIyYTk2M2VhMjc3MzJhYzFhOTIyMSIsImlhdCI6MTczMjM4OTU0MX0.LnB6v1jl_YKeP0Atmr-pOEsPL6z1tdblGh353aOyItI",
      )
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const authors = blogsAtEnd.map((blog) => blog.author);
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);
    assert(authors.includes("Assem Ahmed"));
  });

  test("missing likes from request", async () => {
    const newBlog = {
      title: "testing likes",
      author: "Assem Ahmed",
      url: "http://localhost.com",
    };
    savedBlog = await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    assert("likes" in savedBlog.body);
    assert.strictEqual(savedBlog.body.likes, 0);
  });

  test("missing url from request", async () => {
    const newBlog = {
      title: "testing likes",
      author: "Assem Ahmed",
    };
    await api.post("/api/blogs").send(newBlog).expect(400);
  });

  test("missing title from request", async () => {
    const newBlog = {
      author: "Assem Ahmed",
      url: "http://localhost.com",
    };
    await api.post("/api/blogs").send(newBlog).expect(400);
  });

  test("delete blog", async () => {
    const blogsInDb = await helper.blogsInDb();
    const blogToDelete = blogsInDb[0];
    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);
    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
    assert(!blogsAtEnd.map((blog) => blog.id).includes(blogToDelete.id));
  });

  test("update likes", async () => {
    const blogsInDb = await helper.blogsInDb();
    const blogToUpdateId = blogsInDb[0].id;
    const blogToUpdate = { likes: 1212 };
    await api
      .put(`/api/blogs/${blogToUpdateId}`)
      .send(blogToUpdate)
      .expect(200);
    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    assert.strictEqual(
      blogsAtEnd.filter((blog) => blog.id === blogToUpdateId)[0].likes,
      blogToUpdate.likes,
    );
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
