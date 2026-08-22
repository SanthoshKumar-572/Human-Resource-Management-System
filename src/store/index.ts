import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, format } from 'date-fns';

export type Role = 'employee' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
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
  isDbConnected: boolean;
  
  toastMessage: string | null;
  
  // Actions
  setToastMessage: (msg: string | null) => void;
  fetchInitialData: () => Promise<void>;
  login: (email: string, password: string, role: Role) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  
  applyLeave: (request: Omit<LeaveRequest, 'id' | 'userId' | 'status' | 'createdAt'>) => Promise<void>;
  updateLeaveStatus: (id: string, status: LeaveStatus, comment?: string) => Promise<void>;
  
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  addUser: (userData: Omit<User, 'id'> & { password?: string }) => Promise<User>;
}

const yesterdayStr = format(addDays(new Date(), -1), 'yyyy-MM-dd');

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Connor',
    email: 'sarah@dayflow.com',
    password: 'password123',
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
    password: 'password123',
    role: 'admin',
    department: 'HR',
    position: 'HR Manager',
    salary: 110000,
    joinDate: '2021-06-01'
  }
];

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

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      attendance: mockAttendance,
      leaveRequests: [],
      isDbConnected: false,
      toastMessage: null,

      setToastMessage: (msg) => {
        if (toastTimer) {
          clearTimeout(toastTimer);
          toastTimer = null;
        }
        set({ toastMessage: msg });
        if (msg) {
          toastTimer = setTimeout(() => {
            set({ toastMessage: null });
            toastTimer = null;
          }, 2500);
        }
      },

      fetchInitialData: async () => {
        try {
          const [usersRes, attRes, leaveRes] = await Promise.all([
            fetch('/api/users').then(res => res.ok ? res.json() : null),
            fetch('/api/attendance').then(res => res.ok ? res.json() : null),
            fetch('/api/leave').then(res => res.ok ? res.json() : null),
          ]);

          if (usersRes) {
            set({
              users: usersRes,
              attendance: attRes || get().attendance,
              leaveRequests: leaveRes || get().leaveRequests,
              isDbConnected: true,
            });

            // Update current logged-in user if exists
            const current = get().currentUser;
            if (current) {
              const updatedCurrent = usersRes.find((u: User) => u.id === current.id);
              if (updatedCurrent) set({ currentUser: updatedCurrent });
            }
          }
        } catch {
          set({ isDbConnected: false });
        }
      },
      
      login: async (email, password, role) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
          });

          if (response.ok) {
            const user = await response.json();
            set({ currentUser: user, isDbConnected: true });
            await get().fetchInitialData();
            return { success: true, user };
          } else {
            const errData = await response.json().catch(() => ({}));
            return { success: false, error: errData.error || 'Invalid email or password' };
          }
        } catch (e) {
          console.warn('MySQL API unreachable, falling back to local state:', e);
        }

        // Fallback local logic if MySQL server is not connected
        const user = get().users.find(u => u.email === email && u.role === role);
        if (user) {
          if (user.password && password && user.password !== password) {
            return { success: false, error: 'Invalid password. Please check your credentials.' };
          }
          set({ currentUser: user });
          return { success: true, user };
        } else {
          const rawName = email.split('@')[0];
          const formattedName = rawName
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: formattedName,
            email,
            password: password || 'password123',
            role,
            department: 'General',
            position: 'Staff',
            joinDate: format(new Date(), 'yyyy-MM-dd')
          };
          set({ users: [...get().users, newUser], currentUser: newUser });
          return { success: true, user: newUser };
        }
      },
      
      logout: () => set({ currentUser: null }),
      
      checkIn: async () => {
        const user = get().currentUser;
        if (!user) return;

        try {
          const response = await fetch('/api/attendance/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
          });

          if (response.ok) {
            const record = await response.json();
            set(state => ({
              attendance: [record, ...state.attendance.filter(a => !(a.userId === user.id && a.date === record.date))]
            }));
            return;
          }
        } catch (e) {
          console.warn('MySQL checkIn API error:', e);
        }

        // Fallback local check-in
        const now = new Date();
        const dateStr = format(now, 'yyyy-MM-dd');
        const existing = get().attendance.find(a => a.userId === user.id && a.date === dateStr);
        if (existing) {
          set(state => ({
            attendance: state.attendance.map(a => 
              (a.userId === user.id && a.date === dateStr)
                ? { ...a, checkIn: now.toISOString(), checkOut: undefined, status: 'present' }
                : a
            )
          }));
        } else {
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
      
      checkOut: async () => {
        const user = get().currentUser;
        if (!user) return;

        try {
          const response = await fetch('/api/attendance/check-out', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
          });

          if (response.ok) {
            const record = await response.json();
            set(state => ({
              attendance: state.attendance.map(a => 
                (a.userId === user.id && a.date === record.date) ? record : a
              )
            }));
            return;
          }
        } catch (e) {
          console.warn('MySQL checkOut API error:', e);
        }

        // Fallback local check-out
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
      
      applyLeave: async (request) => {
        const user = get().currentUser;
        if (!user) return;

        try {
          const response = await fetch('/api/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...request, userId: user.id })
          });

          if (response.ok) {
            const newReq = await response.json();
            set(state => ({
              leaveRequests: [newReq, ...state.leaveRequests]
            }));
            return;
          }
        } catch (e) {
          console.warn('MySQL applyLeave API error:', e);
        }

        // Fallback local applyLeave
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
      
      updateLeaveStatus: async (id, status, comment) => {
        try {
          const response = await fetch(`/api/leave/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, comment })
          });

          if (response.ok) {
            const updated = await response.json();
            set(state => ({
              leaveRequests: state.leaveRequests.map(r => r.id === id ? updated : r)
            }));
            return;
          }
        } catch (e) {
          console.warn('MySQL updateLeaveStatus API error:', e);
        }

        // Fallback local update
        set(state => ({
          leaveRequests: state.leaveRequests.map(r => 
            r.id === id ? { ...r, status, adminComment: comment } : r
          )
        }));
      },
      
      updateUser: async (id, data) => {
        try {
          const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          if (response.ok) {
            const updatedUser = await response.json();
            set(state => ({
              users: state.users.map(u => u.id === id ? updatedUser : u),
              currentUser: state.currentUser?.id === id ? updatedUser : state.currentUser
            }));
            return;
          }
        } catch (e) {
          console.warn('MySQL updateUser API error:', e);
        }

        // Fallback local update
        set(state => ({
          users: state.users.map(u => u.id === id ? { ...u, ...data } : u),
          currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...data } : state.currentUser
        }));
      },

      addUser: async (userData) => {
        try {
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
          });

          if (response.ok) {
            const newUser = await response.json();
            set(state => ({
              users: [newUser, ...state.users]
            }));
            return newUser;
          }
        } catch (e) {
          console.warn('MySQL addUser API error:', e);
        }

        // Fallback local user creation
        const newUser: User = {
          ...userData,
          id: Math.random().toString(36).substr(2, 9),
        };
        set(state => ({
          users: [newUser, ...state.users]
        }));
        return newUser;
      }
    }),
    {
      name: 'dayflow-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        attendance: state.attendance,
        leaveRequests: state.leaveRequests,
        isDbConnected: state.isDbConnected,
      }),
    }
  )
);
