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

    const requestedDifficulty =
      req.nextUrl.searchParams.get(
        "difficulty"
      );

    const limit =
      Number(
        req.nextUrl.searchParams.get(
          "limit"
        )
      ) || 10;

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

    // Final difficulty
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

    // Base filter
    const baseFilter: any = {

      _id: {
        $nin: excludedIds,
      },
    };

    // Category filter
    if (category) {

      baseFilter.category =
        category.toLowerCase();
    }

    // Topic filter
    if (topic) {

      baseFilter.topic =
        topic.toLowerCase();
    }

    // Parse difficulties
    let difficulties: string[] =
      [];

    if (
      finalDifficulty &&
      finalDifficulty !== "all"
    ) {

      difficulties =
        finalDifficulty
          .split(",")
          .map((d) =>
            d.trim().toLowerCase()
          )
          .filter(Boolean);

    } else {

      difficulties = [
        "easy",
        "medium",
        "hard",
      ];
    }

    // Distribution logic
    let distribution: Record<
      string,
      number
    > = {};

    // easy + medium
    if (
      difficulties.includes(
        "easy"
      ) &&
      difficulties.includes(
        "medium"
      ) &&
      difficulties.length === 2
    ) {

      distribution = {
        easy: 0.4,
        medium: 0.6,
      };
    }

    // medium + hard
    else if (
      difficulties.includes(
        "medium"
      ) &&
      difficulties.includes(
        "hard"
      ) &&
      difficulties.length === 2
    ) {

      distribution = {
        medium: 0.6,
        hard: 0.4,
      };
    }

    // easy + hard
    else if (
      difficulties.includes(
        "easy"
      ) &&
      difficulties.includes(
        "hard"
      ) &&
      difficulties.length === 2
    ) {

      distribution = {
        easy: 0.5,
        hard: 0.5,
      };
    }

    // all 3
    else if (
      difficulties.length === 3
    ) {

      distribution = {
        easy: 0.25,
        medium: 0.60,
        hard: 0.15,
      };
    }

    // single difficulty
    else {

      distribution = {
        [difficulties[0]]: 1,
      };
    }

    let questions: any[] = [];

    // Fetch questions based on distribution
    for (const level in distribution) {

      const percentage =
        distribution[level];

      let count = Math.round(
        limit * percentage
      );

      // Avoid 0 count
      if (count <= 0) {
        count = 1;
      }

      const filter = {
        ...baseFilter,
        difficulty: level,
      };

      const fetched =
        await Question.aggregate([
          {
            $match: filter,
          },

          {
            $sample: {
              size: count,
            },
          },
        ]);

      questions.push(...fetched);
    }

    // Shuffle final questions
    questions = questions.sort(
      () => Math.random() - 0.5
    );

    // Limit exact count
    questions =
      questions.slice(0, limit);

    return NextResponse.json({
      success: true,

      adaptiveDifficulty,

      finalDifficulty,

      distribution,

      totalQuestions:
        questions.length,

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