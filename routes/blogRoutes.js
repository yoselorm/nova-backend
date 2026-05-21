const express = require('express');
const blogRouter = express.Router();
const { 
  getAllBlogs, 
  getBlogBySlug, 
  createBlog, 
  updateBlog, 
  deleteBlog 
} = require('../controllers/blogController');
const { protectAdmin } = require('../middleware/authMiddleware'); // Security guard lock

// Public Channels Pipelines
blogRouter.get('/', getAllBlogs);
blogRouter.get('/:slug', getBlogBySlug);

// Admin Command Locked Pipelines
blogRouter.post('/', protectAdmin, createBlog);
blogRouter.put('/:id', protectAdmin, updateBlog);
blogRouter.delete('/:id', protectAdmin, deleteBlog);

module.exports = blogRouter;