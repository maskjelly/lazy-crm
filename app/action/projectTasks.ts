'use server';

import prisma from "@/app/db";
import { TaskStatus, TaskInfo } from "@/app/types";

export async function addTask(projectId: number, taskDetails: string, taskUpdate: TaskStatus): Promise<{ success: true; task: TaskInfo } | { success: false; error: string }> {
  try {
    const newTask = await prisma.tasks.create({
      data: {
        taskDetails,
        taskUpdate,
        projectId,
      },
    });
    return { 
      success: true, 
      task: {
        id: newTask.id,
        taskDetails: newTask.taskDetails,
        taskUpdate: newTask.taskUpdate as TaskStatus,
        projectId: newTask.projectId,
      } 
    };
  } catch (error) {
    console.error("Error adding task:", error);
    return { success: false, error: "Failed to add task." };
  }
}

export async function updateTaskStatus(taskId: number, newStatus: TaskStatus) {
  try {
    const updatedTask = await prisma.tasks.update({
      where: { id: taskId },
      data: { taskUpdate: newStatus },
    });
    return updatedTask;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
}

export async function deleteTask(taskId: number) {
  try {
    await prisma.tasks.delete({
      where: { id: taskId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}