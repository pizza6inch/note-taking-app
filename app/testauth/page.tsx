"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";

export function Home() {
  const { data: session } = useSession();

  console.log("Session:", session);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
      <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
        Superblog
      </h1>

      {session ? (
        <div className="mt-8">
          <p className="text-lg mb-4">Signed in as {session.user?.email}</p>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="mt-8">
          <p className="text-lg mb-4">Not signed in</p>
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Sign in
          </button>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <SessionProvider>
      <Home />
    </SessionProvider>
  );
}
