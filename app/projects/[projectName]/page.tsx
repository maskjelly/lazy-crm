"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/app/components/ui/card";
import Link from "next/link";
import { useProjectContext } from "@/app/context/ProjectContext";
import { useState } from "react";
import { DeleteConfirmationModal } from "@/app/components/DeleteConfirmationModal";
import { deleteProject } from "@/app/action/deleteProject";
import { Trash2 } from 'lucide-react';

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
  const { state, dispatch } = useProjectContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const project = state.projects.find(p => p.name === decodeURIComponent(projectName as string));

  if (!project) {
    router.push('/dashboard');
    return null;
  }

  const handleDeleteProject = async () => {
    try {
      await deleteProject(project.name);
      dispatch({ type: 'CLEAR_CACHE' });
      router.push('/dashboard');
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-64 bg-background border-b md:border-r border-accent p-4 md:h-screen md:overflow-y-auto"
      >
        <h2 className="text-lg md:text-xl font-bold mb-4">Projects</h2>
        {state.projects.map((p, index) => (
          <Link key={index} href={`/projects/${encodeURIComponent(p.name)}`}>
            <div className={`p-2 rounded-lg mb-2 cursor-pointer ${p.name === project.name ? 'bg-accent text-background' : 'hover:bg-accent hover:bg-opacity-10'}`}>
              {p.name}
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-4"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-0">{project.name}</h1>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <Link href="/dashboard" className="w-full md:w-auto">
              <button className="btn btn-secondary w-full md:w-auto mb-2 md:mb-0">Back to Dashboard</button>
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-primary bg-red-500 hover:bg-red-600 flex items-center justify-center w-full md:w-auto"
            >
              <Trash2 size={18} className="mr-2" />
              Delete Project
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <TaskColumn title={`Done (${project.taskCounts.done})`} color="bg-green-500 bg-opacity-20" />
          <TaskColumn title={`Working (${project.taskCounts.working})`} color="bg-yellow-500 bg-opacity-20" />
          <TaskColumn title={`Upcoming (${project.taskCounts.upcoming})`} color="bg-red-500 bg-opacity-20" />
        </div>
      </motion.div>

      <DeleteConfirmationModal
        projectName={showDeleteModal ? project.name : null}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
}