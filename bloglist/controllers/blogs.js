const blogsRouter = require("express").Router();
const { request } = require("express");
require("express-async-errors");
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { process_params } = require("express/lib/router");

blogsRouter.get("/", async (request, response, next) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(decodedToken.id);
  if (!("likes" in request.body)) {
    request.body.likes = 0;
  }
  if (!("url" in request.body) || !("title" in request.body)) {
    return response.status(400).end();
  }

  const blog = new Blog({ ...request.body, user: user._id });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  const blog = await Blog.findById(request.params.id);
  if (blog.user.toString() === decodedToken.id) {
    await Blog.findByIdAndDelete(request.params.id);
    response.status(204).end();
  } else {
    response.status(401).end();
  }
});

blogsRouter.put("/:id", async (request, response) => {
  const body = request.body;
  const blog = { likes: body.likes };

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });
  response.status(200).json(updatedBlog);
});

module.exports = blogsRouter;
