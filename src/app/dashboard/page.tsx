"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const categories = [
  {
    title: "Numerical Aptitude",
    slug: "numerical",
    description: "Percentages, profit & loss, time & work and more.",
    count: "120+ Questions",
    color: "from-slate-900 to-slate-700",
  },
  {
    title: "Logical Reasoning",
    slug: "logical",
    description: "Puzzles, coding-decoding, blood relations and logic.",
    count: "95+ Questions",
    color: "from-blue-900 to-blue-700",
  },
  {
    title: "Verbal Ability",
    slug: "verbal",
    description: "Grammar, synonyms, antonyms and comprehension.",
    count: "80+ Questions",
    color: "from-emerald-900 to-emerald-700",
  },
  {
    title: "Probability",
    slug: "probability",
    description: "Probability, permutations and combinations.",
    count: "60+ Questions",
    color: "from-purple-900 to-purple-700",
  },
];

type DifficultyKey = "all" | "easy" | "medium" | "hard";

type ModeSettings = {
  practice: {
    open: boolean;
    difficulties: DifficultyKey[];
  };
  test: {
    open: boolean;
    difficulties: DifficultyKey[];
    questionCount: number;
    strictMode: boolean;
  };
};

const defaultSettings: Record<string, ModeSettings> = Object.fromEntries(
  categories.map((category) => [
    category.slug,
    {
      practice: {
        open: false,
        difficulties: ["all"],
      },
      test: {
        open: false,
        difficulties: ["easy"],
        questionCount: 10,
        strictMode: false,
      },
    },
  ])
);

export default function DashboardPage() {
  const [settings, setSettings] =
    useState<Record<string, ModeSettings>>(defaultSettings);

  function togglePanel(
    slug: string,
    mode: "practice" | "test"
  ) {
    setSettings((prev) => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        practice: {
          ...prev[slug].practice,
          open: mode === "practice" ? !prev[slug].practice.open : false,
        },
        test: {
          ...prev[slug].test,
          open: mode === "test" ? !prev[slug].test.open : false,
        },
      },
    }));
  }

  function updatePracticeDifficulties(slug: string, value: DifficultyKey) {
    setSettings((prev) => {
      const current = prev[slug].practice.difficulties;

      let next: DifficultyKey[] = current;

      if (value === "all") {
        next = ["all"];
      } else {
        const withoutAll = current.filter((item) => item !== "all");
        const exists = withoutAll.includes(value);

        next = exists
          ? withoutAll.filter((item) => item !== value)
          : [...withoutAll, value];

        if (next.length === 0) {
          next = ["all"];
        }
      }

      return {
        ...prev,
        [slug]: {
          ...prev[slug],
          practice: {
            ...prev[slug].practice,
            difficulties: next,
          },
        },
      };
    });
  }

  function updateTestDifficulties(slug: string, value: DifficultyKey) {
    setSettings((prev) => {
      const current = prev[slug].test.difficulties;
      let next: DifficultyKey[] = current;

      if (value === "all") {
        next = ["all"];
      } else {
        const withoutAll = current.filter((item) => item !== "all");
        const exists = withoutAll.includes(value);

        next = exists
          ? withoutAll.filter((item) => item !== value)
          : [...withoutAll, value];

        if (next.length === 0) {
          next = ["all"];
        }
      }

      return {
        ...prev,
        [slug]: {
          ...prev[slug],
          test: {
            ...prev[slug].test,
            difficulties: next,
          },
        },
      };
    });
  }

  function buildPracticeHref(slug: string) {
    const params = new URLSearchParams();
    params.set("difficulty", settings[slug].practice.difficulties.join(","));
    return `/practice/${slug}?${params.toString()}`;
  }

  function buildTestHref(slug: string) {
    const { difficulties, questionCount, strictMode } = settings[slug].test;
    const params = new URLSearchParams();

    params.set("difficulty", difficulties.join(","));
    params.set("count", String(questionCount));
    params.set("strict", String(strictMode));

    return `/test/${slug}?${params.toString()}`;
  }

  const difficultyOptions: DifficultyKey[] = useMemo(
    () => ["all", "easy", "medium", "hard"],
    []
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">Welcome back</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            SpeedQuant Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Categories</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">4</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Practice Sets</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">350+</h2>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Modes</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              Practice & Test
            </h2>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Choose a category
          </h2>
          <p className="mt-2 text-lg text-slate-600">
            Select a topic area and continue with practice mode or full test mode.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {categories.map((category) => {
            const categorySettings = settings[category.slug];

            return (
              <div
                key={category.slug}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                  <p className="text-sm font-medium text-white/80">Category</p>
                  <h3 className="mt-2 text-2xl font-bold">{category.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">
                    {category.description}
                  </p>
                </div>

                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {category.count}
                    </span>
                    <span className="text-sm font-medium text-slate-400">
                      Ready to start
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => togglePanel(category.slug, "practice")}
                      className="inline-flex flex-1 items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Practice Mode
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePanel(category.slug, "test")}
                      className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Test Mode
                    </button>
                  </div>

                  {categorySettings.practice.open && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <fieldset>
                        <legend className="text-sm font-semibold text-slate-900">
                          Practice difficulty
                        </legend>

                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {difficultyOptions.map((difficulty) => {
                            const checked =
                              categorySettings.practice.difficulties.includes(
                                difficulty
                              );

                            return (
                              <label
                                key={difficulty}
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    updatePracticeDifficulties(
                                      category.slug,
                                      difficulty
                                    )
                                  }
                                  className="h-4 w-4 rounded border-slate-300"
                                />
                                <span className="capitalize">{difficulty}</span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>

                      <div className="mt-4">
                        <Link
                          href={buildPracticeHref(category.slug)}
                          className="inline-flex items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Continue Practice
                        </Link>
                      </div>
                    </div>
                  )}

                  {categorySettings.test.open && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <fieldset>
                        <legend className="text-sm font-semibold text-slate-900">
                          Test difficulty
                        </legend>

                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {difficultyOptions.map((difficulty) => {
                            const checked =
                              categorySettings.test.difficulties.includes(
                                difficulty
                              );

                            return (
                              <label
                                key={difficulty}
                                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    updateTestDifficulties(
                                      category.slug,
                                      difficulty
                                    )
                                  }
                                  className="h-4 w-4 rounded border-slate-300"
                                />
                                <span className="capitalize">{difficulty}</span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>

                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor={`question-count-${category.slug}`}
                            className="mb-2 block text-sm font-semibold text-slate-900"
                          >
                            Number of questions
                          </label>
                          <input
                            id={`question-count-${category.slug}`}
                            type="number"
                            min={1}
                            max={50}
                            value={categorySettings.test.questionCount}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                [category.slug]: {
                                  ...prev[category.slug],
                                  test: {
                                    ...prev[category.slug].test,
                                    questionCount: Number(e.target.value) || 1,
                                  },
                                },
                              }))
                            }
                            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                          />
                        </div>

                        <fieldset>
                          <legend className="mb-2 text-sm font-semibold text-slate-900">
                            Strict mode
                          </legend>
                          <label className="flex min-h-[48px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                            <input
                              type="checkbox"
                              checked={categorySettings.test.strictMode}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  [category.slug]: {
                                    ...prev[category.slug],
                                    test: {
                                      ...prev[category.slug].test,
                                      strictMode: e.target.checked,
                                    },
                                  },
                                }))
                              }
                              className="h-4 w-4 rounded border-slate-300"
                            />
                            <span>
                              Enable strict timing
                            </span>
                          </label>
                        </fieldset>
                      </div>

                      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        Default timing: 1 minute per question. Strict mode timing:
                        easy = 20 sec, medium = 40 sec, hard = 60 sec.
                      </div>

                      <div className="mt-4">
                        <Link
                          href={buildTestHref(category.slug)}
                          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Start Test
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}