import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '../ui/use-toast';
import { supabase } from '../../lib/supabase';
import { getUFRJGeneralCommunity } from '../../lib/api';

// Componentes de UI
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validação de campos
    if (!email || !password || !username) {
      setError('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      // Registra o usuário
      const { data } = await signUp(email, password, username);
      
      if (data?.user) {
        // Cria o perfil do usuário
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id,
              display_name: username,
              username: username.toLowerCase().replace(/\s+/g, '.'),
              email: email,
              created_at: new Date()
            }
          ]);
          
        if (profileError) throw profileError;
        
        // Buscar e adicionar à comunidade geral da UFRJ
        try {
          const generalCommunity = await getUFRJGeneralCommunity();
          if (generalCommunity?.id) {
            // Adicionar usuário à comunidade geral
            const { error: memberError } = await supabase
              .from('community_members')
              .insert({
                community_id: generalCommunity.id,
                user_id: data.user.id
              });
              
            if (memberError) throw memberError;
            
            console.log(`Usuário adicionado à comunidade geral: ${generalCommunity.name}`);
          } else {
            console.error('Não foi possível encontrar a comunidade geral da UFRJ');
          }
        } catch (communityError) {
          console.error('Erro ao adicionar usuário à comunidade geral:', communityError);
          // Não interrompe o fluxo se falhar
        }
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar sua conta.",
        });
        
        navigate('/login');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      
      // Tratamento de erros específicos
      if (error.message.includes('already registered')) {
        setError('Este email já está registrado. Tente fazer login.');
      } else if (error.message.includes('password')) {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError(error.message || 'Erro ao criar conta. Tente novamente.');
      }
      
      toast({
        title: "Erro no cadastro",
        description: "Não foi possível criar sua conta. Verifique os dados informados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
        <CardDescription className="text-center">
          Preencha seus dados para criar sua conta
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Nome de Usuário</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu nome de usuário"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col">
        <div className="text-sm text-center text-muted-foreground mt-2">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Faça login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}