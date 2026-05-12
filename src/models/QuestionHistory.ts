import mongoose from "mongoose";

const QuestionHistorySchema =
  new mongoose.Schema(
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

      isCorrect: {
        type: Boolean,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

// ONE record per user + question
QuestionHistorySchema.index(
  {
    userEmail: 1,
    questionId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.models
  .QuestionHistory ||
  mongoose.model(
    "QuestionHistory",
    QuestionHistorySchema
  );