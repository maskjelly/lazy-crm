"use server";

import { getServerSession } from "next-auth";
import prisma from "../db";
import { NEXT_AUTH } from "../auth/auth";

export async function getProjects() {
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
      return []; // Return an empty array instead of throwing an error
    }

    const projects = await prisma.projects.findMany({
      where: {
        userID: user.id,
      },
      select: {
        name: true,
        tasks: {
          select: {
            taskUpdate: true,
          },
        },
      },
    });

    return projects.map(project => ({
      name: project.name,
      taskCounts: {
        done: project.tasks.filter(task => task.taskUpdate === 'Completed').length,
        working: project.tasks.filter(task => task.taskUpdate === 'Working').length,
        upcoming: project.tasks.filter(task => task.taskUpdate === 'Pending').length,
      },
    }));
  } catch (error) {
    console.error("Error in getProjects:", error);
    return []; // Return an empty array in case of any error
  }
}
