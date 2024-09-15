"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export const Appbar = () => {
  const { data: session } = useSession();

  return (
    <div className="border-b p-4 flex justify-between items-center flex">
      <div className="font-bold ">Lazy-Crm</div>
      <div className="space-x-4">
        {session ? (
          <>
            <span>{session.user?.name}</span>
            <button onClick={() => signOut()} className="text-red-500">
              Sign Out
            </button>
          </>
        ) : (
          <button onClick={() => signIn()} className="text-blue-500">
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};
