"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type Question = {
    _id?: string;
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
    difficulty?: string;
};

type ReviewItem = {
    id: string;
    index: number;
    question: string;
    options: string[];
    selectedAnswer: string;
    correctAnswer: string;
    explanation?: string;
    isCorrect: boolean;
    attempted: boolean;
    markedForReview: boolean;
    difficulty?: string;
};

export default function TestPage() {
    const params = useParams<{ category: string }>();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();

    const category = params?.category || "";

    const difficultyParam = searchParams.get("difficulty") || "easy";
    const countParam = Number(searchParams.get("count") || "10");
    const strictParam = searchParams.get("strict") === "true";

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>(
        {}
    );
    const [markedQuestions, setMarkedQuestions] = useState<Record<number, boolean>>(
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

    const parsedDifficulties = useMemo(() => {
        return difficultyParam
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }, [difficultyParam]);

    const difficultyLabel = useMemo(() => {
        return parsedDifficulties.map((item) => item[0]?.toUpperCase() + item.slice(1)).join(", ");
    }, [parsedDifficulties]);

    useEffect(() => {
        if (status === "loading" || !category) return;

        async function fetchQuestions() {
            try {
                setLoading(true);

                const query = new URLSearchParams();
                query.set("category", category);
                query.set("limit", String(countParam));
                query.set("difficulty", difficultyParam);

                if (session?.user?.email) {
                    query.set("email", session.user.email);
                }

                const res = await fetch(`/api/questions?${query.toString()}`);
                const data = await res.json();

                const fetchedQuestions = data.questions || [];
                setQuestions(fetchedQuestions);

                if (strictParam && fetchedQuestions.length > 0) {
                    const strictTime = fetchedQuestions.reduce(
                        (total: number, q: Question) => {
                            const level = (q.difficulty || "").toLowerCase();

                            if (level === "easy") return total + 20;
                            if (level === "medium") return total + 40;
                            if (level === "hard") return total + 60;

                            return total + 60;
                        },
                        0
                    );

                    setTimeLeft(strictTime);
                } else {
                    setTimeLeft(fetchedQuestions.length > 0 ? fetchedQuestions.length * 60 : 300);
                }
            } catch (error) {
                console.error("Failed to fetch questions:", error);
                setQuestions([]);
            } finally {
                setLoading(false);
            }
        }

        fetchQuestions();
    }, [category, countParam, difficultyParam, strictParam, status, session?.user?.email]);

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

    function toggleMarkForReview(index: number) {
        setMarkedQuestions((prev) => ({
            ...prev,
            [index]: !prev[index],
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

    function goToNextUnanswered() {
        const nextUnanswered = questions.findIndex(
            (_, index) => selectedAnswers[index] === undefined
        );

        if (nextUnanswered !== -1) {
            setCurrentIndex(nextUnanswered);
        }
    }

    function goToNextMarked() {
        const nextMarked = questions.findIndex((_, index) => markedQuestions[index]);
        if (nextMarked !== -1) {
            setCurrentIndex(nextMarked);
        }
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

    function getReviewData(): ReviewItem[] {
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
                markedForReview: !!markedQuestions[index],
                difficulty: question.difficulty,
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
                    strictMode: strictParam,
                    difficulty: parsedDifficulties,
                    markedForReview: Object.keys(markedQuestions)
                        .filter((key) => markedQuestions[Number(key)])
                        .map(Number),
                    questionResults: questions.map((q, index) => ({
                        questionId: q._id,
                        isCorrect: selectedAnswers[index] === q.answer,
                        selectedAnswer: selectedAnswers[index] || null,
                        markedForReview: !!markedQuestions[index],
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
    const markedCount = Object.values(markedQuestions).filter(Boolean).length;
    const notAnsweredCount = questions.length - answeredCount;

    const progress = questions.length
        ? ((currentIndex + 1) / questions.length) * 100
        : 0;

    const score = calculateScore();
    const percentage = questions.length
        ? ((score / questions.length) * 100).toFixed(1)
        : "0.0";

    const reviewData = getReviewData();

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
    const isTimeLow = timeLeft <= 60;

    if (loading || status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
                <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="space-y-4">
                        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                        <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />
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
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-700">
                        SQ
                    </div>
                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                        No test questions found
                    </h1>
                    <p className="mt-3 text-slate-500">
                        We could not load any questions for {formatCategory}.
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                        Difficulty: {difficultyLabel} · Count: {countParam} · Strict:{" "}
                        {strictParam ? "On" : "Off"}
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
                <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Test Review</p>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {formatCategory} Test Result
                            </h1>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2">
                            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                                Accuracy
                            </p>
                            <p className="mt-1 text-lg font-bold text-slate-900">{percentage}%</p>
                        </div>
                    </div>
                </header>

                <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Score</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {score}/{questions.length}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Answered</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">{answeredCount}</p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Marked</p>
                            <p className="mt-2 text-3xl font-bold text-amber-600">{markedCount}</p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Mode</p>
                            <p className="mt-2 text-lg font-bold text-slate-900">
                                {strictParam ? "Strict Test" : "Standard Test"}
                            </p>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">Difficulty</p>
                            <p className="mt-2 text-lg font-bold text-slate-900">{difficultyLabel}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href="/dashboard"
                            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Go to Dashboard
                        </Link>
                        <Link
                            href={`/practice/${category}?difficulty=${encodeURIComponent(difficultyParam)}`}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                            Practice This Topic
                        </Link>
                    </div>

                    <div className="mt-8 space-y-6">
                        {reviewData.map((item) => (
                            <article
                                key={item.id}
                                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-medium text-slate-500">
                                                Question {item.index + 1}
                                            </p>
                                            {item.difficulty && (
                                                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                    {item.difficulty}
                                                </span>
                                            )}
                                            {item.markedForReview && (
                                                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                    Marked for review
                                                </span>
                                            )}
                                        </div>

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
                                        {item.options.map((option, optionIndex) => {
                                            const isSelected = item.selectedAnswer === option;
                                            const isCorrectOption = item.correctAnswer === option;

                                            return (
                                                <div
                                                    key={option}
                                                    className={`rounded-2xl border p-4 ${isCorrectOption
                                                            ? "border-green-300 bg-green-50"
                                                            : isSelected && !isCorrectOption
                                                                ? "border-red-300 bg-red-50"
                                                                : "border-slate-200 bg-white"
                                                        }`}
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div className="flex items-start gap-3">
                                                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                                                                {String.fromCharCode(65 + optionIndex)}
                                                            </span>
                                                            <span className="font-medium text-slate-800">{option}</span>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            {isSelected && (
                                                                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                                                                    Your answer
                                                                </span>
                                                            )}
                                                            {isCorrectOption && (
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
                                            <p className="text-sm font-medium text-slate-500">Your Answer</p>
                                            <p className="mt-2 font-semibold text-slate-900">{item.selectedAnswer}</p>
                                        </div>

                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm font-medium text-slate-500">Correct Answer</p>
                                            <p className="mt-2 font-semibold text-slate-900">{item.correctAnswer}</p>
                                        </div>
                                    </div>

                                    {item.explanation && (
                                        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                                            <p className="text-sm font-semibold text-blue-700">Explanation</p>
                                            <p className="mt-2 leading-7 text-slate-700">{item.explanation}</p>
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
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Live Test</p>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {formatCategory} Test
                        </h1>
                    </div>

                    <div
                        className={`rounded-2xl px-4 py-2 shadow-sm ${isTimeLow ? "bg-red-100 text-red-700" : "bg-slate-900 text-white"
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
            </header>

            <section className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Difficulty</p>
                        <p className="mt-2 text-lg font-bold text-slate-900">{difficultyLabel}</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Questions</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">{questions.length}</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Answered</p>
                        <p className="mt-2 text-3xl font-bold text-emerald-600">{answeredCount}</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Marked</p>
                        <p className="mt-2 text-3xl font-bold text-amber-600">{markedCount}</p>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">Mode</p>
                        <p className="mt-2 text-lg font-bold text-slate-900">
                            {strictParam ? "Strict Test" : "Standard Test"}
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-slate-900">Question Navigation</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Jump, track progress, and mark doubtful questions.
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

                        <div className="mb-5 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => toggleMarkForReview(currentIndex)}
                                className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${markedQuestions[currentIndex]
                                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                    }`}
                            >
                                {markedQuestions[currentIndex] ? "Unmark Review" : "Mark Review"}
                            </button>

                            <button
                                onClick={goToNextUnanswered}
                                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                Next Unanswered
                            </button>

                            <button
                                onClick={goToNextMarked}
                                className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                                Go to Marked Question
                            </button>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2 text-xs font-medium">
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-white">Current</span>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                                Answered
                            </span>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                                Review
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                                Unanswered
                            </span>
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((_, index) => {
                                const isActive = index === currentIndex;
                                const isAnswered = !!selectedAnswers[index];
                                const isMarked = !!markedQuestions[index];

                                let paletteClass =
                                    "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent";

                                if (isAnswered) {
                                    paletteClass =
                                        "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-transparent";
                                }

                                if (isMarked) {
                                    paletteClass =
                                        "bg-amber-100 text-amber-700 hover:bg-amber-200 border border-transparent";
                                }

                                if (isActive) {
                                    paletteClass =
                                        "bg-black text-white border border-black shadow-sm";
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => goToQuestion(index)}
                                        className={`relative flex min-h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition ${paletteClass}`}
                                    >
                                        {index + 1}
                                        {isMarked && !isActive && (
                                            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-3">
                            <div className="rounded-2xl bg-slate-50 p-3 text-center">
                                <p className="text-xs font-medium text-slate-500">Answered</p>
                                <p className="mt-1 text-lg font-bold text-slate-900">{answeredCount}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3 text-center">
                                <p className="text-xs font-medium text-slate-500">Marked</p>
                                <p className="mt-1 text-lg font-bold text-amber-600">{markedCount}</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 p-3 text-center">
                                <p className="text-xs font-medium text-slate-500">Left</p>
                                <p className="mt-1 text-lg font-bold text-slate-900">{notAnsweredCount}</p>
                            </div>
                        </div>
                    </aside>

                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <p className="text-sm font-medium text-slate-500">
                                    Question {currentIndex + 1} of {questions.length}
                                </p>
                                {question?.difficulty && (
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                        {question.difficulty}
                                    </span>
                                )}
                                {markedQuestions[currentIndex] && (
                                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                        Marked for review
                                    </span>
                                )}
                            </div>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {selectedAnswers[currentIndex] ? "Answered" : "Not Answered"}
                            </span>
                        </div>

                        <h2 className="mt-4 text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                            {question?.question}
                        </h2>

                        <div className="mt-8 space-y-4">
                            {question?.options.map((option, optionIndex) => {
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

                        <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={previousQuestion}
                                    disabled={currentIndex === 0}
                                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <button
                                    onClick={() => toggleMarkForReview(currentIndex)}
                                    className={`inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition ${markedQuestions[currentIndex]
                                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                            : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                        }`}
                                >
                                    {markedQuestions[currentIndex] ? "Unmark Review" : "Mark for Review"}
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
                                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
                            >
                                {submitting ? "Submitting..." : "Submit Test"}
                            </button>
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}