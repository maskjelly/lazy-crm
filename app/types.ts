export type TaskStatus = 'Completed' | 'Working' | 'Pending';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface TaskInfo {
  id: number;
  taskDetails: string;
  taskUpdate: TaskStatus;
  projectId: number;
}

export interface ProjectInfo {
  id: number;
  name: string;
  isOwner: boolean;
  taskCounts: {
    done: number;
    working: number;
    upcoming: number;
  };
  tasks: TaskInfo[];
  collaborators: CollaboratorInfo[];
}

export interface CollaboratorInfo {
  id: string;
  name: string;
  email: string;
}

export interface InvitationInfo {
  id: number;
  projectId: number;
  projectName: string;
  senderId: string;
  senderName: string;
  status: InvitationStatus;
  createdAt: Date;
}