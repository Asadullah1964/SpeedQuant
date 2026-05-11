"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      {!session ? (
        <button
          onClick={() => signIn("google")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      ) : (
        <>
          <h1>Welcome {session.user?.name}</h1>

          <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}