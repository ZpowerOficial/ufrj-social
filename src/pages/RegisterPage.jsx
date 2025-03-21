import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Criar Nova Conta</h1>
        <RegisterForm />
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <a href="/login" className="text-ufrj-blue hover:underline">
              Faça login
            </a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}