"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white shadow-md">
        <h1 className="text-3xl font-bold text-black">
          SpeedQuant
        </h1>

        {!session ? (
          <button
            onClick={() => signIn("google")}
            className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Login
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <img
              src={session.user?.image || ""}
              alt="profile"
              className="w-10 h-10 rounded-full"
            />

            <p className="font-medium">
              {session.user?.name}
            </p>

            <button
              onClick={() => signOut()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28">
        <h1 className="text-6xl font-bold max-w-4xl leading-tight">
          Master Aptitude with AI-Powered Practice
        </h1>

        <p className="text-gray-600 text-lg mt-6 max-w-2xl">
          Practice logical reasoning, quantitative aptitude,
          verbal ability, probability and more with
          smart AI-generated questions and timed tests.
        </p>

        {!session && (
          <button
            onClick={() => signIn("google")}
            className="mt-10 bg-black text-white px-8 py-4 rounded-xl text-lg hover:bg-gray-800 transition"
          >
            Start Practicing
          </button>
        )}
      </section>

      {/* Categories */}
      <section className="px-8 pb-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Categories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "Numerical Aptitude",
            "Logical Reasoning",
            "Verbal Ability",
            "Probability",
          ].map((item) => (
            <div
              key={item}
              className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition"
            >
              <h3 className="text-2xl font-semibold">
                {item}
              </h3>

              <p className="text-gray-500 mt-3">
                Practice important aptitude questions
                with AI-generated explanations.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}