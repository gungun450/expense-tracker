import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './Login';
import RegisterForm from './RegisterForm';
import ForgetPassword from './ForgetPassword';
import ResetPasswords from './ResetPassword';
import Category from './Category';
import TransactionsPage from './Transaction';
import DashBoardPage from './DashBoard';
import Layout from './Layout';
import Profile from './Profile';
import { useAuth } from './AuthContext';

// ✅ Add this component
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password"  element={<ResetPasswords />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"   element={<DashBoardPage />} />
          <Route path="category"    element={<Category />} />
          <Route path="transaction" element={<TransactionsPage />} />
          <Route path="profile"     element={<Profile />} />
        </Route>

        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;