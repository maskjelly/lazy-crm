"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/app/components/ui/card";

const TaskColumn = ({ title, color }: { title: string; color: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex-1"
  >
    <Card title={title}>
      <div className={`h-64 ${color} rounded-lg p-4`}>
        {/* Task items would go here */}
      </div>
    </Card>
  </motion.div>
);

export default function ProjectPage() {
  const { projectName } = useParams();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <h1 className="text-2xl font-bold mb-6">{decodeURIComponent(projectName as string)}</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <TaskColumn title="Done" color="bg-green-500 bg-opacity-20" />
        <TaskColumn title="Working" color="bg-yellow-500 bg-opacity-20" />
        <TaskColumn title="Upcoming" color="bg-red-500 bg-opacity-20" />
      </div>
    </motion.div>
  );
}