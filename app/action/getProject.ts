"use server";

import { getServerSession } from "next-auth";
import prisma from "../db";
import { NEXT_AUTH } from "../auth/auth";
import { ProjectInfo, TaskStatus } from "../types";

export async function getProjects(): Promise<ProjectInfo[]> {
  try {
    const session = await getServerSession(NEXT_AUTH);
    if (!session || !session.user?.email) {
      throw new Error("No active session found");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        projects: {
          include: { tasks: true, collaborators: true }
        },
        collaborations: {
          include: { tasks: true, collaborators: true }
        }
      }
    });

    if (!user) {
      console.error("User not found for email:", session.user.email);
      return [];
    }

    const allProjects = [...user.projects, ...user.collaborations];

    return allProjects.map(project => ({
      id: project.id,
      name: project.name,
      isOwner: project.ownerId === user.id,
      taskCounts: {
        done: project.tasks.filter(task => task.taskUpdate === 'Completed').length,
        working: project.tasks.filter(task => task.taskUpdate === 'Working').length,
        upcoming: project.tasks.filter(task => task.taskUpdate === 'Pending').length,
      },
      tasks: project.tasks.map(task => ({
        id: task.id,
        taskDetails: task.taskDetails,
        taskUpdate: task.taskUpdate as TaskStatus,
        projectId: task.projectId,
      })),
      collaborators: project.collaborators.map(collaborator => ({
        id: collaborator.id,
        name: collaborator.name,
        email: collaborator.email,
      })),
    }));
  } catch (error) {
    console.error("Error in getProjects:", error);
    return [];
  }
}
