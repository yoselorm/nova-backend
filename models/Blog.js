const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title parameter is mandatory'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'Content payload data field cannot be empty']
  },
  coverImage: {
    type: String,
    required: [true, 'Cover image asset URI reference is mandatory']
  },
  category: {
    type: String,
    required: [true, 'Content category routing target is mandatory'],
    enum: ['general', 'surgery', 'fertility', 'pharmacy'],
    default: 'general'
  },
  author: {
    type: String,
    required: [true, 'Author signature registry parameter is mandatory'],
    default: 'Nova Medical Editorial Board'
  },
  readTime: {
    type: String,
    default: '3 min read'
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// FIXED HOOK: No next parameter, no next() call. Pure clean execution.
BlogSchema.pre('save', async function () {
  if (!this.isModified('title')) return;
  
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '') // Strips special characters
    .replace(/\s+/g, '-');      // Replaces spaces with dashes
});

module.exports = mongoose.model('Blog', BlogSchema);