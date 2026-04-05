import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SOCProvider } from './context/SOCContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner@2.0.3';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AlertQueue from './pages/AlertQueue';
import Actions from './pages/Actions';
import AutomatedActions from './pages/AutomatedActions';
import SIEM from './pages/SIEM';
import Guide from './pages/Guide';
import Documentation from './pages/Documentation';
import Playbooks from './pages/Playbooks';
import CaseReports from './pages/CaseReports';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <SOCProvider>
        <Toaster 
          position="top-right" 
          richColors 
          expand={true}
          closeButton
          theme="dark"
          toastOptions={{
            style: {
              background: '#19232C',
              border: '1px solid rgba(255, 255, 255, 0.03)',
              color: '#E6EEF6',
            },
            className: 'max-w-md',
          }}
        />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/alert-queue"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AlertQueue />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/actions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Actions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/automated-actions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AutomatedActions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/siem"
              element={
                <ProtectedRoute>
                  <Layout>
                    <SIEM />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/guide"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Guide />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/documentation"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Documentation />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/playbooks"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Playbooks />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/case-reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CaseReports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SOCProvider>
    </AuthProvider>
  );
}