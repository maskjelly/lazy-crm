"use client";

import { ProjectMaker } from "@/app/action/makeProject";
import { useState, FormEvent, useEffect } from "react";
import { getProjects } from "../action/getProject";
import { Projects } from "../components/userdata";
import { Notification } from "../components/Notification";
import { motion } from "framer-motion";
import { useProjectContext } from "../context/ProjectContext";

// Updated skeleton component for both mobile and desktop
const ProjectSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="bg-accent bg-opacity-20 rounded-lg p-4">
        <div className="h-5 bg-accent bg-opacity-30 rounded w-3/4 mb-2"></div>
        <div className="space-y-2">
          <div className="h-4 bg-accent bg-opacity-30 rounded w-1/4"></div>
          <div className="h-4 bg-accent bg-opacity-30 rounded w-1/4"></div>
          <div className="h-4 bg-accent bg-opacity-30 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function HOME() {
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const { state, dispatch } = useProjectContext();

  async function fetchProjects() {
    setIsFetching(true);
    try {
      const fetchedProjects = await getProjects();
      dispatch({ type: 'SET_PROJECTS', payload: fetchedProjects });
    } catch (error) {
      console.error("Error fetching projects:", error);
      showNotification('Failed to fetch projects', 'error');
    }
    setIsFetching(false);
  }

  useEffect(() => {
    if (state.projects.length === 0 || Date.now() - (state.lastFetched || 0) > 5 * 60 * 1000) {
      fetchProjects();
    }
  }, [state.projects, state.lastFetched]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!projectName.trim()) {
      showNotification('Project name cannot be empty', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await ProjectMaker(projectName.trim());
      setProjectName("");
      await fetchProjects();
      showNotification('Project created successfully', 'success');
    } catch (error) {
      showNotification('Failed to create project', 'error');
    }
    setIsLoading(false);
  }

  function showNotification(message: string, type: 'success' | 'error') {
    setNotification({ message, type, isVisible: true });
    setTimeout(() => setNotification(prev => ({ ...prev, isVisible: false })), 3000);
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 max-w-6xl mx-auto"
    >
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Dashboard</h1>
      <form onSubmit={handleSubmit} className="mb-6 md:mb-8">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="input w-full"
            disabled={isLoading}
          />
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>

      {isFetching ? (
        <ProjectSkeleton />
      ) : (
        <Projects projects={state.projects} />
      )}

      <Notification {...notification} />
    </motion.div>
  );
}
