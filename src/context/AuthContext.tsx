import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  resetPassword: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// قاعدة بيانات مستخدمين تجريبية
const DEMO_USERS: User[] = [
  {
    username: 'admin',
    password: 'admin123',
    email: 'admin@iras.com',
    fullName: 'System Administrator'
  },
  {
    username: 'analyst',
    password: 'analyst123',
    email: 'analyst@iras.com',
    fullName: 'Security Analyst'
  },
  {
    username: 'demo',
    password: 'demo123',
    email: 'demo@iras.com',
    fullName: 'Demo User'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('iras_auth') === 'true';
  });

  const login = (username: string, password: string) => {
    // التحقق من بيانات المستخدم مقابل قاعدة البيانات
    const user = DEMO_USERS.find(
      u => u.username === username && u.password === password
    );
    
    if (user) {
      localStorage.setItem('iras_auth', 'true');
      localStorage.setItem('iras_user', JSON.stringify({
        username: user.username,
        fullName: user.fullName,
        email: user.email
      }));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('iras_auth');
    localStorage.removeItem('iras_user');
    setIsAuthenticated(false);
  };

  const resetPassword = (email: string) => {
    // التحقق من وجود البريد الإلكتروني
    const user = DEMO_USERS.find(u => u.email === email);
    return !!user;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}