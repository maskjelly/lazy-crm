"use client";

import { ProjectMaker } from "@/app/action/makeProject";
import { useState, FormEvent } from "react";
import { getProjects } from "../action/getProject";
import { fetchInvitations } from "../action/invitations";
import { Projects } from "../components/userdata";
import { Notification } from "../components/Notification";
import { motion } from "framer-motion";
import { useProjectContext } from "../context/ProjectContext";
import { ProjectsSkeleton } from "../components/Skeleton";
import { InvitationsTab } from '../components/InvitationsTab';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css'; // You might need to install react-tabs: npm install react-tabs

export default function HOME() {
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const { state, dispatch } = useProjectContext();

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
      await refreshData();
      showNotification('Project created successfully', 'success');
    } catch (error) {
      showNotification('Failed to create project', 'error');
    }
    setIsLoading(false);
  }

  async function refreshData() {
    setIsLoading(true);
    try {
      const [fetchedProjects, fetchedInvitations] = await Promise.all([
        getProjects(),
        fetchInvitations()
      ]);
      dispatch({ type: 'SET_PROJECTS', payload: fetchedProjects });
      dispatch({ type: 'SET_INVITATIONS', payload: fetchedInvitations });
      const allTasks = fetchedProjects.flatMap(project => project.tasks);
      dispatch({ type: 'SET_TASKS', payload: allTasks });
      showNotification('Data refreshed successfully', 'success');
    } catch (error) {
      console.error("Error refreshing data:", error);
      showNotification('Failed to refresh data', 'error');
    } finally {
      setIsLoading(false);
    }
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

      <button onClick={refreshData} className="btn btn-secondary mb-4" disabled={isLoading}>
        {isLoading ? 'Refreshing...' : 'Refresh Data'}
      </button>

      <Tabs>
        <TabList>
          <Tab>Projects</Tab>
          <Tab>Invitations</Tab>
        </TabList>
        <TabPanel>
          {!state.dataFetched ? (
            <ProjectsSkeleton />
          ) : (
            <Projects projects={state.projects} />
          )}
        </TabPanel>
        <TabPanel>
          <InvitationsTab />
        </TabPanel>
      </Tabs>

      <Notification {...notification} />
    </motion.div>
  );
}
