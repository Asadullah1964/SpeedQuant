"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Question = {
    _id?: string;
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
};

export default function TestPage({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = use(params);
    const { data: session, status } = useSession();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>(
        {}
    );
    const [timeLeft, setTimeLeft] = useState(300);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const formatCategory = useMemo(() => {
        return category
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }, [category]);

    useEffect(() => {
        if (status === "loading") return;

        async function fetchQuestions() {
            try {
                setLoading(true);

                const query = new URLSearchParams({
                    category,
                    limit: "10",
                });

                if (session?.user?.email) {
                    query.set("email", session.user.email);
                }

                const res = await fetch(`/api/questions?${query.toString()}`);
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
    }, [category, status, session?.user?.email]);

    useEffect(() => {
        if (submitted || loading || questions.length === 0) return;

        if (timeLeft <= 0) {
            submitTest();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitted, loading, questions.length]);

    function selectOption(option: string) {
        setSelectedAnswers((prev) => ({
            ...prev,
            [currentIndex]: option,
        }));
    }

    function nextQuestion() {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    }

    function previousQuestion() {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    }

    function goToQuestion(index: number) {
        setCurrentIndex(index);
    }

    function calculateScore() {
        let score = 0;

        questions.forEach((question, index) => {
            if (selectedAnswers[index] === question.answer) {
                score++;
            }
        });

        return score;
    }

    function getReviewData() {
        return questions.map((question, index) => {
            const selected = selectedAnswers[index];
            const isCorrect = selected === question.answer;

            return {
                id: question._id || `${index}`,
                index,
                question: question.question,
                options: question.options,
                selectedAnswer: selected || "Not Attempted",
                correctAnswer: question.answer,
                explanation: question.explanation,
                isCorrect,
                attempted: !!selected,
            };
        });
    }

    async function submitTest() {
        if (submitted || submitting) return;

        const score = calculateScore();
        setSubmitting(true);
        setSubmitted(true);

        try {
            await fetch("/api/attempts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userEmail: session?.user?.email,
                    category,
                    score,
                    totalQuestions: questions.length,
                    questionResults: questions.map((q, index) => ({
                        questionId: q._id,
                        isCorrect: selectedAnswers[index] === q.answer,
                    })),
                }),
            });
        } catch (error) {
            console.error("Failed to save attempt:", error);
        } finally {
            setSubmitting(false);
        }
    }

    const question = questions[currentIndex];
    const answeredCount = Object.keys(selectedAnswers).length;
    const progress = questions.length
        ? ((currentIndex + 1) / questions.length) * 100
        : 0;

    const score = calculateScore();
    const percentage = questions.length
        ? ((score / questions.length) * 100).toFixed(1)
        : "0.0";

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
    const isTimeLow = timeLeft <= 60;

    const reviewData = getReviewData();

    if (loading || status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="space-y-4">
                        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
                        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                    </div>
                </div>
            </div>
        );
    }

    if (!questions.length) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
                <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-bold text-slate-700">
                        Q
                    </div>
                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                        No questions available
                    </h1>
                    <p className="mt-3 text-slate-500">
                        We could not load any questions for {formatCategory}.
                    </p>
                    <Link
                        href="/dashboard"
                        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </main>
        );
    }

    if (submitted) {
        return (
            <main className="min-h-screen bg-slate-50">
                <section className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
                                    Test Review
                                </p>
                                <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                                    {formatCategory} Result
                                </h1>
                                <p className="mt-3 text-slate-600">
                                    Review each question, your answer, and the correct explanation.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    Go to Dashboard
                                </Link>
                                <Link
                                    href={`/practice/${category}`}
                                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    Practice Topic
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                <p className="text-sm font-medium text-slate-500">Score</p>
                                <h2 className="mt-2 text-4xl font-bold text-slate-900">
                                    {score}/{questions.length}
                                </h2>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                <p className="text-sm font-medium text-slate-500">Accuracy</p>
                                <h2 className="mt-2 text-4xl font-bold text-slate-900">
                                    {percentage}%
                                </h2>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                <p className="text-sm font-medium text-slate-500">Answered</p>
                                <h2 className="mt-2 text-4xl font-bold text-slate-900">
                                    {answeredCount}
                                </h2>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                <p className="text-sm font-medium text-slate-500">Correct</p>
                                <h2 className="mt-2 text-4xl font-bold text-slate-900">
                                    {score}
                                </h2>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                    <div className="space-y-6">
                        {reviewData.map((item) => (
                            <article
                                key={item.id}
                                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Question {item.index + 1}
                                        </p>
                                        <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-900">
                                            {item.question}
                                        </h2>
                                    </div>

                                    <span
                                        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${item.isCorrect
                                                ? "bg-green-100 text-green-700"
                                                : item.attempted
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-amber-100 text-amber-700"
                                            }`}
                                    >
                                        {item.isCorrect
                                            ? "Correct"
                                            : item.attempted
                                                ? "Incorrect"
                                                : "Not Attempted"}
                                    </span>
                                </div>

                                <div className="px-6 py-6">
                                    <div className="grid gap-3">
                                        {item.options.map((option) => {
                                            const isSelected = item.selectedAnswer === option;
                                            const isCorrect = item.correctAnswer === option;

                                            return (
                                                <div
                                                    key={option}
                                                    className={`rounded-2xl border p-4 ${isCorrect
                                                            ? "border-green-300 bg-green-50"
                                                            : isSelected && !isCorrect
                                                                ? "border-red-300 bg-red-50"
                                                                : "border-slate-200 bg-white"
                                                        }`}
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <span className="font-medium text-slate-800">
                                                            {option}
                                                        </span>

                                                        <div className="flex flex-wrap gap-2">
                                                            {isSelected && (
                                                                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                                                                    Your answer
                                                                </span>
                                                            )}
                                                            {isCorrect && (
                                                                <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
                                                                    Correct answer
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm font-medium text-slate-500">
                                                Your Answer
                                            </p>
                                            <p className="mt-2 font-semibold text-slate-900">
                                                {item.selectedAnswer}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm font-medium text-slate-500">
                                                Correct Answer
                                            </p>
                                            <p className="mt-2 font-semibold text-slate-900">
                                                {item.correctAnswer}
                                            </p>
                                        </div>
                                    </div>

                                    {item.explanation && (
                                        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                                            <p className="text-sm font-semibold text-blue-700">
                                                Explanation
                                            </p>
                                            <p className="mt-2 leading-7 text-slate-700">
                                                {item.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
                            Live Test
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                            {formatCategory} Test
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                                Answered
                            </p>
                            <p className="mt-1 text-lg font-bold text-slate-900">
                                {answeredCount}/{questions.length}
                            </p>
                        </div>

                        <div
                            className={`rounded-2xl px-4 py-3 shadow-sm ${isTimeLow
                                    ? "bg-red-100 text-red-700"
                                    : "bg-slate-900 text-white"
                                }`}
                        >
                            <p className="text-xs font-medium uppercase tracking-[0.14em] opacity-80">
                                Time Left
                            </p>
                            <p className="mt-1 text-lg font-bold">
                                {minutes}:{seconds}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
                <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
                    <div className="mb-5">
                        <h2 className="text-lg font-bold text-slate-900">Test Overview</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Jump across questions and track completion.
                        </p>
                    </div>

                    <div className="mb-5 rounded-2xl bg-slate-50 p-4">
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

                    <div>
                        <p className="mb-3 text-sm font-semibold text-slate-600">
                            Question Palette
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((_, index) => {
                                const isActive = index === currentIndex;
                                const isAnswered = !!selectedAnswers[index];

                                return (
                                    <button
                                        key={index}
                                        onClick={() => goToQuestion(index)}
                                        className={`flex min-h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition ${isActive
                                                ? "bg-black text-white"
                                                : isAnswered
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-500">
                            Question {currentIndex + 1} of {questions.length}
                        </p>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {selectedAnswers[currentIndex] ? "Answered" : "Not Answered"}
                        </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                        {question.question}
                    </h2>

                    <div className="mt-8 space-y-4">
                        {question.options.map((option, optionIndex) => {
                            const isSelected = selectedAnswers[currentIndex] === option;

                            return (
                                <button
                                    key={option}
                                    onClick={() => selectOption(option)}
                                    className={`w-full rounded-2xl border p-4 text-left transition md:p-5 ${isSelected
                                            ? "border-blue-500 bg-blue-50 text-blue-900"
                                            : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <span
                                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isSelected
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-slate-100 text-slate-600"
                                                    }`}
                                            >
                                                {String.fromCharCode(65 + optionIndex)}
                                            </span>
                                            <span className="text-base font-medium leading-7 md:text-lg">
                                                {option}
                                            </span>
                                        </div>

                                        {isSelected && (
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={previousQuestion}
                                disabled={currentIndex === 0}
                                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {currentIndex < questions.length - 1 ? (
                                <button
                                    onClick={nextQuestion}
                                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                >
                                    Next Question
                                </button>
                            ) : (
                                <button
                                    onClick={submitTest}
                                    disabled={submitting}
                                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Review & Submit
                                </button>
                            )}
                        </div>

                        <button
                            onClick={submitTest}
                            disabled={submitting}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? "Submitting..." : "Submit Test"}
                        </button>
                    </div>
                </section>
            </section>
        </main>
    );
}