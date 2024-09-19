import React, { useState } from 'react';
import { inviteCollaborator } from '@/app/action/invitations';

interface InviteCollaboratorProps {
  projectId: number;
}

export const InviteCollaborator: React.FC<InviteCollaboratorProps> = ({ projectId }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      await inviteCollaborator(projectId, email);
      setMessage('Invitation sent successfully!');
      setEmail('');
    } catch (error) {
      setMessage('Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Invite Collaborator</h3>
      <form onSubmit={handleInvite} className="flex items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
          className="input mr-2 flex-grow"
          required
        />
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Invite'}
        </button>
      </form>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
};