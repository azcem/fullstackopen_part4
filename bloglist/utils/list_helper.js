const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => {
    return total + blog.likes;
  }, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return {};
  const maxLikes = Math.max(...blogs.map((blog) => blog.likes));
  return blogs.filter((blog) => blog.likes == maxLikes)[0];
};

const mostBlogs = (blogs) => {
  const authors = new Map();
  //initialize
  for (let i = 0; i < blogs.length; i++) {
    authors.set(blogs[i].author, 0);
  }
  //add blogs
  let maxBlogs = 0;
  let authorWithMostBlogs = "";
  for (let j = 0; j < blogs.length; j++) {
    const blogsCount = authors.get(blogs[j].author) + 1;
    authors.set(blogs[j].author, blogsCount);
    if (maxBlogs < blogsCount) {
      maxBlogs = blogsCount;
      authorWithMostBlogs = blogs[j].author;
    }
  }
  return { author: authorWithMostBlogs, blogs: maxBlogs };
};

const mostLikes = (blogs) => {
  const authors = new Map();
  //initialize
  for (let i = 0; i < blogs.length; i++) authors.set(blogs[i].author, 0);

  //add likes
  let maxLikes = 0;
  let authorWithMostLikes = "";
  for (let i = 0; i < blogs.length; i++) {
    const likesCount = authors.get(blogs[i].author) + blogs[i].likes;
    authors.set(blogs[i].author, likesCount);
    if (maxLikes < likesCount) {
      maxLikes = likesCount;
      authorWithMostLikes = blogs[i].author;
    }
  }
  return { author: authorWithMostLikes, likes: maxLikes };
};

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };
