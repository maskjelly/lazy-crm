'use server';

import prisma from "@/app/db";
import { TaskStatus } from "@prisma/client";

export async function addTask(projectId: number, taskDetails: string, taskUpdate: TaskStatus) {
  try {
    const newTask = await prisma.tasks.create({
      data: {
        taskDetails,
        taskUpdate,
        projectId,
      },
    });
    return { success: true, task: newTask };
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