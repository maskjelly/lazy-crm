import { InvitationInfo } from "@/app/types";

export async function fetchInvitations(): Promise<InvitationInfo[]> {
  const response = await fetch('/api/invitations');
  if (!response.ok) {
    throw new Error('Failed to fetch invitations');
  }
  return response.json();
}

export async function respondToInvitation(invitationId: number, status: 'ACCEPTED' | 'REJECTED') {
  const response = await fetch(`/api/invitations/${invitationId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to respond to invitation');
  }

  return response.json();
}

// Keep the inviteCollaborator function as is, but move it to a separate server action file
// if it's not already in one.

export async function inviteCollaborator(projectId: number, email: string) {
  const response = await fetch('/api/invitations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectId, email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to send invitation');
  }

  return response.json();
}
