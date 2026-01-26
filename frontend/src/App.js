import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TodoList from './components/TodoList';
import './styles/App.css';

// Helper to get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Protect routes that require authentication (e.g., /todos)
const ProtectedRoute = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/login" />;
};

// Redirect authenticated users away from auth pages (e.g., /login, /register)
const AuthRoute = ({ children }) => {
  const token = getToken();
  return token ? <Navigate to="/todos" /> : children;
};

function AppContent() {
  return (
    <div className="app-container">
      <Routes>
        {/* Public routes: only accessible when not logged in */}
        <Route path="/login" element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        } />
        
        <Route path="/register" element={
          <AuthRoute>
            <Register />
          </AuthRoute>
        } />

        {/* Private route: only accessible when logged in */}
        <Route path="/todos" element={
          <ProtectedRoute>
            <TodoList />
          </ProtectedRoute>
        } />
        {/* Catch-all: redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

// Wrap app with Router to enable navigation
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;