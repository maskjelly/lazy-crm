import { NextResponse } from "next/server";
import prisma from "@/app/db";
import { TaskStatus } from "@prisma/client";

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const { taskDetails, taskUpdate } = await request.json();

  try {
    const newTask = await prisma.tasks.create({
      data: {
        taskDetails,
        taskUpdate: taskUpdate as TaskStatus,
        projectId: parseInt(projectId, 10),
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
    const tasks = await prisma.tasks.findMany({
      where: { projectId: parseInt(projectId, 10) },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks." }, { status: 500 });
  }
}