"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { getProjects } from "@/app/action/getProject";
import { fetchInvitations } from "@/app/action/invitations";
import { TaskStatus, TaskInfo, ProjectInfo, InvitationInfo } from '../types';

interface ProjectState {
  projects: ProjectInfo[];
  tasks: TaskInfo[];
  lastFetched: number | null;
  dataFetched: boolean;
  invitations: InvitationInfo[];
}

type ProjectAction = 
  | { type: 'SET_PROJECTS'; payload: ProjectInfo[] }
  | { type: 'SET_TASKS'; payload: TaskInfo[] }
  | { type: 'UPDATE_TASK'; payload: TaskInfo }
  | { type: 'UPDATE_PROJECT_TASK_COUNTS'; payload: { projectId: number; oldStatus: TaskStatus | null; newStatus: TaskStatus | null } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'ADD_TASK'; payload: TaskInfo }
  | { type: 'REMOVE_TASK'; payload: number }
  | { type: 'UPDATE_TASK_ID'; payload: { tempId: number; realId: number } }
  | { type: 'SET_INVITATIONS'; payload: InvitationInfo[] }
  | { type: 'UPDATE_INVITATION'; payload: { id: number; status: 'ACCEPTED' | 'REJECTED' } }
  | { type: 'SET_DATA_FETCHED'; payload: boolean }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'UPDATE_PROJECT'; payload: ProjectInfo };

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
      return {
        ...state,
        tasks: action.payload,
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                taskCounts: {
                  ...project.taskCounts,
                  [taskStatusToLowercase(action.payload.taskUpdate)]:
                    project.taskCounts[taskStatusToLowercase(action.payload.taskUpdate)] + 1,
                  ...((() => {
                    const oldTask = state.tasks.find(t => t.id === action.payload.id);
                    if (oldTask) {
                      return {
                        [taskStatusToLowercase(oldTask.taskUpdate)]:
                          project.taskCounts[taskStatusToLowercase(oldTask.taskUpdate)] - 1
                      };
                    }
                    return {};
                  })())
                }
              }
            : project
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
      return { 
        projects: [], 
        tasks: [], 
        lastFetched: null, 
        dataFetched: false,
        invitations: [] // Add this line
      };
    case 'ADD_TASK':
      // Check if the task already exists before adding
      if (state.tasks.some(task => task.id === action.payload.id)) {
        return state;
      }
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
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        projects: state.projects.map(project => {
          const removedTask = state.tasks.find(task => task.id === action.payload && task.projectId === project.id);
          if (removedTask) {
            return {
              ...project,
              taskCounts: {
                ...project.taskCounts,
                [taskStatusToLowercase(removedTask.taskUpdate)]: project.taskCounts[taskStatusToLowercase(removedTask.taskUpdate)] - 1
              }
            };
          }
          return project;
        })
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
    case 'SET_INVITATIONS':
      return { ...state, invitations: action.payload };
    case 'UPDATE_INVITATION':
      return {
        ...state,
        invitations: state.invitations.map(inv =>
          inv.id === action.payload.id ? { ...inv, status: action.payload.status } : inv
        )
      };
    case 'SET_DATA_FETCHED':
      return { ...state, dataFetched: action.payload };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project => 
          project.id === action.payload.id ? action.payload : project
        ),
      };
    default:
      return state;
  }
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, { 
    projects: [], 
    tasks: [], 
    lastFetched: null, 
    dataFetched: false,
    invitations: [] // Add this line
  });

  useEffect(() => {
    async function fetchData() {
      if (!state.dataFetched) {
        try {
          const [fetchedProjects, fetchedInvitations] = await Promise.all([
            getProjects(),
            fetchInvitations()
          ]);
          dispatch({ type: 'SET_PROJECTS', payload: fetchedProjects });
          dispatch({ type: 'SET_INVITATIONS', payload: fetchedInvitations });
          const allTasks = fetchedProjects.flatMap(project => project.tasks);
          dispatch({ type: 'SET_TASKS', payload: allTasks });
          dispatch({ type: 'SET_DATA_FETCHED', payload: true });
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    }

    fetchData();
  }, [state.dataFetched]);

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