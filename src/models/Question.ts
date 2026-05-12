import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    topic: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    difficulty: {
      type: String,

      enum: [
        "easy",
        "medium",
        "hard",
      ],

      default: "easy",
    },

    companyTags: {
      type: [String],

      default: [],
    },

    source: {
      type: String,

      enum: [
        "AI",
        "Manual",
      ],

      default: "AI",
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      required: true,

      validate: {
        validator: function (
          options: string[]
        ) {
          return options.length === 4;
        },

        message:
          "Exactly 4 options are required",
      },
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    explanation: {
      type: String,
      required: true,
      trim: true,
    },

    timesSolved: {
      type: Number,
      default: 0,
    },

    timesAnsweredCorrectly: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster querying
QuestionSchema.index({
  category: 1,
  difficulty: 1,
});

QuestionSchema.index({
  topic: 1,
});

export default mongoose.models.Question ||
  mongoose.model("Question", QuestionSchema);