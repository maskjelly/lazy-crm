export interface TaskInfo {
  id: number;
  taskDetails: string;
  taskUpdate: TaskStatus;
  projectId: number;
}

export interface ProjectInfo {
  id: number;
  name: string;
  taskCounts: {
    done: number;
    working: number;
    upcoming: number;
  };
  tasks: TaskInfo[];
}

export type TaskStatus = 'Completed' | 'Working' | 'Pending';