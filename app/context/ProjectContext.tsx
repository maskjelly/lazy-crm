"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface ProjectInfo {
  name: string;
  taskCounts: {
    done: number;
    working: number;
    upcoming: number;
  };
}

interface ProjectState {
  projects: ProjectInfo[];
  lastFetched: number | null;
}

type ProjectAction = 
  | { type: 'SET_PROJECTS'; payload: ProjectInfo[] }
  | { type: 'CLEAR_CACHE' };

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
} | undefined>(undefined);

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, lastFetched: Date.now() };
    case 'CLEAR_CACHE':
      return { projects: [], lastFetched: null };
    default:
      return state;
  }
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, { projects: [], lastFetched: null });

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