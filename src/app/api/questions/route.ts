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

    // Logged in user
    const session =
      await getServerSession(
        authOptions
      );

    const userEmail =
      session?.user?.email;

    // Query params
    const category =
      req.nextUrl.searchParams.get(
        "category"
      );

    const topic =
      req.nextUrl.searchParams.get(
        "topic"
      );

    // Difficulty from frontend
    const requestedDifficulty =
      req.nextUrl.searchParams.get(
        "difficulty"
      );

    const mode =
      req.nextUrl.searchParams.get(
        "mode"
      ) || "practice";

    const limit =
      Number(
        req.nextUrl.searchParams.get(
          "limit"
        )
      ) || Infinity;

    // Default adaptive difficulty
    let adaptiveDifficulty =
      "easy";

    // Adaptive difficulty system
    if (
      userEmail &&
      category
    ) {

      const attempts =
        await Attempt.find({
          userEmail,
          category,
        });

      if (
        attempts.length > 0
      ) {

        const totalAccuracy =
          attempts.reduce(
            (
              acc,
              attempt
            ) => {

              return (
                acc +
                (
                  attempt.score /
                  attempt.totalQuestions
                ) * 100
              );

            },
            0
          );

        const avgAccuracy =
          totalAccuracy /
          attempts.length;

        if (
          avgAccuracy >= 75
        ) {

          adaptiveDifficulty =
            "hard";

        } else if (
          avgAccuracy >= 40
        ) {

          adaptiveDifficulty =
            "medium";
        }
      }
    }

    // Priority:
    // frontend difficulty > adaptive difficulty
    const finalDifficulty =
      requestedDifficulty ||
      adaptiveDifficulty;

    // Exclude solved questions
    let excludedIds: any[] =
      [];

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

    // Dynamic MongoDB filter
    const filter: any = {

      _id: {
        $nin: excludedIds,
      },
    };

    // Category filter
    if (category) {

      filter.category =
        category.toLowerCase();
    }

    // Topic filter
    if (topic) {

      filter.topic =
        topic.toLowerCase();
    }

    // IMPORTANT FIX
    // Only apply difficulty filter
    // if difficulty is NOT "all"
    if (
      finalDifficulty &&
      finalDifficulty !== "all"
    ) {

      filter.difficulty =
        finalDifficulty.toLowerCase();
    }

    console.log(filter);

    // Fetch questions
    const questions =
      await Question.aggregate([
        {
          $match: filter,
        },

        {
          $sample: {
            size: limit,
          },
        },
      ]);

    return NextResponse.json({
      success: true,

      adaptiveDifficulty,

      finalDifficulty,

      questions,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Error fetching questions",
      },
      {
        status: 500,
      }
    );
  }
}