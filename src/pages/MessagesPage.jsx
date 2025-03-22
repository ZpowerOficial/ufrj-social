import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Send, Search } from 'lucide-react';

import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { cn } from '../lib/utils';

export default function MessagesPage() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToNewMessages();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          participants:conversation_participants(
            user:profiles(id, display_name, avatar_url)
          ),
          last_message,
          updated_at
        `)
        .eq('conversation_participants.user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Formatar conversas para exibição
      const formattedConversations = data.map(conv => ({
        id: conv.id,
        otherUser: conv.participants
          .find(p => p.user.id !== user.id)?.user,
        lastMessage: conv.last_message,
        updatedAt: conv.updated_at
      }));

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender:profiles(id, display_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  const subscribeToNewMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedConversation?.id}`
      }, payload => {
        if (payload.new.sender_id !== user.id) {
          fetchMessages(selectedConversation.id);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: user.id,
          content: newMessage
        });

      if (error) throw error;

      // Atualizar última mensagem da conversa
      await supabase
        .from('conversations')
        .update({
          last_message: newMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation.id);

      setNewMessage('');
      fetchMessages(selectedConversation.id);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const startNewConversation = async (otherUserId) => {
    try {
      // Verificar se já existe uma conversa
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('participant1_id', user.id)
        .eq('participant2_id', otherUserId)
        .single();

      if (existingConv) {
        setSelectedConversation(existingConv);
        return;
      }

      // Criar nova conversa
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: user.id,
          participant2_id: otherUserId
        })
        .select()
        .single();

      if (error) throw error;

      setSelectedConversation(newConv);
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Lista de Conversas */}
      <div className="w-80 border-r">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar conversas..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {conversations
            .filter(conv => 
              conv.otherUser.display_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
            )
            .map(conv => (
              <button
                key={conv.id}
                className={cn(
                  "w-full p-4 flex items-center gap-3 hover:bg-accent transition-colors",
                  selectedConversation?.id === conv.id && "bg-accent"
                )}
                onClick={() => setSelectedConversation(conv)}
              >
                <Avatar>
                  <AvatarImage src={conv.otherUser.avatar_url} />
                  <AvatarFallback>
                    {conv.otherUser.display_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium">{conv.otherUser.display_name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage}
                  </p>
                </div>
              </button>
            ))}
        </ScrollArea>
      </div>

      {/* Área de Mensagens */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Cabeçalho */}
          <div className="p-4 border-b flex items-center gap-3">
            <Avatar>
              <AvatarImage src={selectedConversation.otherUser.avatar_url} />
              <AvatarFallback>
                {selectedConversation.otherUser.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {selectedConversation.otherUser.display_name}
              </p>
            </div>
          </div>

          {/* Mensagens */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.sender.id === user.id && "justify-end"
                  )}
                >
                  {message.sender.id !== user.id && (
                    <Avatar>
                      <AvatarImage src={message.sender.avatar_url} />
                      <AvatarFallback>
                        {message.sender.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-[70%]",
                      message.sender.id === user.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input de Mensagem */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar mensagem</span>
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Selecione uma conversa para começar
        </div>
      )}
    </div>
  );
} 