const mongoose = require("mongoose");

// Define the schema for a post
const postSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true, // Title is required
    },
    image: {
      type: String,
      default: null, // Optional field for an image URL
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user model
      required: true, // Post must have an author
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments", // Reference to the comment model
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now, // Automatically sets the current date/time
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Automatically sets the current date/time
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
// Check if the model is already compiled, if not, compile it.
const Posts = mongoose.models.Posts || mongoose.model("Posts", postSchema);

export default Posts;
