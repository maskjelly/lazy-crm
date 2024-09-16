import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/app/auth/auth";
import prisma from "@/app/db";
import { Project } from "@/app/types/Project"; // Adjust the import path as needed
import { DataCard, Projects } from "@/app/components/userdata";

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
      <DataCard Name={user.name} id={user.id} email={user.email} />
      <div>
        <input type="text" placeholder="Project name" />
        <button className="border mx-5">Create Project</button>
      </div>
      <div>
        <h3>Projects:</h3>
        <Projects
          projectNames={projectPolk.map((project: Project) => project.name)}
        />
      </div>
    </div>
  );
}
