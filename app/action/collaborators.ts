import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/app/auth/auth";

export async function deleteCollaborator(projectId: number, userId: string) {
  const session = await getServerSession(NEXT_AUTH);
  if (!session || !session.user?.email) {
    throw new Error("No active session found");
  }

  const response = await fetch('/api/collaborators', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectId, userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to remove collaborator');
  }

  return response.json();
}
