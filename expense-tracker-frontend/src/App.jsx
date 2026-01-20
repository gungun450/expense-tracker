import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Login from './Login';
import RegisterForm from './RegisterForm';
import ForgetPassword from './ForgetPassword';
import ResetPasswords from './ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPasswords />} />
        <Route path="/" element={<Login />} />
        {/* uppercase first letter is must for import like ResetPasswords and not resetPassword */}
      </Routes>
    </Router>
  );
}

export default App;