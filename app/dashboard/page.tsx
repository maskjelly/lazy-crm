"use client";

import { ProjectMaker } from "@/app/action/makeProject";
import { useState, FormEvent, useEffect } from "react";
import { getProjects } from "../action/getProject";
import { Projects } from "../components/userdata";
import { Notification } from "../components/Notification";
import { motion } from "framer-motion";

export default function HOME() {
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' as const, isVisible: false });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setIsLoading(true);
    try {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects.map(project => project.name));
    } catch (error) {
      showNotification('Failed to fetch projects', 'error');
    }
    setIsLoading(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await ProjectMaker(projectName);
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
      className="p-4 max-w-4xl mx-auto"
    >
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="input flex-grow"
            disabled={isLoading}
          />
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : (
        <Projects projectNames={projects} />
      )}

      <Notification {...notification} />
    </motion.div>
  );
}
