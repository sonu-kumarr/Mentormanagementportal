import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useState, createContext, useContext, ReactNode } from 'react';
import { Toaster } from 'sonner';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Types
export type UserRole = 'student' | 'mentor' | 'admin';

export interface Course {
  id: string;
  courseId: string;
  name: string;
  instructorName: string;
  semester: string;
  sessional1: number; // out of 10
  midterm: number; // out of 30
  sessional2: number; // out of 10
  endterm: number; // out of 50
  attendance: number;
}

export interface ProjectUpdate {
  id: string;
  content: string;
  timestamp: Date;
  mentorComment?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: Date;
  read: boolean;
  fileUrl?: string;
  fileName?: string;
}

export interface Notification {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'message' | 'request' | 'approval' | 'deadline';
}

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  year: string;
  semester: string;
  email: string;
  department: string;
  password?: string;
  mentorId?: string;
  courses: Course[];
  projectProgress: ProjectUpdate[];
  cgpa?: number;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  password: string;
  studentIds: string[];
  profilePhoto?: string;
  department?: string;
  designation?: string;
  phone?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: { id: string; role: UserRole; name: string } | null;
  students: Student[];
  mentors: Mentor[];
  admins: Admin[];
  messages: Message[];
  notifications: Notification[];
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  signup: (data: any, role: UserRole) => boolean;
  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  addMentor: (mentor: Mentor) => void;
  updateMentor: (id: string, updates: Partial<Mentor>) => void;
  allocateStudentToMentor: (studentId: string, mentorId: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  resetPassword: (email: string, role: UserRole, newPassword: string) => boolean;
  changePassword: (userId: string, role: UserRole, oldPassword: string, newPassword: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; role: UserRole; name: string } | null>(null);

  // Mock data
  const [students, setStudents] = useState<Student[]>([
    {
      id: 's1',
      name: 'Rahul Kumar',
      rollNo: '2021001',
      year: '3',
      semester: '6',
      email: 'rahul@student.edu',
      department: 'Computer Science',
      password: '',
      mentorId: 'm1',
      courses: [
        { id: 'c1', courseId: 'CS301', name: 'Data Structures', instructorName: 'Dr. Singh', semester: '6', sessional1: 8, midterm: 25, sessional2: 9, endterm: 43, attendance: 85 },
        { id: 'c2', courseId: 'CS302', name: 'Algorithms', instructorName: 'Prof. Sharma', semester: '6', sessional1: 9, midterm: 27, sessional2: 8, endterm: 45, attendance: 90 },
      ],
      projectProgress: [
        { id: 'p1', content: 'Completed project setup and initial design', timestamp: new Date('2026-05-01'), mentorComment: 'Good start!' },
      ],
      cgpa: 8.5,
    },
    {
      id: 's2',
      name: 'Priya Sharma',
      rollNo: '2021002',
      year: '3',
      semester: '6',
      email: 'priya@student.edu',
      department: 'Computer Science',
      password: '',
      mentorId: 'm1',
      courses: [
        { id: 'c3', courseId: 'CS301', name: 'Data Structures', instructorName: 'Dr. Singh', semester: '6', sessional1: 6, midterm: 20, sessional2: 7, endterm: 35, attendance: 65 },
      ],
      projectProgress: [],
      cgpa: 7.2,
    },
    {
      id: 's3',
      name: 'Amit Patel',
      rollNo: '2022001',
      year: '2',
      semester: '4',
      email: 'amit@student.edu',
      department: 'Computer Science',
      password: '',
      mentorId: 'm1',
      courses: [
        { id: 'c5', courseId: 'CS201', name: 'Operating Systems', instructorName: 'Dr. Gupta', semester: '4', sessional1: 9, midterm: 28, sessional2: 9, endterm: 47, attendance: 95 },
      ],
      projectProgress: [],
      cgpa: 9.1,
    },
  ]);

  const [mentors, setMentors] = useState<Mentor[]>([
    {
      id: 'm1',
      name: 'Dr. Suresh Verma',
      email: 'suresh@mentor.edu',
      password: 'mentor123',
      studentIds: ['s1', 's2', 's3'],
      profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh',
      department: 'Computer Science',
      designation: 'Associate Professor',
      phone: '+91 98765 43210',
    },
  ]);

  const [admins, setAdmins] = useState<Admin[]>([
    {
      id: 'a1',
      name: 'Admin User',
      email: 'admin@portal.edu',
      password: 'admin123',
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg1',
      from: 's1',
      to: 'm1',
      content: 'Can we schedule a meeting to discuss my project?',
      timestamp: new Date('2026-05-10'),
      read: false,
    },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      userId: 's1',
      content: 'Your mentor has commented on your project progress',
      timestamp: new Date('2026-05-12'),
      read: false,
      type: 'approval',
    },
  ]);

  const login = (email: string, password: string, role: UserRole): boolean => {
    if (role === 'student') {
      const student = students.find(s => s.email === email);
      if (student) {
        setUser({ id: student.id, role: 'student', name: student.name });
        return true;
      }
    } else if (role === 'mentor') {
      const mentor = mentors.find(m => m.email === email && m.password === password);
      if (mentor) {
        setUser({ id: mentor.id, role: 'mentor', name: mentor.name });
        return true;
      }
    } else if (role === 'admin') {
      const admin = admins.find(a => a.email === email && a.password === password);
      if (admin) {
        setUser({ id: admin.id, role: 'admin', name: admin.name });
        return true;
      }
    }
    return false;
  };

  const logout = () => setUser(null);

  const signup = (data: any, role: UserRole): boolean => {
    if (role === 'student') {
      const newStudent: Student = {
        id: `s${students.length + 1}`,
        name: data.name,
        rollNo: data.rollNo,
        year: data.year,
        semester: data.semester,
        email: data.email,
        department: data.department,
        password: data.password || '',
        courses: [],
        projectProgress: [],
        cgpa: undefined,
      };
      setStudents([...students, newStudent]);
      return true;
    } else if (role === 'mentor') {
      const newMentor: Mentor = {
        id: `m${mentors.length + 1}`,
        name: data.name,
        email: data.email,
        password: data.password,
        studentIds: [],
        profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      };
      setMentors([...mentors, newMentor]);
      return true;
    }
    return false;
  };

  const addStudent = (student: Student) => setStudents([...students, student]);

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(students.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addMentor = (mentor: Mentor) => setMentors([...mentors, mentor]);

  const updateMentor = (id: string, updates: Partial<Mentor>) => {
    setMentors(mentors.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const allocateStudentToMentor = (studentId: string, mentorId: string) => {
    updateStudent(studentId, { mentorId });
    const mentor = mentors.find(m => m.id === mentorId);
    if (mentor && !mentor.studentIds.includes(studentId)) {
      updateMentor(mentorId, { studentIds: [...mentor.studentIds, studentId] });
    }
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp' | 'read'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg${messages.length + 1}`,
      timestamp: new Date(),
      read: false,
    };
    setMessages([...messages, newMessage]);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `n${notifications.length + 1}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications([...notifications, newNotification]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const resetPassword = (email: string, role: UserRole, newPassword: string): boolean => {
    if (role === 'student') {
      const student = students.find(s => s.email === email);
      if (student) {
        updateStudent(student.id, { password: newPassword });
        return true;
      }
    } else if (role === 'mentor') {
      const mentor = mentors.find(m => m.email === email);
      if (mentor) {
        updateMentor(mentor.id, { password: newPassword });
        return true;
      }
    }
    return false;
  };

  const changePassword = (userId: string, role: UserRole, oldPassword: string, newPassword: string): boolean => {
    if (role === 'student') {
      const student = students.find(s => s.id === userId);
      if (student && student.password === oldPassword) {
        updateStudent(userId, { password: newPassword });
        return true;
      }
    } else if (role === 'mentor') {
      const mentor = mentors.find(m => m.id === userId);
      if (mentor && mentor.password === oldPassword) {
        updateMentor(userId, { password: newPassword });
        return true;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        students,
        mentors,
        admins,
        messages,
        notifications,
        login,
        logout,
        signup,
        addStudent,
        updateStudent,
        addMentor,
        updateMentor,
        allocateStudentToMentor,
        addMessage,
        addNotification,
        markNotificationRead,
        resetPassword,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children, role }: { children: ReactNode; role: UserRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor-dashboard"
            element={
              <ProtectedRoute role="mentor">
                <MentorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" richColors closeButton duration={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
