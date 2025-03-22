import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  // Determinar a base URL para o GitHub Pages
  const baseUrl = window.location.hostname === 'chpgo.github.io' ? '/ufrj-social' : '';

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Criar Nova Conta</h1>
      <RegisterForm />
      <div className="text-center mt-6">
        <p className="text-muted-foreground">
          Já tem uma conta?{' '}
          <a href={baseUrl + "/login"} className="text-primary hover:underline">
            Faça login
          </a>
        </p>
      </div>
    </div>
  );
}