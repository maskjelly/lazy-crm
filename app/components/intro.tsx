"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const Hero1 = () => {
  return (
    <section className="py-6 md:py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center mx-auto max-w-3xl"
      >
        <p className="relative mb-4 md:mb-6">
          <span className="inline-block rounded-full border border-accent px-2 py-1 text-xs">
            This is pre-alpha
          </span>
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-3 md:mb-4">
          By Freelancers{" "}
          <span className="block text-accent mt-1 md:mt-2">
            For Freelancers
          </span>
        </h1>
        <p className="text-sm md:text-base mb-6 md:mb-8">
          Let your clients see your progress on their product without wasting
          their time.
          <span className="block mt-2">
            Interactive element of response which allows clients and freelancers
            work in sync without wasting time on meetings
          </span>
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 w-full">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <button className="btn btn-primary w-full">Dashboard</button>
          </Link>
          <Link href="/user" className="w-full sm:w-auto">
            <button className="btn btn-secondary w-full sm:w-auto">
              Learn More
            </button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero1;
