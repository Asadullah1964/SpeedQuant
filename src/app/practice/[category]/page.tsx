"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

type Question = {
  _id?: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  category?: string;
  topic?: string;
  difficulty?: string;
};

export default function PracticePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data: session, status } = useSession();

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/questions?category=${category}&limit=10&email=${session?.user?.email}`
        );
        const data = await res.json();

        setQuestions(data.questions || []);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [category]);

  const question = questions[currentIndex];

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return ((currentIndex + 1) / questions.length) * 100;
  }, [currentIndex, questions.length]);

  function handleAnswer(option: string) {
    if (showAnswer) return;
    setSelected(option);
    setShowAnswer(true);
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelected("");
      setShowAnswer(false);
    }
  }

  const formatCategory = category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-700">
            Loading questions...
          </p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
            📘
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            No questions found
          </h1>
          <p className="mt-3 text-slate-500">
            We could not find any practice questions for {formatCategory}.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-8">
          <div>
            <p className="text-sm font-medium text-slate-500">Practice Mode</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {formatCategory} Practice
            </h1>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Exit Practice
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Question</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {currentIndex + 1}
              <span className="text-lg font-medium text-slate-400">
                /{questions.length}
              </span>
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Category</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {formatCategory}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Status</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {showAnswer ? "Answered" : "In Progress"}
            </h2>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-500">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-200">
            <div
              className="h-3 rounded-full bg-slate-900 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              Practice Question
            </div>

            <h2 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
              {question.question}
            </h2>
          </div>

          <div className="space-y-4">
            {question.options.map((option) => {
              const isCorrect = option === question.answer;
              const isSelected = option === selected;

              let optionClass =
                "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50";

              if (showAnswer && isCorrect) {
                optionClass =
                  "border-green-500 bg-green-50 text-green-800";
              } else if (showAnswer && isSelected && !isCorrect) {
                optionClass =
                  "border-red-500 bg-red-50 text-red-800";
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={showAnswer}
                  className={`w-full rounded-2xl border p-4 text-left transition md:p-5 ${optionClass} ${showAnswer ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base font-medium md:text-lg">
                      {option}
                    </span>

                    {showAnswer && isCorrect && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        Correct
                      </span>
                    )}

                    {showAnswer && isSelected && !isCorrect && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                        Your Choice
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {showAnswer && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-xl font-bold text-slate-900">Explanation</h3>
              <p className="mt-3 leading-7 text-slate-600">
                {question.explanation}
              </p>

              {!isLastQuestion ? (
                <button
                  onClick={nextQuestion}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Next Question
                </button>
              ) : (
                <div className="mt-6 rounded-2xl bg-green-100 px-5 py-4 text-green-800">
                  <h4 className="text-lg font-bold">Practice Completed 🎉</h4>
                  <p className="mt-1 text-sm">
                    You have completed all practice questions in this set.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Go to Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setCurrentIndex(0);
                        setSelected("");
                        setShowAnswer(false);
                      }}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      Restart Practice
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}