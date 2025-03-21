import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
        <LoginForm />
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Ainda não tem uma conta?{' '}
            <a href="/register" className="text-ufrj-blue hover:underline">
              Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}