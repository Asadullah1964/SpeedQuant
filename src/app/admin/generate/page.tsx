"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";

const categoryTopics: Record<string, string[]> = {
  numerical: ["percentage", "profit and loss", "ratio and proportion", "time and work"],
  logical: ["blood relation", "seating arrangement", "coding decoding", "direction sense"],
  verbal: ["synonyms", "antonyms", "reading comprehension", "sentence correction"],
  probability: ["basic probability", "conditional probability", "permutation and combination", "dice and cards"],
};

export default function GeneratePage() {
  const { data: session, status } = useSession();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const [category, setCategory] = useState("numerical");
  const [topic, setTopic] = useState("percentage");
  const [difficulty, setDifficulty] = useState("easy");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "idle">("idle");

  const isAdmin = session?.user?.email === adminEmail;

  const availableTopics = useMemo(() => {
    return categoryTopics[category] || [];
  }, [category]);

  const helperText = useMemo(() => {
    return `${count} ${difficulty} ${category} question${count > 1 ? "s" : ""} on ${topic}.`;
  }, [count, difficulty, category, topic]);

  async function generateQuestions() {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("idle");

      const safeCount = Math.min(50, Math.max(1, count));

      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          topic,
          difficulty,
          count: safeCount,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`${data.count} questions generated successfully.`);
        setMessageType("success");
      } else {
        setMessage(data.message || "Failed to generate questions.");
        setMessageType("error");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while generating questions.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 px-6 py-10">
          <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="space-y-4">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-8 w-52 animate-pulse rounded bg-slate-200" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-50 px-6 py-10">
          <div className="mx-auto flex w-full max-w-xl items-center justify-center">
            <div className="w-full rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-2xl font-bold text-red-600">
                !
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
                Access denied
              </h1>
              <p className="mt-3 text-slate-500">
                You do not have permission to open the AI question generator panel.
              </p>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Signed in as{" "}
                <span className="font-semibold text-slate-900">
                  {session?.user?.email || "Unknown user"}
                </span>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
                  Admin Panel
                </p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                  AI Question Generator
                </h1>
                <p className="mt-3 max-w-2xl text-slate-600">
                  Generate structured aptitude questions by category, topic, and
                  difficulty, then store them for practice tests and exams.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Authorized admin
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">Category</p>
                <h2 className="mt-2 text-2xl font-bold capitalize text-slate-900">
                  {category}
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">Difficulty</p>
                <h2 className="mt-2 text-2xl font-bold capitalize text-slate-900">
                  {difficulty}
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-500">Question Count</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{count}</h2>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Generation Settings
              </h2>
              <p className="mt-2 text-slate-500">
                Choose the question pattern you want the AI to create.
              </p>
            </div>

            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCategory(value);
                    setTopic(categoryTopics[value]?.[0] || "");
                  }}
                  className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                >
                  <option value="numerical">Numerical</option>
                  <option value="logical">Logical</option>
                  <option value="verbal">Verbal</option>
                  <option value="probability">Probability</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Topic
                </label>
                <input
                  type="text"
                  list="topic-suggestions"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter topic"
                  className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                />
                <datalist id="topic-suggestions">
                  {availableTopics.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
                <p className="mt-2 text-sm text-slate-500">
                  Suggested topics: {availableTopics.join(", ")}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Difficulty
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["easy", "medium", "hard"].map((level) => {
                    const active = difficulty === level;

                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`min-h-12 rounded-2xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                          active
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Number of Questions
                </label>
                <input
                  type="number"
                  value={count}
                  min={1}
                  max={50}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900"
                />
                <p className="mt-2 text-sm text-slate-500">
                  Choose between 1 and 50 questions per generation request.
                </p>
              </div>

              <button
                onClick={generateQuestions}
                disabled={loading || !topic.trim()}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-black px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Generating Questions..." : "Generate Questions"}
              </button>

              {message && (
                <div
                  className={`rounded-2xl border p-4 text-sm font-medium ${
                    messageType === "success"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
                Preview
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Current request
              </h2>
              <p className="mt-3 text-slate-600">{helperText}</p>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Category</p>
                  <p className="mt-1 text-lg font-semibold capitalize text-slate-900">
                    {category}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">Topic</p>
                  <p className="mt-1 text-lg font-semibold capitalize text-slate-900">
                    {topic}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Difficulty</p>
                    <p className="mt-1 text-lg font-semibold capitalize text-slate-900">
                      {difficulty}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Count</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {count}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Notes</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>Generate smaller batches first to verify question quality.</li>
                <li>Keep topics specific for better AI-generated output.</li>
                <li>Validate answers server-side before saving to MongoDB.</li>
                <li>Protect the API route with a real server-side admin check.</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}