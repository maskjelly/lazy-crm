'use server';

import prisma from "@/app/db";
import { TaskStatus, TaskInfo } from "@/app/types";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/app/auth/auth";
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
  path: '/api/socketio',
});

export async function addTask(projectId: number, taskDetails: string, taskUpdate: TaskStatus): Promise<{ success: true; task: TaskInfo } | { success: false; error: string }> {
  try {
    const session = await getServerSession(NEXT_AUTH);
    if (!session?.user?.email) {
      return { success: false, error: "User not authenticated" };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const newTask = await prisma.task.create({
      data: {
        taskDetails,
        taskUpdate,
        project: { connect: { id: projectId } },
        createdBy: { connect: { id: user.id } },
      },
    });

    const taskInfo: TaskInfo = {
      id: newTask.id,
      taskDetails: newTask.taskDetails,
      taskUpdate: newTask.taskUpdate as TaskStatus,
      projectId: newTask.projectId,
    };

    socket.emit('taskAdded', taskInfo);

    return { success: true, task: taskInfo };
  } catch (error) {
    console.error("Error adding task:", error);
    return { success: false, error: "Failed to add task." };
  }
}

export async function updateTaskStatus(taskId: number, newStatus: TaskStatus) {
  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { taskUpdate: newStatus },
      include: { project: true }, // Include the project to get the projectId
    });
    
    const taskInfo: TaskInfo = {
      id: updatedTask.id,
      taskDetails: updatedTask.taskDetails,
      taskUpdate: updatedTask.taskUpdate as TaskStatus,
      projectId: updatedTask.projectId,
    };
    
    socket.emit('taskUpdated', taskInfo);
    return taskInfo;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}

export async function deleteTask(taskId: number) {
  try {
    const deletedTask = await prisma.task.delete({
      where: { id: taskId },
      include: { project: true },
    });
    
    socket.emit('taskDeleted', { taskId: deletedTask.id, projectId: deletedTask.projectId });
    
    return { success: true, taskId: deletedTask.id, projectId: deletedTask.projectId };
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}