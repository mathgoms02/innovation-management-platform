import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { NotificationProvider } from './features/auth/NotificationContext';
import { ToastProvider } from './components/Toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Hackathons from './pages/Hackathons';
import Submissions from './pages/Submissions';
import Ranking from './pages/Ranking';
import JudgeDashboard from './pages/JudgeDashboard';
import EvaluateSubmission from './pages/EvaluateSubmission';
import Settings from './pages/Settings';
import './App.css';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/hackathons"
              element={
                <PrivateRoute>
                  <Hackathons />
                </PrivateRoute>
              }
            />
            <Route
              path="/submissions"
              element={
                <PrivateRoute>
                  <Submissions />
                </PrivateRoute>
              }
            />
            <Route
              path="/ranking/:hackathonId"
              element={
                <PrivateRoute>
                  <Ranking />
                </PrivateRoute>
              }
            />
            <Route
              path="/judge/:hackathonId"
              element={
                <PrivateRoute>
                  <JudgeDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/evaluate/:submissionId"
              element={
                <PrivateRoute>
                  <EvaluateSubmission />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
        </NotificationProvider>
        </ToastProvider>
        </AuthProvider>

  );
}

export default App;
