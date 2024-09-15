import prisma from "@/app/db";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "../auth/auth";

export async function ProjectMaker(projectname: string) {
  const session = await getServerSession(NEXT_AUTH);

  if (!session?.user?.id || !session.user.email) {
    throw new Error("User not authenticated or session not found");
  }
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  await prisma.projects.create({
    data: {
      name: projectname,
      User: {
        connect: {
          id: user.id,
        },
      }, // Connect the user by ID
    },
  });
}
