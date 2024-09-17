"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/app/components/ui/card";
import Link from "next/link";
import { useProjectContext } from "@/app/context/ProjectContext";

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
  const router = useRouter();
  const { state } = useProjectContext();

  const project = state.projects.find(p => p.name === decodeURIComponent(projectName as string));

  if (!project) {
    router.push('/dashboard');
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Link href="/dashboard">
          <button className="btn btn-secondary">Back to Dashboard</button>
        </Link>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <TaskColumn title={`Done (${project.taskCounts.done})`} color="bg-green-500 bg-opacity-20" />
        <TaskColumn title={`Working (${project.taskCounts.working})`} color="bg-yellow-500 bg-opacity-20" />
        <TaskColumn title={`Upcoming (${project.taskCounts.upcoming})`} color="bg-red-500 bg-opacity-20" />
      </div>
    </motion.div>
  );
}