
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true
    },

    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      unique: true,
      trim: true
    },

    course: {
      type: String,
      default: "B.Tech",
      trim: true
    },

    semester: {
      type: String,
      default: "3"
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Student", studentSchema);
