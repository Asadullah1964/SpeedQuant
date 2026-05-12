"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

const categories = [
  {
    title: "Numerical Aptitude",
    description:
      "Sharpen arithmetic, percentages, profit-loss, ratios, and speed maths with timed AI practice.",
  },
  {
    title: "Logical Reasoning",
    description:
      "Solve patterns, puzzles, seating arrangements, and deduction questions with step-by-step guidance.",
  },
  {
    title: "Verbal Ability",
    description:
      "Improve reading comprehension, grammar, vocabulary, and sentence correction with adaptive questions.",
  },
  {
    title: "Probability",
    description:
      "Practice probability, permutations, combinations, and data interpretation in exam-style formats.",
  },
];

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      <Navbar />

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-24">
        <div className="flex flex-col justify-center">
          <span className="mb-4 w-fit rounded-full border border-slate-200 bg-white px-4 py-1 text-sm font-medium text-slate-600 shadow-sm">
            Crack aptitude smarter
          </span>

          <h2 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Master Aptitude with
            <span className="block text-slate-500">AI-Powered Practice</span>
          </h2>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Practice logical reasoning, quantitative aptitude, verbal ability,
            probability, and more with smart AI-generated questions, timed
            tests, and instant explanations.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            {!session ? (
              <button
                onClick={() => signIn("google")}
                className="rounded-2xl bg-black px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-slate-800"
              >
                Start Practicing
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="rounded-2xl bg-black px-8 py-4 text-center text-lg font-semibold text-white shadow-lg transition hover:bg-slate-800"
              >
                Go to Dashboard
              </Link>
            )}

            <Link
              href="#categories"
              className="rounded-2xl border border-slate-300 bg-white px-8 py-4 text-center text-lg font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Explore Categories
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
            <div>
              <span className="block text-2xl font-bold text-slate-900">
                10k+
              </span>
              Practice Questions
            </div>
            <div>
              <span className="block text-2xl font-bold text-slate-900">
                4+
              </span>
              Core Categories
            </div>
            <div>
              <span className="block text-2xl font-bold text-slate-900">
                AI
              </span>
              Explanations
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-slate-200 via-slate-100 to-white blur-3xl" />
          <div className="relative w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Today’s Focus
                </p>
                <h3 className="text-2xl font-bold text-slate-900">
                  Quantitative Aptitude
                </h3>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                Live Practice
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Mock Test Progress</p>
                <div className="mt-3 h-3 w-full rounded-full bg-slate-200">
                  <div className="h-3 w-[72%] rounded-full bg-black" />
                </div>
                <p className="mt-2 text-sm font-medium text-slate-700">
                  72% completed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-900 p-5 text-white">
                  <p className="text-sm text-slate-300">Accuracy</p>
                  <h4 className="mt-2 text-3xl font-bold">91%</h4>
                </div>
                <div className="rounded-2xl bg-slate-100 p-5">
                  <p className="text-sm text-slate-500">Tests Attempted</p>
                  <h4 className="mt-2 text-3xl font-bold text-slate-900">
                    128
                  </h4>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">AI Suggestion</p>
                <p className="mt-2 font-medium text-slate-800">
                  Focus more on probability and seating arrangement questions to
                  improve your score faster.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="categories"
        className="mx-auto max-w-7xl px-6 pb-20 lg:px-10"
      >
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Practice Areas
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Categories to master
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Build confidence across every major aptitude topic with structured
            tests and AI-generated explanations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((item, index) => (
            <div
              key={item.title}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
                {index + 1}
              </div>

              <h3 className="text-xl font-semibold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}