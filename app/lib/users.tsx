'use server'

import prisma from "@/app/db";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/app/auth/auth";
import { Project } from "@/app/types/Project";

export default async function ProjectList() {
  const sessionPromise = getServerSession(NEXT_AUTH);

  const [session] = await Promise.all([sessionPromise]);

  if (!session?.user?.email) {
    return <div>No session found. Please log in.</div>;
  }

  const userPromise = prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  const user = await userPromise;

  if (!user) {
    return <div>No user data found. Please check your email.</div>;
  }

  const projectsPromise = prisma.project.findMany({
    where: {
      ownerId: user.id,
    },
  });

  const projects: Project[] = await projectsPromise;

  return (
    <div>
      <h2>Your Projects</h2>
      <ul>
        {projects.length > 0 ? (
          projects.map((project) => <li key={project.id}>{project.name}</li>)
        ) : (
          <li>No projects found</li>
        )}
      </ul>
    </div>
  );
}
