import mongoose from "mongoose";

const AttemptSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Attempt ||
  mongoose.model("Attempt", AttemptSchema);