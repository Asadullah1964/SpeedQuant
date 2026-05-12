"use client";

import { useEffect, useState } from "react";

export default function AnalyticsPage() {

    const [analytics, setAnalytics] =
        useState<any>(null);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {

        async function fetchAnalytics() {

            try {

                const res = await fetch(
                    "/api/analytics"
                );

                const data =
                    await res.json();

                if (data.success) {
                    setAnalytics(
                        data.analytics
                    );
                }

            } catch (error) {
                console.log(error);

            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();

    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <h1 className="text-4xl font-bold">
                    Loading Analytics...
                </h1>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="h-screen flex items-center justify-center">
                <h1 className="text-4xl font-bold text-red-500">
                    Failed to load analytics
                </h1>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-100 p-8">

            <div className="max-w-7xl mx-auto">

                {/* Heading */}
                <div className="mb-10">

                    <h1 className="text-5xl font-bold mb-3">
                        Analytics Dashboard
                    </h1>

                    <p className="text-gray-500 text-lg">
                        Track your aptitude performance and progress.
                    </p>

                </div>

                {/* Top Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

                    {/* Total Tests */}
                    <div className="bg-white p-8 rounded-2xl shadow">

                        <h2 className="text-gray-500 mb-2">
                            Total Tests
                        </h2>

                        <p className="text-5xl font-bold">
                            {analytics.totalTests}
                        </p>

                    </div>

                    {/* Average Score */}
                    <div className="bg-white p-8 rounded-2xl shadow">

                        <h2 className="text-gray-500 mb-2">
                            Average Accuracy
                        </h2>

                        <p className="text-5xl font-bold">
                            {analytics.averageScore}%
                        </p>

                    </div>

                    {/* Strongest Category */}
                    <div className="bg-white p-8 rounded-2xl shadow">

                        <h2 className="text-gray-500 mb-2">
                            Strongest Category
                        </h2>

                        <p className="text-3xl font-bold capitalize">
                            {
                                analytics
                                    .strongestCategory
                                    ?.category
                            }
                        </p>

                        <p className="text-green-600 text-xl mt-2">
                            {
                                analytics
                                    .strongestCategory
                                    ?.accuracy
                            }
                            %
                        </p>

                    </div>

                </div>

                {/* Weakest Category */}
                <div className="bg-white p-8 rounded-2xl shadow mb-10">

                    <h2 className="text-3xl font-bold mb-4">
                        Weakest Category
                    </h2>

                    <p className="text-2xl capitalize">
                        {
                            analytics
                                .weakestCategory
                                ?.category
                        }
                    </p>

                    <p className="text-red-500 text-xl mt-2">
                        {
                            analytics
                                .weakestCategory
                                ?.accuracy
                        }
                        %
                    </p>

                </div>

                {/* Category Stats */}
                <div className="bg-white p-8 rounded-2xl shadow mb-10">

                    <h2 className="text-3xl font-bold mb-8">
                        Category Performance
                    </h2>

                    <div className="space-y-6">

                        {analytics.categoryStats.map(
                            (
                                item: any,
                                index: number
                            ) => (

                                <div
                                    key={index}
                                >

                                    <div className="flex justify-between mb-2">

                                        <p className="font-semibold capitalize text-lg">
                                            {
                                                item.category
                                            }
                                        </p>

                                        <p className="font-semibold">
                                            {
                                                item.accuracy
                                            }
                                            %
                                        </p>

                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-5">

                                        <div
                                            className="bg-black h-5 rounded-full"
                                            style={{
                                                width: `${item.accuracy}%`,
                                            }}
                                        />

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </div>

                {/* Recent Attempts */}
                <div className="bg-white p-8 rounded-2xl shadow">

                    <h2 className="text-3xl font-bold mb-8">
                        Recent Attempts
                    </h2>

                    <div className="space-y-4">

                        {analytics.recentAttempts.map(
                            (
                                attempt: any,
                                index: number
                            ) => (

                                <div
                                    key={index}
                                    className="border p-5 rounded-xl flex justify-between items-center"
                                >

                                    <div>

                                        <p className="text-xl font-semibold capitalize">
                                            {
                                                attempt.category
                                            }
                                        </p>

                                        <p className="text-gray-500">
                                            Score:
                                            {" "}
                                            {
                                                attempt.score
                                            }
                                            /
                                            {
                                                attempt.totalQuestions
                                            }
                                        </p>

                                    </div>

                                    <div className="text-right">

                                        <p className="text-lg font-bold">

                                            {(
                                                (attempt.score /
                                                    attempt.totalQuestions) *
                                                100
                                            ).toFixed(0)}
                                            %

                                        </p>

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                </div>

            </div>

        </main>
    );
}