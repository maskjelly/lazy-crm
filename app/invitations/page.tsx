"use client";

import { useState, useEffect } from 'react';
import { fetchInvitations } from '@/app/action/invitations';
import { InvitationInfo } from '@/app/types';

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvitations = async () => {
      try {
        const result = await fetchInvitations();
        setInvitations(result);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch invitations:', error);
        setError('Failed to load invitations. Please try again later.');
      }
    };

    loadInvitations();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Invitations</h1>
      {invitations.length === 0 ? (
        <p>No invitations found.</p>
      ) : (
        <ul>
          {invitations.map((invitation) => (
            <li key={invitation.id} className="mb-4 p-4 border rounded">
              <p>Project: {invitation.projectName}</p>
              <p>From: {invitation.senderName}</p>
              <p>Status: {invitation.status}</p>
              <p>Sent: {new Date(invitation.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}