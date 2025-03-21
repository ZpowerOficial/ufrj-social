import React from 'react';
import MainLayout from '../components/layout/MainLayout';

export default function NewPostPage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Criar Nova Publicação</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <form>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Título
              </label>
              <input
                id="title"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Título da publicação"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                Conteúdo
              </label>
              <textarea
                id="content"
                rows="6"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="O que você gostaria de compartilhar?"
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="community">
                Comunidade
              </label>
              <select
                id="community"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Selecione uma comunidade</option>
                <option value="geral">Geral UFRJ</option>
                <option value="computacao">Ciência da Computação</option>
                <option value="engenharia">Engenharias</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-ufrj-blue hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Publicar
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}