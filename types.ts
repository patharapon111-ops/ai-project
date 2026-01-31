
export enum Role {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  name: string;
  surname?: string;
  room?: string;
  role: Role;
  points: number;
  rights: number; // 100 points = 1 right
  isBanned?: boolean; // New: To prevent submission if banned
}

export interface GoodDeed {
  id: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  studentRoom?: string; // New: Show room in admin view
  description: string;
  pointsAwarded: number;
  evidenceUrl?: string;
  referenceCode?: string;
  timestamp: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PrizeDraw {
  id: string;
  month: string;
  winners: string[];
  prizeName: string;
  timestamp: number;
}
