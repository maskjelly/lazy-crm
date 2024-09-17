"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { getProjects } from "@/app/action/getProject"; // Add this import
import { TaskStatus } from '../types';

interface TaskInfo {
  id: number;
  taskDetails: string;
  taskUpdate: TaskStatus;
  projectId: number;
}

interface ProjectInfo {
  tasks: TaskInfo[];
  id: number;
  name: string;
  taskCounts: {
    done: number;
    working: number;
    upcoming: number;
  };
}

interface ProjectState {
  projects: ProjectInfo[];
  tasks: TaskInfo[];  // Add this line
  lastFetched: number | null;
}

type ProjectAction = 
  | { type: 'SET_PROJECTS'; payload: ProjectInfo[] }
  | { type: 'SET_TASKS'; payload: TaskInfo[] }  // Add this line
  | { type: 'CLEAR_CACHE' };

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
} | undefined>(undefined);

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, lastFetched: Date.now() };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };  // Add this case
    case 'CLEAR_CACHE':
      return { projects: [], tasks: [], lastFetched: null };
    default:
      return state;
  }
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, { projects: [], tasks: [], lastFetched: null });

  useEffect(() => {
    async function fetchProjects() {
      const fetchedProjects = await getProjects();
      dispatch({ type: 'SET_PROJECTS', payload: fetchedProjects });
      const allTasks = fetchedProjects.flatMap(project => project.tasks);
      dispatch({ type: 'SET_TASKS', payload: allTasks });
    }

    fetchProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};