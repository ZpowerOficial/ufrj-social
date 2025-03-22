import React from 'react';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  // Determinar a base URL para o GitHub Pages
  const baseUrl = window.location.hostname === 'chpgo.github.io' ? '/ufrj-social' : '';

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
      <LoginForm />
      <div className="text-center mt-6">
        <p className="text-muted-foreground">
          Ainda não tem uma conta?{' '}
          <a href={baseUrl + "/register"} className="text-primary hover:underline">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
}