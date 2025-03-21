import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

export default function CommunityPage() {
  const { slug } = useParams();
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Comunidade: {slug}</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p>Conteúdo da comunidade: {slug}</p>
          {/* Aqui você pode adicionar a lógica para buscar e exibir a comunidade */}
        </div>
      </div>
    </MainLayout>
  );
}