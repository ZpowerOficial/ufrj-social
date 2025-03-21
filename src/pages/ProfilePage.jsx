import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Perfil do Usuário</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center text-4xl text-gray-500">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                profile?.display_name?.charAt(0) || user?.email?.charAt(0) || '?'
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{profile?.display_name || 'Usuário'}</h2>
              <p className="text-gray-600">{user?.email}</p>
              
              <div className="mt-4">
                <h3 className="font-semibold text-lg">Sobre</h3>
                <p className="text-gray-700 mt-2">
                  {profile?.bio || 'Nenhuma informação disponível.'}
                </p>
              </div>
              
              <div className="mt-6">
                <button className="bg-ufrj-blue text-white px-4 py-2 rounded hover:bg-blue-700">
                  Editar Perfil
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}