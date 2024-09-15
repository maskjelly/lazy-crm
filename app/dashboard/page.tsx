import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "../auth/auth";
import prisma from "../db";
import { Project } from '../types/Project'; // Adjust the import path as needed

export default async function DashboardPage() {
  // Fetch session data
  const session = await getServerSession(NEXT_AUTH);

  // Check if session is valid
  if (!session?.user?.email) {
    return <div>No session found. Please log in.</div>;
  }

  // Fetch user data from Prisma
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    return <div>No user data found. Please check your email.</div>;
  }

  let projectPolk = [];
  try {
    projectPolk = await prisma.projects.findMany({
      where: {
        userID: user.id,
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return <div>Error fetching projects. Please try again later.</div>;
  }

  return (
    <div className="flex flex-col">
      <h1>Dashboard</h1>
      <div>User name: {user.email || "No user data found"}</div>
      <div>USER ID: {user.id || "No user data found"}</div>
      <div>
        <input type="text" placeholder="Project name" />
        <button className="border mx-5">Create Project</button>
      </div>
      <div>
        <h3>Projects:</h3>
        {projectPolk.length === 0 ? (
          <p>No projects found</p>
        ) : (
          <ul>
            {projectPolk.map((project: Project) => (
              <li key={project.id}>{project.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
