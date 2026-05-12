import { NextRequest, NextResponse } from "next/server";

import { getToken } from "next-auth/jwt";

import Groq from "groq-sdk";

import { connectDB } from "@/lib/mongodb";

import Question from "@/models/Question";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(
    req: NextRequest
) {
    try {

        await connectDB();

        // ADMIN SECURITY CHECK
        const token = await getToken({
            req,
            secret:
                process.env
                    .NEXTAUTH_SECRET,
        });

        console.log(token);

        // Block non-admin users
        if (
            token?.email !==
            process.env.ADMIN_EMAIL
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        // Request body
        const body = await req.json();

        const {
            category,
            topic,
            difficulty,
            count,
        } = body;

        // AI Prompt
        const prompt = `
Generate ${count} aptitude questions.

Category: ${category}
Topic: ${topic}
Difficulty: ${difficulty}

Return ONLY valid JSON array.

Format:

[
  {
    "question": "",
    "options": ["", "", "", ""],
    "answer": "",
    "explanation": ""
  }
]

Rules:
- Exactly 4 options
- Answer must match one option
- No markdown
- No extra text
- Unique questions
`;

        // Generate AI Questions
        const completion =
            await groq.chat.completions.create({
                model:
                    "llama-3.3-70b-versatile",

                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],

                temperature: 0.7,
            });

        const response =
            completion.choices[0]
                ?.message?.content || "";

        // Clean AI response
        const cleaned = response
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        // Parse JSON
        const parsedQuestions =
            JSON.parse(cleaned);

        // Format for MongoDB
        const formattedQuestions =
            parsedQuestions.map(
                (q: any) => ({
                    category,
                    topic,
                    difficulty,

                    source: "AI",

                    companyTags: [],

                    question:
                        q.question,

                    options:
                        q.options,

                    answer:
                        q.answer,

                    explanation:
                        q.explanation,
                })
            );

        // Save questions
        const savedQuestions =
            await Question.insertMany(
                formattedQuestions
            );

        return NextResponse.json({
            success: true,

            count:
                savedQuestions.length,

            questions:
                savedQuestions,
        });

    } catch (error) {

        console.log(error);

        return NextResponse.json(
            {
                success: false,
                message:
                    "Failed to generate questions",
            },
            {
                status: 500,
            }
        );
    }
}