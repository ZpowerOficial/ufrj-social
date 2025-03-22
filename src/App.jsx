import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import { Toaster } from './components/ui/use-toast';

// Páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import NewPostPage from './pages/NewPostPage';
import CommunityPage from './pages/CommunityPage';
import CommunitiesPage from './pages/CommunitiesPage';
import NewCommunityPage from './pages/NewCommunityPage';
import EventsPage from './pages/EventsPage';
import MessagesPage from './pages/MessagesPage';

// Rota protegida que verifica autenticação
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  console.log('Renderizando App...');
  
  // Determinar a base URL para o GitHub Pages
  const baseUrl = window.location.hostname === 'chpgo.github.io' ? '/ufrj-social' : '';

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path={baseUrl + "/"} element={<HomePage />} />
              <Route path={baseUrl + "/post/:id"} element={<PostDetailPage />} />
              <Route path={baseUrl + "/community/:slug"} element={<CommunityPage />} />
              <Route path={baseUrl + "/communities"} element={<CommunitiesPage />} />
              <Route path={baseUrl + "/events"} element={<EventsPage />} />
              <Route path={baseUrl + "/messages"} element={<MessagesPage />} />
              
              {/* Rotas protegidas */}
              <Route 
                path={baseUrl + "/profile"} 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path={baseUrl + "/posts/new"} 
                element={
                  <ProtectedRoute>
                    <NewPostPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path={baseUrl + "/communities/new"} 
                element={
                  <ProtectedRoute>
                    <NewCommunityPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Fallback para rotas não encontradas */}
              <Route path="*" element={
                <div className="flex min-h-[50vh] items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
                    <p className="text-muted-foreground">A página que você está procurando não existe.</p>
                  </div>
                </div>
              } />
            </Route>
            
            {/* Rotas sem o layout principal */}
            <Route path={baseUrl + "/login"} element={<LoginPage />} />
            <Route path={baseUrl + "/register"} element={<RegisterPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}