import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function EventsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Eventos</h1>
      
      <div className="bg-card rounded-lg border shadow-sm p-6">
        {user ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Nenhum evento programado no momento.</p>
            <Link 
              to="/events/new"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Criar Evento
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Faça login para ver e criar eventos.</p>
            <Link 
              to="/login"
              className="inline-flex items-center justify-center text-sm font-medium text-primary hover:underline"
            >
              Fazer Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 