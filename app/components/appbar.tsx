"use client";
import { signIn, signOut, useSession } from "next-auth/react";


export const Appbar = () => {
  const session = useSession();
  return (
    <>
      <button onClick={() => signIn()}>Signin </button>
      <button onClick={() => signOut()}>fUCK oFF</button>
      {JSON.stringify(session)}
    </>
  );
};
