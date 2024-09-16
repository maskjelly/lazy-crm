"use server";

import { getServerSession } from "next-auth";
import prisma from "../db";
import { NEXT_AUTH } from "../auth/auth";

export async function getProjects(lancerid : string) {
  const session = await getServerSession(NEXT_AUTH);
  if (!session || !session.user?.email) {
    throw new Error("No active session found");
  }

  const user = await prisma.user.findUnique({
    where: { email: lancerid },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const projects = await prisma.projects.findMany({
    where: {
      userID: user.id,
    },
    select: {
      name: true,
    },
  });

  return projects;
}
