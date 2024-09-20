"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/app/components/ui/card";
import Link from "next/link";
import { useProjectContext } from "@/app/context/ProjectContext";
import { useState, useEffect, useCallback } from "react";
import { DeleteConfirmationModal } from "@/app/components/DeleteConfirmationModal";
import { deleteProject } from "@/app/action/deleteProject";
import { getProjects } from "@/app/action/getProject";
import { ProjectsSkeleton } from "@/app/components/Skeleton";
import { addTask, deleteTask } from "@/app/action/projectTasks";
import { AddTaskModal } from "@/app/components/AddTaskModal";
import { TaskInfo, TaskStatus } from "@/app/types";
import { showNotification } from "@/app/utils/notifications";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { updateTaskStatus } from "@/app/action/projectTasks";
import { ChevronDown, ChevronUp, Plus, Loader2, Trash2, PlusCircle } from "lucide-react";
import { InviteCollaborator } from '@/app/components/InviteCollaborator';
import { useSocket } from '@/app/context/SocketContext';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function TaskColumn({ title, color, status, tasks, onDeleteTask, onAddTask }: { 
  title: string; 
  color: string; 
  status: TaskStatus; 
  tasks: TaskInfo[]; 
  onDeleteTask: (taskId: number) => void;
  onAddTask: (taskDetails: string, status: TaskStatus) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; taskId: number } | null>(null);
  const [newTaskDetails, setNewTaskDetails] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleContextMenu = (e: React.MouseEvent, taskId: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, taskId });
  };

  const handleDeleteTask = (taskId: number) => {
    onDeleteTask(taskId);
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskDetails.trim()) {
      setIsAddingTask(true);
      await onAddTask(newTaskDetails, status);
      setNewTaskDetails('');
      setIsAddingTask(false);
    }
  };

  const filteredTasks = tasks.filter(task => task.taskUpdate === status);

  return (
    <div className="flex-1">
      <Card title={title} className="h-full">
        <div 
          className="md:hidden flex justify-between items-center p-2 cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <h3 className="font-semibold">{title} ({filteredTasks.length})</h3>
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div 
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`${color} rounded-lg p-4 overflow-y-auto transition-all duration-300 ease-in-out ${
                isCollapsed ? 'h-0 md:min-h-[calc(100vh-250px)]' : 'min-h-[calc(100vh-250px)]'
              }`}
              style={{
                maxHeight: isCollapsed ? '0' : `calc(100vh - 250px + ${Math.max(0, filteredTasks.length - 5) * 60}px)`,
              }}
            >
              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="mb-4">
                <div className="flex items-center bg-white bg-opacity-10 rounded-lg overflow-hidden">
                  <input
                    type="text"
                    value={newTaskDetails}
                    onChange={(e) => setNewTaskDetails(e.target.value)}
                    placeholder={`Add a task to ${title}`}
                    className="flex-grow p-2 bg-transparent border-none focus:outline-none text-sm"
                  />
                  <button 
                    type="submit" 
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 transition-colors"
                    disabled={isAddingTask}
                  >
                    {isAddingTask ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <PlusCircle size={20} />
                    )}
                  </button>
                </div>
              </form>

              {/* Existing Tasks */}
              {!isCollapsed && filteredTasks.map((task, index) => (
                <Draggable key={task.id.toString()} draggableId={task.id.toString()} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`mb-2 p-3 bg-black rounded shadow hover:shadow-md transition-all duration-300 ease-in-out ${
                        snapshot.isDragging ? 'opacity-50 scale-105' : ''
                      }`}
                      onContextMenu={(e) => handleContextMenu(e, task.id)}
                    >
                      <p className="text-sm font-medium break-words text-white">{task.taskDetails}</p>
                    </div>
                  )}
                </Draggable>
              ))}
              {snapshot.isDraggingOver && (
                <div className="h-16 bg-accent bg-opacity-20 border-2 border-dashed border-accent rounded mb-2 transition-all duration-200"></div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Card>
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
          }}
          className="bg-white shadow-md rounded-md overflow-hidden"
        >
          <button
            onClick={() => handleDeleteTask(contextMenu.taskId)}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Delete Task
          </button>
        </div>
      )}
    </div>
  );
}

export default function ProjectPage() {
  const params = useParams();
  const projectName = params?.projectName as string;
  const router = useRouter();
  const { state, dispatch } = useProjectContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const { socket } = useSocket();

  const project = state.projects.find(p => p.name === decodeURIComponent(projectName));
  const tasks = project ? state.tasks.filter(task => task.projectId === project.id) : [];

  const fetchProjects = useCallback(async (forceRefresh = false) => {
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
  }, [dispatch, state.projects.length, state.lastFetched]);

  useEffect(() => {
    if (state.projects.length === 0 || !state.lastFetched) {
      fetchProjects(true);
    } else {
      setIsInitialLoading(false);
    }
  }, [fetchProjects, state.projects.length, state.lastFetched]);

  useEffect(() => {
    if (socket && project) {
      socket.emit('joinProject', project.id);

      socket.on('taskAdded', (newTask: TaskInfo) => {
        dispatch({ type: 'ADD_TASK', payload: newTask });
      });

      socket.on('taskUpdated', (updatedTask: TaskInfo) => {
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      });

      socket.on('taskDeleted', (deletedTaskId: number) => {
        dispatch({ type: 'REMOVE_TASK', payload: deletedTaskId });
      });

      return () => {
        socket.off('taskAdded');
        socket.off('taskUpdated');
        socket.off('taskDeleted');
      };
    }
  }, [socket, project, dispatch]);

  // Add these console logs
  console.log("isInitialLoading:", isInitialLoading);
  console.log("project:", project);
  console.log("tasks:", tasks);

  if (isInitialLoading) {
    return <ProjectsSkeleton />;
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Project not found. Redirecting to dashboard...</p>
      </div>
    );
  }

  const handleDeleteProject = async () => {
    if (!project) return;
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

  const handleAddTask = async (taskDetails: string, taskStatus: TaskStatus) => {
    if (!project) return;
    const result = await addTask(project.id, taskDetails, taskStatus);
    if (result.success && 'task' in result) {
      socket?.emit('taskAdded', result.task);
    } else {
      showNotification('Failed to add task', 'error');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!project) {
      console.error("Project not found");
      showNotification('Failed to delete task: Project not found', 'error');
      return;
    }

    const taskToDelete = tasks.find(task => task.id === taskId);
    if (!taskToDelete) {
      console.error("Task not found");
      showNotification('Failed to delete task: Task not found', 'error');
      return;
    }

    try {
      await deleteTask(taskId);
      // Emit the socket event before updating the local state
      socket?.emit('taskDeleted', { taskId, projectId: project.id });
      
      // Update local state
      dispatch({ type: 'REMOVE_TASK', payload: taskId });
      dispatch({
        type: 'UPDATE_PROJECT_TASK_COUNTS',
        payload: { projectId: project.id, oldStatus: taskToDelete.taskUpdate, newStatus: null }
      });
      showNotification('Task deleted successfully', 'success');
    } catch (error) {
      console.error("Failed to delete task:", error);
      showNotification('Failed to delete task', 'error');
    }
  };

  const onDragEnd = async (result: DropResult) => {
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
    const oldStatus = source.droppableId as TaskStatus;

    // Optimistically update the UI
    const updatedTasks = [...tasks];
    const [reorderedTask] = updatedTasks.splice(updatedTasks.findIndex(task => task.id === taskId), 1);
    reorderedTask.taskUpdate = newStatus;
    updatedTasks.splice(destination.index, 0, reorderedTask);

    dispatch({
      type: 'SET_TASKS',
      payload: updatedTasks
    });

    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus);
      dispatch({
        type: 'UPDATE_PROJECT_TASK_COUNTS',
        payload: { projectId: project!.id, oldStatus, newStatus }
      });
      socket?.emit('taskUpdated', { ...updatedTask, projectId: project!.id });
    } catch (error) {
      console.error("Failed to update task status:", error);
      showNotification('Failed to update task status', 'error');
      
      // Revert the changes in case of failure
      dispatch({
        type: 'SET_TASKS',
        payload: tasks
      });
    }
  };

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
              <Plus size={18} className="mr-2" />
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
              title="Done" 
              color="bg-green-500 bg-opacity-20" 
              status="Completed" 
              tasks={tasks}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
            />
            <TaskColumn 
              title="Working" 
              color="bg-yellow-500 bg-opacity-20" 
              status="Working" 
              tasks={tasks}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
            />
            <TaskColumn 
              title="Upcoming" 
              color="bg-red-500 bg-opacity-20" 
              status="Pending" 
              tasks={tasks}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
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

      {project.isOwner && <InviteCollaborator projectId={project.id} />}
    </div>
  );
}