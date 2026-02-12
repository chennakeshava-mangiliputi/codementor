import mongoose, { Schema, models } from "mongoose";

const SessionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    mode: {
      type: String,
      enum: ["interview", "learning"],
      required: true,
    },

    programmingLanguage: String,
    difficulty: String,
    interviewLanguage: String,

    problem: {
      title: String,
      description: String,
      input: String,
      output: String,
    },

    aiSolution: String,
    aiExplanation: String,

    conversation: [
      {
        speaker: String,
        text: String,
        timestamp: Date,
      },
    ],

    feedback: String,
  },
  {
    timestamps: true,
  }
);

export default models.Session || mongoose.model("Session", SessionSchema);
