"use server";

import { getServerSession } from "next-auth";
import prisma from "../db";
import { NEXT_AUTH } from "../auth/auth";
import { ProjectInfo, TaskInfo } from "../types";

export async function getProjects(): Promise<ProjectInfo[]> {
  try {
    const session = await getServerSession(NEXT_AUTH);
    if (!session || !session.user?.email) {
      throw new Error("No active session found");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error("User not found for email:", session.user.email);
      return [];
    }

    const projects = await prisma.projects.findMany({
      where: {
        userID: user.id,
      },
      include: {
        tasks: true,
      },
    });

    return projects.map(project => ({
      id: project.id,
      name: project.name,
      taskCounts: {
        done: project.tasks.filter(task => task.taskUpdate === 'Completed').length,
        working: project.tasks.filter(task => task.taskUpdate === 'Working').length,
        upcoming: project.tasks.filter(task => task.taskUpdate === 'Pending').length,
      },
      tasks: project.tasks as TaskInfo[],
    }));
  } catch (error) {
    console.error("Error in getProjects:", error);
    return [];
  }
}
