const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String, // Use ObjectId type for the reference
          // Reference the User model
        required: true
    },
    datePosted: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
