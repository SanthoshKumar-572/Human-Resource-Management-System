import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, startOfDay, format } from 'date-fns';

export type Role = 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  position: string;
  salary?: number;
  avatar?: string;
  joinDate: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave';

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkIn?: string; // ISO string
  checkOut?: string; // ISO string
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'paid' | 'sick' | 'unpaid';

export interface LeaveRequest {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  remarks: string;
  status: LeaveStatus;
  adminComment?: string;
  createdAt: string;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  
  // Actions
  login: (email: string, role: Role) => void;
  logout: () => void;
  
  checkIn: () => void;
  checkOut: () => void;
  
  applyLeave: (request: Omit<LeaveRequest, 'id' | 'userId' | 'status' | 'createdAt'>) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus, comment?: string) => void;
  
  updateUser: (id: string, data: Partial<User>) => void;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Connor',
    email: 'sarah@dayflow.com',
    role: 'employee',
    department: 'Engineering',
    position: 'Frontend Developer',
    salary: 95000,
    joinDate: '2023-01-15'
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@dayflow.com',
    role: 'admin',
    department: 'HR',
    position: 'HR Manager',
    salary: 110000,
    joinDate: '2021-06-01'
  }
];

const todayStr = format(new Date(), 'yyyy-MM-dd');
const yesterdayStr = format(addDays(new Date(), -1), 'yyyy-MM-dd');

const mockAttendance: AttendanceRecord[] = [
  {
    id: 'a1',
    userId: '1',
    date: yesterdayStr,
    status: 'present',
    checkIn: new Date(new Date(yesterdayStr).setHours(9, 0, 0, 0)).toISOString(),
    checkOut: new Date(new Date(yesterdayStr).setHours(17, 30, 0, 0)).toISOString(),
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      attendance: mockAttendance,
      leaveRequests: [],
      
      login: (email, role) => {
        const user = get().users.find(u => u.email === email && u.role === role);
        if (user) {
          set({ currentUser: user });
        } else {
          // If not found, create for mock purposes (hackathon trick)
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email,
            role,
            department: 'General',
            position: 'Staff',
            joinDate: format(new Date(), 'yyyy-MM-dd')
          };
          set({ users: [...get().users, newUser], currentUser: newUser });
        }
      },
      
      logout: () => set({ currentUser: null }),
      
      checkIn: () => {
        const user = get().currentUser;
        if (!user) return;
        
        const now = new Date();
        const dateStr = format(now, 'yyyy-MM-dd');
        
        const existing = get().attendance.find(a => a.userId === user.id && a.date === dateStr);
        if (!existing) {
          const newRecord: AttendanceRecord = {
            id: Math.random().toString(36).substr(2, 9),
            userId: user.id,
            date: dateStr,
            status: 'present',
            checkIn: now.toISOString()
          };
          set({ attendance: [...get().attendance, newRecord] });
        }
      },
      
      checkOut: () => {
        const user = get().currentUser;
        if (!user) return;
        
        const now = new Date();
        const dateStr = format(now, 'yyyy-MM-dd');
        
        set(state => ({
          attendance: state.attendance.map(a => 
            (a.userId === user.id && a.date === dateStr)
              ? { ...a, checkOut: now.toISOString() }
              : a
          )
        }));
      },
      
      applyLeave: (request) => {
        const user = get().currentUser;
        if (!user) return;
        
        const newReq: LeaveRequest = {
          ...request,
          id: Math.random().toString(36).substr(2, 9),
          userId: user.id,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        set(state => ({
          leaveRequests: [newReq, ...state.leaveRequests]
        }));
      },
      
      updateLeaveStatus: (id, status, comment) => {
        set(state => ({
          leaveRequests: state.leaveRequests.map(r => 
            r.id === id ? { ...r, status, adminComment: comment } : r
          )
        }));
      },
      
      updateUser: (id, data) => {
        set(state => ({
          users: state.users.map(u => u.id === id ? { ...u, ...data } : u),
          currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...data } : state.currentUser
        }));
      }
    }),
    {
      name: 'dayflow-storage',
    }
  )
);
