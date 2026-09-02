import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TodoList from './components/TodoList';
import { ToastProvider } from './components/Toast';
import { isLoggedIn } from './utils/api';
import { useDarkMode } from './utils/useDarkMode';

const ProtectedRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
};

const AuthRoute = ({ children }) => {
  return isLoggedIn() ? <Navigate to="/todos" replace /> : children;
};

function AppContent({ isDark, toggleDark }) {
  return (
    <Routes>
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
      <Route path="/todos" element={
        <ProtectedRoute>
          <TodoList isDark={isDark} onToggleDark={toggleDark} />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  // Applied once at the top so the `dark` class on <html> is in sync on
  // every page, not just the todo list where the toggle control lives.
  const [isDark, toggleDark] = useDarkMode();

  return (
    <ToastProvider>
      <Router>
        <AppContent isDark={isDark} toggleDark={toggleDark} />
      </Router>
    </ToastProvider>
  );
}

export default App;
