import mongoose from "mongoose";

const SolvedQuestionSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
    },

    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SolvedQuestion ||
  mongoose.model(
    "SolvedQuestion",
    SolvedQuestionSchema
  );