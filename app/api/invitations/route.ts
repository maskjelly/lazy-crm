import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/app/auth/auth";
import prisma from "@/app/db";

export async function GET() {
  const session = await getServerSession(NEXT_AUTH);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No active session found" }, { status: 401 });
  }

  const invitations = await prisma.invitation.findMany({
    where: {
      receiver: { email: session.user.email },
      status: 'PENDING'
    },
    include: {
      project: true,
      sender: true
    }
  });

  const invitationInfo = invitations.map(invitation => ({
    id: invitation.id,
    projectId: invitation.projectId,
    projectName: invitation.project.name,
    senderId: invitation.senderId,
    senderName: invitation.sender.name,
    status: invitation.status,
    createdAt: invitation.createdAt,
  }));

  return NextResponse.json(invitationInfo);
}

export async function POST(request: Request) {
  const session = await getServerSession(NEXT_AUTH);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No active session found" }, { status: 401 });
  }

  const { projectId, email } = await request.json();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { owner: true }
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.owner.email !== session.user.email) {
    return NextResponse.json({ error: "Only the project owner can send invitations" }, { status: 403 });
  }

  const receiver = await prisma.user.findUnique({ where: { email } });
  if (!receiver) {
    return NextResponse.json({ error: "Invited user not found" }, { status: 404 });
  }

  const existingInvitation = await prisma.invitation.findFirst({
    where: {
      projectId,
      receiverId: receiver.id,
      status: 'PENDING'
    }
  });

  if (existingInvitation) {
    return NextResponse.json({ error: "An invitation has already been sent to this user" }, { status: 400 });
  }

  const invitation = await prisma.invitation.create({
    data: {
      project: { connect: { id: projectId } },
      sender: { connect: { email: session.user.email } },
      receiver: { connect: { email } },
      status: 'PENDING'
    }
  });

  return NextResponse.json(invitation);
}