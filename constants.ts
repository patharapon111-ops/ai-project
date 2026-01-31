
import { Role, User, GoodDeed } from './types';

export const POINTS_TO_RIGHT_RATIO = 100;

export const MISSIONS = [
  { id: 'm1', label: '🗑️ แยกขยะให้ถูกต้อง', points: 5 },
  { id: 'm2', label: '🤝 ทำกิจกรรมจิตอาสา', points: 10 },
  { id: 'm3', label: '📚 อ่านหนังสือ', points: 5 },
  { id: 'm4', label: '✅ ส่งการบ้านครบถ้วน', points: 10 },
  { id: 'm5', label: '⏰ มาโรงเรียนตรงเวลา', points: 5 },
];

export const INITIAL_STUDENTS: User[] = [
  { id: '1', email: 'student@example.com', name: 'ภัทรพล', surname: 'บูชา', room: '4/2', role: Role.STUDENT, points: 0, rights: 0 },
];

export const INITIAL_DEEDS: GoodDeed[] = [];
