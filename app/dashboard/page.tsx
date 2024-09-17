"use client";

import { ProjectMaker } from "@/app/action/makeProject";
import { useState, FormEvent, useEffect } from "react";
import { getProjects } from "../action/getProject";
import { Projects } from "../components/userdata";
import { Notification } from "../components/Notification";
import { motion } from "framer-motion";
import { useProjectContext } from "../context/ProjectContext";
import { ProjectsSkeleton } from "../components/Skeleton";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export default function HOME() {
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const { state, dispatch } = useProjectContext();

  async function fetchProjects(forceRefresh = false) {
    if (!forceRefresh && state.projects.length > 0 && state.lastFetched && Date.now() - state.lastFetched < CACHE_DURATION) {
      // Use cached projects if they exist and are not expired
      setIsInitialLoading(false);
      return;
    }

    try {
      const fetchedProjects = await getProjects();
      dispatch({ type: 'SET_PROJECTS', payload: fetchedProjects });
    } catch (error) {
      console.error("Error fetching projects:", error);
      showNotification('Failed to fetch projects', 'error');
    } finally {
      setIsInitialLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []); // Empty dependency array to run only on mount

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
      await fetchProjects(true); // Force refresh projects after creating a new one
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

      {isInitialLoading ? (
        <ProjectsSkeleton />
      ) : (
        <Projects projects={state.projects} />
      )}

      <Notification {...notification} />
    </motion.div>
  );
}
