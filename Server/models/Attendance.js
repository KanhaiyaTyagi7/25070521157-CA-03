
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"]
    },

    date: {
      type: String,
      required: [true, "Attendance date is required"],
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        "Date must be in YYYY-MM-DD format"
      ]
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Late"],
      required: [true, "Attendance status is required"]
    }
  },
  {
    timestamps: true
  }
);

// One attendance record per student per date
attendanceSchema.index(
  { student: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);
