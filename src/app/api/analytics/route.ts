import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { connectDB } from "@/lib/mongodb";

import Attempt from "@/models/Attempt";

export async function GET(
    req: NextRequest
) {
    try {
        await connectDB();

        const session =
            await getServerSession(
                authOptions
            );

        if (!session?.user?.email) {
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

        const userEmail =
            session.user.email;

        // Get all attempts
        const attempts =
            await Attempt.find({
                userEmail,
            }).sort({
                createdAt: -1,
            });

        // Total tests
        const totalTests =
            attempts.length;

        // Average score
        let averageScore = 0;

        if (totalTests > 0) {
            const totalPercentage =
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

            averageScore =
                totalPercentage /
                totalTests;
        }

        // Category analytics
        const categoryMap:
            Record<
                string,
                {
                    total: number;
                    obtained: number;
                    questions: number;
                }
            > = {};

        attempts.forEach((attempt) => {
            if (
                !categoryMap[
                    attempt.category
                ]
            ) {
                categoryMap[
                    attempt.category
                ] = {
                    total: 0,
                    obtained: 0,
                    questions: 0,
                };
            }

            categoryMap[
                attempt.category
            ].total += 1;

            categoryMap[
                attempt.category
            ].obtained +=
                attempt.score;

            categoryMap[
                attempt.category
            ].questions +=
                attempt.totalQuestions;
        });

        const categoryStats =
            Object.entries(
                categoryMap
            ).map(
                ([
                    category,
                    data,
                ]) => ({
                    category,

                    testsTaken:
                        data.total,

                    accuracy:
                        (
                            (data.obtained /
                                data.questions) *
                            100
                        ).toFixed(2),
                })
            );

        // Strongest category
        let strongestCategory =
            null;

        let weakestCategory = null;

        if (
            categoryStats.length > 0
        ) {
            strongestCategory =
                [...categoryStats].sort(
                    (a, b) =>
                        Number(
                            b.accuracy
                        ) -
                        Number(
                            a.accuracy
                        )
                )[0];

            weakestCategory =
                [...categoryStats].sort(
                    (a, b) =>
                        Number(
                            a.accuracy
                        ) -
                        Number(
                            b.accuracy
                        )
                )[0];
        }

        return NextResponse.json({
            success: true,

            analytics: {
                totalTests,

                averageScore:
                    averageScore.toFixed(
                        2
                    ),

                strongestCategory,

                weakestCategory,

                categoryStats,

                recentAttempts:
                    attempts.slice(
                        0,
                        10
                    ),
            },
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json({
            success: false,
            message:
                "Failed to fetch analytics",
        });
    }
}