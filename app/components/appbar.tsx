"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export const Appbar = () => {
  const { data: session } = useSession();

  return (
    <div className="border-b border-accent p-4 flex justify-between items-center">
      <div className="font-bold text-lg">Lazy-Crm</div>
      <AnimatePresence mode="wait">
        {session ? (
          <motion.div
            key="signed-in"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-4"
          >
            <span className="text-sm">{session.user?.name}</span>
            <button onClick={() => signOut()} className="btn btn-secondary text-sm">
              Sign Out
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="signed-out"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            onClick={() => signIn()}
            className="btn btn-primary text-sm"
          >
            Sign In
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
