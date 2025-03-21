import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function MainLayout({ children }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <header className="bg-ufrj-blue text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-white">UFRJ Social</Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/new-post" className="bg-white text-ufrj-blue px-3 py-1 rounded hover:bg-gray-100">
                  Novo Post
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-white">
                    <div className="w-8 h-8 rounded-full bg-white text-ufrj-blue flex items-center justify-center">
                      {profile?.display_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <span>{profile?.display_name || 'Usuário'}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Perfil</Link>
                      <Link to="/settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Configurações</Link>
                      <button 
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Sair
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline text-white">Login</Link>
                <Link to="/register" className="bg-white text-ufrj-blue px-3 py-1 rounded hover:bg-gray-100">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6 bg-white shadow-md my-4 rounded-lg">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>UFRJ Social © 2025 - Plataforma descentralizada da comunidade UFRJ</p>
          <p className="mt-1">Versão Beta</p>
        </div>
      </footer>
    </div>
  );
}