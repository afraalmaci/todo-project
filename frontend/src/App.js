import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TodoList from './components/TodoList';
import './styles/App.css';

const ProtectedRoute = ({ children }) => {
  return children;
};

const AuthRoute = ({ children }) => {
  return children;
};

function AppContent() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/todos" element={
          <ProtectedRoute>
            <TodoList />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
