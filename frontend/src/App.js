import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import UsersPage from './pages/UsersPages';
import ProtectedRoute from './services/ProtectedRoute';
import Register from './components/Register';
import AppLayout from './layout/AppLayout';
import AuthLayout from './layout/AuthLayout'; // Yeni layout
import ProfilePage from './pages/ProfilePage';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Login ve Register için AuthLayout */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />

        {/* Diğer sayfalar için AppLayout */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AppLayout>
                <UsersPage />
              </AppLayout>
            </ProtectedRoute>

          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>

              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>

          }
        />
      </Routes>
    </Router>
  );
};

export default App;
