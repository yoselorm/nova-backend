const Blog = require('../models/Blog');

// @desc    Get all blogs (Public channels + optional category routing filters)
// @route   GET /api/blogs
const getAllBlogs = async (req, res) => {
  try {
    const { category } = req.query;
    let queryMatrix = {};

    // If query string parameters define a category selection, apply filter logic
    if (category && ['general', 'surgery', 'fertility', 'pharmacy'].includes(category)) {
      queryMatrix.category = category;
    }

    // Public view only displays items marked true for publication
    queryMatrix.isPublished = true;

    const blogs = await Blog.find(queryMatrix).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    res.status(500).json({ message: 'Blog Processing Matrix Pipeline Failure', error: error.message });
  }
};

// @desc    Get a single blog entry using URL slug parameters (Public)
// @route   GET /api/blogs/:slug
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true });
    
    if (!blog) {
      return res.status(404).json({ message: 'Target literary asset log registry entry not found.' });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ message: 'Blog Fetch Error', error: error.message });
  }
};

// @desc    Instantiate a new clinical article (Admin Protected)
// @route   POST /api/blogs
const createBlog = async (req, res) => {
  try {
    const { title, content, coverImage, category, author, readTime } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Mandatory creation parameter elements missing.' });
    }

    const newBlog = await Blog.create({
      title,
      content,
      coverImage,
      category,
      author,
      readTime
    });

    res.status(201).json({ success: true, data: newBlog });
  } catch (error) {
    res.status(500).json({ message: 'Blog Creation Crash Layer', error: error.message });
  }
};

// @desc    Modify an existing article asset log (Admin Protected)
// @route   PUT /api/blogs/:id
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Target profile log registry entry not found.' });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ message: 'Blog Patch Error', error: error.message });
  }
};

// @desc    Purge an article entirely out of database clusters (Admin Protected)
// @route   DELETE /api/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Target asset file mismatch.' });
    }

    res.status(200).json({ success: true, message: 'Literary asset logs purged successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Destruction Sequence Error', error: error.message });
  }
};

module.exports = {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
};