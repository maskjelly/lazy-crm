import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/app/auth/auth";
import prisma from "@/app/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(NEXT_AUTH);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No active session found" }, { status: 401 });
  }

  const { status } = await request.json();
  const invitationId = parseInt(params.id, 10);

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { 
      project: true,
      receiver: true
    }
  });

  if (!invitation) {
    return NextResponse.json({ error: "Invalid invitation" }, { status: 400 });
  }

  if (!invitation.receiver || invitation.receiver.email !== session.user.email) {
    return NextResponse.json({ error: "You are not authorized to respond to this invitation" }, { status: 403 });
  }

  if (invitation.status !== 'PENDING') {
    return NextResponse.json({ error: "Invitation has already been responded to" }, { status: 400 });
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status }
  });

  if (status === 'ACCEPTED') {
    await prisma.project.update({
      where: { id: invitation.projectId },
      data: {
        collaborators: {
          connect: { email: session.user.email }
        }
      }
    });
  }

  return NextResponse.json({ success: true });
}