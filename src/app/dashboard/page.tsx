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

export default function DashboardPage() {
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
          {categories.map((category) => (
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
                  <Link
                    href={`/practice/${category.slug}`}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Practice Mode
                  </Link>

                  <Link
                    href={`/test/${category.slug}`}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Test Mode
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}