"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/app/components/ui/card";
import Link from "next/link";
import { useProjectContext } from "@/app/context/ProjectContext";
import { useState, useEffect } from "react";
import { DeleteConfirmationModal } from "@/app/components/DeleteConfirmationModal";
import { deleteProject } from "@/app/action/deleteProject";
import { Trash2, ChevronDown, PlusCircle } from 'lucide-react';
import { getProjects } from "@/app/action/getProject";
import { ProjectsSkeleton } from "@/app/components/Skeleton";
import { addTask } from "@/app/action/projectTasks";
import { AddTaskModal } from "@/app/components/AddTaskModal";
import { TaskInfo, TaskStatus, ProjectInfo } from "@/app/types";
import { showNotification } from "@/app/utils/notifications";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { updateTaskStatus } from "@/app/action/projectTasks";

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function TaskColumn({ title, color, status, tasks }: { 
  title: string; 
  color: string; 
  status: TaskStatus; 
  tasks: TaskInfo[]; 
  project: ProjectInfo;
}) {
  return (
    <div className="flex-1">
      <Card title={title} className="h-full">
        <Droppable droppableId={status}>
          {(provided) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`h-[calc(100vh-250px)] ${color} rounded-lg p-4 overflow-y-auto`}
            >
              {tasks
                .filter(task => task.taskUpdate === status)
                .map((task, index) => (
                  <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`mb-2 p-3 bg-black rounded shadow hover:shadow-md transition-shadow ${
                          snapshot.isDragging ? 'opacity-50' : ''
                        }`}
                      >
                        <p className="text-sm font-medium break-words text-white">{task.taskDetails}</p>
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Card>
    </div>
  );
}

export default function ProjectPage() {
  const { projectName } = useParams();
  const router = useRouter();
  const { state, dispatch } = useProjectContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  const project = state.projects.find(p => p.name === decodeURIComponent(projectName as string));
  const tasks = state.tasks.filter(task => task.projectId === project?.id);

  async function fetchProjects(forceRefresh = false) {
    if (!forceRefresh && state.projects.length > 0 && state.lastFetched && Date.now() - state.lastFetched < CACHE_DURATION) {
      setIsInitialLoading(false);
      return;
    }

    try {
      setIsInitialLoading(true);
      const fetchedProjects = await getProjects();
      dispatch({ type: 'SET_PROJECTS', payload: fetchedProjects });
      const allTasks = fetchedProjects.flatMap(project => project.tasks);
      dispatch({ type: 'SET_TASKS', payload: allTasks });
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsInitialLoading(false);
    }
  }

  useEffect(() => {
    fetchProjects(true);

    // Suppress the defaultProps warning
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('defaultProps')) {
        return;
      }
      originalError.call(console, ...args);
    };

    // Restore the original console.error when the component unmounts
    return () => {
      console.error = originalError;
    };
  }, []);

  if (!project && !isInitialLoading) {
    router.push('/dashboard');
    return null;
  }

  const handleDeleteProject = async () => {
    if (!project) return; // Add this check
    try {
      await deleteProject(project.name);
      dispatch({ type: 'CLEAR_CACHE' });
      router.push('/dashboard');
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const handleProjectChange = (newProjectName: string) => {
    router.push(`/projects/${encodeURIComponent(newProjectName)}`);
    setIsComboboxOpen(false);
  };

  async function handleAddTask(taskDetails: string, taskStatus: TaskStatus) {
    if (!project) return;
    const response = await addTask(project.id, taskDetails, taskStatus);
    if (response.success) {
      setIsAddTaskModalOpen(false);
      showNotification('Task added successfully', 'success');
      await fetchProjects(true);
    } else {
      showNotification(response.error || 'Failed to add task', 'error');
    }
  }

  const onDragEnd = async (result: { destination: any; source: any; draggableId: any; }) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId as TaskStatus;

    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus);
      if (updatedTask) {
        const updatedTasks = state.tasks.map(task =>
          task.id === taskId ? { ...task, taskUpdate: newStatus } : task
        );
        dispatch({ type: 'SET_TASKS', payload: updatedTasks });
        
        // Update project task counts
        const updatedProjects = state.projects.map(p => {
          if (p.id === project?.id) {
            const taskCounts = { ...p.taskCounts };
            const sourceStatus = source.droppableId.toLowerCase() as keyof typeof taskCounts;
            const destinationStatus = destination.droppableId.toLowerCase() as keyof typeof taskCounts;
            taskCounts[sourceStatus] -= 1;
            taskCounts[destinationStatus] += 1;
            return { ...p, taskCounts };
          }
          return p;
        });
        dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });
      }
    } catch (error) {
      console.error("Failed to update task status:", error);
      showNotification('Failed to update task status', 'error');
    }
  };

  if (isInitialLoading) {
    return <ProjectsSkeleton />;
  }

  if (!project) {
    return <div>Project not found</div>; // Add this check
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Combobox */}
      <div className="md:hidden mb-4">
        <div 
          className="border border-accent rounded-lg p-2 flex justify-between items-center cursor-pointer"
          onClick={() => setIsComboboxOpen(!isComboboxOpen)}
        >
          <span>{project.name}</span>
          <ChevronDown size={20} className={`transition-transform ${isComboboxOpen ? 'rotate-180' : ''}`} />
        </div>
        {isComboboxOpen && (
          <div className="mt-1 border border-accent rounded-lg bg-background absolute z-10 w-[calc(100%-2rem)]">
            {state.projects.map((p, index) => (
              <div 
                key={index} 
                className={`p-2 cursor-pointer ${p.name === project.name ? 'bg-accent text-background' : 'hover:bg-accent hover:bg-opacity-10'}`}
                onClick={() => handleProjectChange(p.name)}
              >
                {p.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden md:block w-64 bg-background border-r border-accent p-4 h-screen overflow-y-auto fixed left-0 top-0 pt-16"
      >
        <h2 className="text-xl font-bold mb-4">Projects</h2>
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
        className="flex-1 p-4 md:ml-64"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-0">{project.name}</h1>
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <Link href="/dashboard" className="w-full md:w-auto">
              <button className="btn btn-secondary w-full md:w-auto mb-2 md:mb-0">Back to Dashboard</button>
            </Link>
            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="btn btn-primary flex items-center justify-center w-full md:w-auto"
            >
              <PlusCircle size={18} className="mr-2" />
              Add Task
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-primary bg-red-500 hover:bg-red-600 flex items-center justify-center w-full md:w-auto"
            >
              <Trash2 size={18} className="mr-2" />
              Delete Project
            </button>
          </div>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TaskColumn 
              title={`Done (${project.taskCounts.done})`} 
              color="bg-green-500 bg-opacity-20" 
              status="Completed" 
              project={project}
              tasks={project.tasks}
            />
            <TaskColumn 
              title={`Working (${project.taskCounts.working})`} 
              color="bg-yellow-500 bg-opacity-20" 
              status="Working" 
              tasks={tasks}
              project={project}
            />
            <TaskColumn 
              title={`Upcoming (${project.taskCounts.upcoming})`} 
              color="bg-red-500 bg-opacity-20" 
              status="Pending" 
              tasks={tasks}
              project={project}
            />
          </div>
        </DragDropContext>
      </motion.div>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAdd={handleAddTask}
      />

      <DeleteConfirmationModal
        projectName={showDeleteModal ? project.name : null}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProject}
      />
    </div>
  );
}