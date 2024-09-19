import React from 'react';
import { useProjectContext } from '@/app/context/ProjectContext';
import { respondToInvitation } from '@/app/action/invitations';

export const InvitationsTab = () => {
  const { state, dispatch } = useProjectContext();

  const handleRespond = async (invitationId: number, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await respondToInvitation(invitationId, status);
      // Update the context after responding
      dispatch({ type: 'UPDATE_INVITATION', payload: { id: invitationId, status } });
    } catch (error) {
      console.error("Failed to respond to invitation:", error);
    }
  };

  return (
    <div>
      <h2>Invitations</h2>
      {state.invitations.map(invitation => (
        <div key={invitation.id}>
          <p>Project: {invitation.projectName}</p>
          <p>From: {invitation.senderName}</p>
          <button onClick={() => handleRespond(invitation.id, 'ACCEPTED')}>Accept</button>
          <button onClick={() => handleRespond(invitation.id, 'REJECTED')}>Reject</button>
        </div>
      ))}
    </div>
  );
};