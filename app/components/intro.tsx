"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero1 = () => {
  return (
    <section className="py-10 md:py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center mx-auto max-w-3xl"
      >
        <p className="relative mb-6">
          <span className="inline-block rounded-full border border-accent px-3 py-1.5 text-xs">
            This is pre-alpha
          </span>
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          By Freelancers{" "}
          <span className="block text-accent mt-2">For Freelancers</span>
        </h1>
        <p className="text-sm md:text-base mb-8">
          Let your clients see your progress on their product without wasting their time.
          <span className="block mt-2">
            Interactive element of response which allows clients and freelancers
            work in sync without wasting time on meetings
          </span>
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/dashboard">
            <button className="btn btn-primary">Dashboard</button>
          </Link>
          <button className="btn btn-secondary">Learn More</button>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero1;
