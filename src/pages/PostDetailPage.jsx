import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

export default function PostDetailPage() {
  const { id } = useParams();
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Detalhes do Post</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p>Detalhes do post ID: {id}</p>
          {/* Aqui você pode adicionar a lógica para buscar e exibir o post */}
        </div>
      </div>
    </MainLayout>
  );
}