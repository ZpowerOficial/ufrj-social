import React from 'react';
import MainLayout from '../components/layout/MainLayout';

export default function CommunitiesPage() {
  const communities = [
    { id: 'geral', name: 'Geral UFRJ', description: 'Comunidade geral para todos os assuntos relacionados à UFRJ' },
    { id: 'computacao', name: 'Ciência da Computação', description: 'Comunidade para estudantes e professores de Ciência da Computação' },
    { id: 'engenharia', name: 'Engenharias', description: 'Espaço para todas as engenharias da UFRJ' }
  ];
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Comunidades</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {communities.map(community => (
            <div key={community.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{community.name}</h2>
                <p className="text-gray-600 mb-4">{community.description}</p>
                <a 
                  href={`/community/${community.id}`}
                  className="bg-ufrj-blue text-white px-4 py-2 rounded inline-block hover:bg-blue-700"
                >
                  Visitar Comunidade
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}