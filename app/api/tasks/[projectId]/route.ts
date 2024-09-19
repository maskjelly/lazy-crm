import { NextResponse } from "next/server";
import prisma from "@/app/db";
import { TaskStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/app/auth/auth";

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const { taskDetails, taskUpdate } = await request.json();

  const session = await getServerSession(NEXT_AUTH);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, error: "User not authenticated" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const newTask = await prisma.task.create({
      data: {
        taskDetails,
        taskUpdate: taskUpdate as TaskStatus,
        projectId: parseInt(projectId, 10),
        createdById: user.id,
      },
    });
    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ success: false, error: "Failed to create task." }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: parseInt(projectId, 10) },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks." }, { status: 500 });
  }
}