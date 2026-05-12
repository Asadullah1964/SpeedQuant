"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";

type Attempt = {
  _id: string;
  category: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;

    async function fetchAttempts() {
      try {
        setLoadingAttempts(true);
        const res = await fetch(`/api/attempts?email=${session.user.email}`);
        const data = await res.json();
        setAttempts(data.attempts || []);
      } catch (error) {
        console.error("Failed to fetch attempts", error);
        setAttempts([]);
      } finally {
        setLoadingAttempts(false);
      }
    }

    fetchAttempts();
  }, [session?.user?.email]);

  const analytics = useMemo(() => {
    const totalTests = attempts.length;

    const totalScore = attempts.reduce(
      (sum, attempt) => sum + attempt.score,
      0
    );

    const totalQuestions = attempts.reduce(
      (sum, attempt) => sum + attempt.totalQuestions,
      0
    );

    const averageScore =
      totalQuestions > 0
        ? ((totalScore / totalQuestions) * 100).toFixed(1)
        : "0.0";

    const bestScore =
      attempts.length > 0
        ? Math.max(
            ...attempts.map(
              (attempt) => (attempt.score / attempt.totalQuestions) * 100
            )
          ).toFixed(1)
        : "0.0";

    const latestAttempt = attempts[0];

    return {
      totalTests,
      totalScore,
      totalQuestions,
      averageScore,
      bestScore,
      latestAttempt,
    };
  }, [attempts]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-700">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">Profile</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Performance Analytics
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-6 text-white shadow-lg lg:col-span-1">
            <p className="text-sm font-medium text-white/70">Student Profile</p>

            <div className="mt-5 flex items-center gap-4">
              <img
                src={session?.user?.image || "/default-avatar.png"}
                alt={session?.user?.name || "Profile"}
                className="h-16 w-16 rounded-2xl border border-white/20 object-cover"
              />

              <div>
                <h2 className="text-2xl font-bold">
                  {session?.user?.name || "User"}
                </h2>
                <p className="text-sm text-white/75">
                  {session?.user?.email || "No email available"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-white/70">Tests Taken</p>
                <p className="mt-2 text-2xl font-bold">
                  {analytics.totalTests}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-white/70">Best Score</p>
                <p className="mt-2 text-2xl font-bold">
                  {analytics.bestScore}%
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Tests</p>
              <h3 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                {analytics.totalTests}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Total completed attempts
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Average Accuracy
              </p>
              <h3 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                {analytics.averageScore}%
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Based on all solved questions
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Questions Solved
              </p>
              <h3 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
                {analytics.totalQuestions}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Across practice and tests
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Recent Attempts
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your latest aptitude activity and scores
              </p>
            </div>

            {analytics.latestAttempt && (
              <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 sm:block">
                Latest: {analytics.latestAttempt.category}
              </div>
            )}
          </div>

          <div className="p-6">
            {loadingAttempts ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="h-5 w-40 rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-56 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : attempts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                  📊
                </div>
                <h3 className="text-xl font-semibold text-slate-900">
                  No attempts yet
                </h3>
                <p className="mt-2 max-w-md text-slate-500">
                  Start practicing from the dashboard to see your scores,
                  accuracy, and performance history here.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {attempts.map((attempt, index) => {
                  const percent = (
                    (attempt.score / attempt.totalQuestions) *
                    100
                  ).toFixed(1);

                  return (
                    <div
                      key={attempt._id}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                          {index + 1}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold capitalize text-slate-900">
                            {attempt.category}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {new Date(attempt.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-500">
                            Score
                          </p>
                          <p className="text-2xl font-bold text-slate-900">
                            {attempt.score}/{attempt.totalQuestions}
                          </p>
                        </div>

                        <div className="min-w-[88px] rounded-xl bg-green-100 px-4 py-2 text-center text-sm font-bold text-green-700">
                          {percent}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}