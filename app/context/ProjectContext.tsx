"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { getProjects } from "@/app/action/getProject";
import { TaskStatus, TaskInfo, ProjectInfo } from '../types';

interface ProjectState {
  projects: ProjectInfo[];
  tasks: TaskInfo[];
  lastFetched: number | null;
  dataFetched: boolean;
}

type ProjectAction = 
  | { type: 'SET_PROJECTS'; payload: ProjectInfo[] }
  | { type: 'SET_TASKS'; payload: TaskInfo[] }
  | { type: 'UPDATE_TASK'; payload: { taskId: number; newStatus: TaskStatus } }
  | { type: 'UPDATE_PROJECT_TASK_COUNTS'; payload: { projectId: number; oldStatus: TaskStatus | null; newStatus: TaskStatus | null } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'ADD_TASK'; payload: TaskInfo }
  | { type: 'REMOVE_TASK'; payload: number }
  | { type: 'UPDATE_TASK_ID'; payload: { tempId: number; realId: number } };

type LowercaseTaskStatus = 'done' | 'working' | 'upcoming';

const taskStatusToLowercase = (status: TaskStatus): LowercaseTaskStatus => {
  switch (status) {
    case 'Completed': return 'done';
    case 'Working': return 'working';
    case 'Pending': return 'upcoming';
  }
};

const ProjectContext = createContext<{
  state: ProjectState;
  dispatch: React.Dispatch<ProjectAction>;
} | undefined>(undefined);

const projectReducer = (state: ProjectState, action: ProjectAction): ProjectState => {
  switch (action.type) {
    case 'SET_PROJECTS':
      console.log("Setting projects:", action.payload);
      return { ...state, projects: action.payload, lastFetched: Date.now(), dataFetched: true };
    case 'SET_TASKS':
      console.log("Setting tasks:", action.payload);
      return { ...state, tasks: action.payload };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId
            ? { ...task, taskUpdate: action.payload.newStatus }
            : task
        )
      };
    case 'UPDATE_PROJECT_TASK_COUNTS':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                taskCounts: {
                  ...project.taskCounts,
                  ...(action.payload.oldStatus && {
                    [taskStatusToLowercase(action.payload.oldStatus)]: 
                      project.taskCounts[taskStatusToLowercase(action.payload.oldStatus)] - 1
                  }),
                  ...(action.payload.newStatus && {
                    [taskStatusToLowercase(action.payload.newStatus)]: 
                      project.taskCounts[taskStatusToLowercase(action.payload.newStatus)] + 1
                  })
                }
              }
            : project
        )
      };
    case 'CLEAR_CACHE':
      return { projects: [], tasks: [], lastFetched: null, dataFetched: false };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                taskCounts: {
                  ...project.taskCounts,
                  [taskStatusToLowercase(action.payload.taskUpdate)]: 
                    project.taskCounts[taskStatusToLowercase(action.payload.taskUpdate)] + 1
                }
              }
            : project
        )
      };
    case 'REMOVE_TASK':
      const taskToRemove = state.tasks.find(task => task.id === action.payload);
      if (!taskToRemove) return state;
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        projects: state.projects.map(project =>
          project.id === taskToRemove.projectId
            ? {
                ...project,
                taskCounts: {
                  ...project.taskCounts,
                  [taskStatusToLowercase(taskToRemove.taskUpdate)]: 
                    project.taskCounts[taskStatusToLowercase(taskToRemove.taskUpdate)] - 1
                }
              }
            : project
        )
      };
    case 'UPDATE_TASK_ID':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.tempId
            ? { ...task, id: action.payload.realId }
            : task
        )
      };
    default:
      return state;
  }
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, { projects: [], tasks: [], lastFetched: null, dataFetched: false });

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