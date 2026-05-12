import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import Question from "@/models/Question";

import QuestionHistory from "@/models/QuestionHistory";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import Attempt from "@/models/Attempt";

export async function GET(
  req: NextRequest
) {
  try {
    await connectDB();

    // Get logged-in user
    const session =
      await getServerSession(
        authOptions
      );

    const userEmail =
      session?.user?.email;

    const category =
      req.nextUrl.searchParams.get(
        "category"
      );

    const limit =
      Number(
        req.nextUrl.searchParams.get(
          "limit"
        )
      ) || 10;

    // Default difficulty
    let difficulty = "easy";

    // Adaptive difficulty logic
    if (userEmail && category) {

      const attempts =
        await Attempt.find({
          userEmail,
          category,
        });

      if (attempts.length > 0) {

        const totalAccuracy =
          attempts.reduce(
            (acc, attempt) => {

              return (
                acc +
                (attempt.score /
                  attempt.totalQuestions) *
                100
              );

            },
            0
          );

        const avgAccuracy =
          totalAccuracy /
          attempts.length;

        // Difficulty selection
        if (avgAccuracy >= 75) {

          difficulty = "hard";

        } else if (
          avgAccuracy >= 40
        ) {

          difficulty = "medium";
        }
      }
    }

    // Exclude correctly solved questions
    let excludedIds: any[] = [];

    if (userEmail) {

      const correctQuestions =
        await QuestionHistory.find({
          userEmail,
          isCorrect: true,
        });

      excludedIds =
        correctQuestions.map(
          (q) => q.questionId
        );
    }

    let questions;

    // Fetch questions
    if (category) {

      questions =
        await Question.aggregate([
          {
            $match: {

              category:
                category.toLowerCase(),

              difficulty,

              _id: {
                $nin: excludedIds,
              },
            },
          },

          {
            $sample: {
              size: limit,
            },
          },
        ]);

    } else {

      questions =
        await Question.aggregate([
          {
            $match: {

              difficulty,

              _id: {
                $nin: excludedIds,
              },
            },
          },

          {
            $sample: {
              size: limit,
            },
          },
        ]);
    }

    return NextResponse.json({
      success: true,

      adaptiveDifficulty:
        difficulty,

      questions,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json({
      success: false,
      message:
        "Error fetching questions",
    });
  }
}