import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";

import Attempt from "@/models/Attempt";

// import SolvedQuestion from "@/models/SolvedQuestion";

import QuestionHistory from "@/models/QuestionHistory";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    // Save attempt
    const attempt = await Attempt.create({
      userEmail: body.userEmail,
      category: body.category,
      score: body.score,
      totalQuestions: body.totalQuestions,
    });

    // Save question history
    // Save question history
    if (body.questionResults?.length > 0) {

      for (const q of body.questionResults) {

        await QuestionHistory.findOneAndUpdate(
          {
            userEmail: body.userEmail,
            questionId: q.questionId,
          },

          {
            isCorrect: q.isCorrect,
          },

          {
            upsert: true,
            new: true,
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      attempt,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json({
      success: false,
      message: "Failed to save attempt",
    });
  }
}


export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const email =
      req.nextUrl.searchParams.get("email");

    const attempts = await Attempt.find({
      userEmail: email,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      attempts,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json({
      success: false,
      message: "Failed to fetch attempts",
    });
  }
}