/**
 * UFRJ Social - Módulo de Integração Nostr
 * 
 * Este módulo implementa a comunicação com o protocolo Nostr para criar uma
 * rede social totalmente descentralizada que funciona no GitHub Pages.
 */

import { generatePrivateKey, getPublicKey, nip19, signEvent, validateEvent, verifySignature } from 'nostr-tools';
import { finalizeEvent, relayInit } from 'nostr-tools';

// Array de relays Nostr confiáveis
const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.nostr.info',
  'wss://nostr.zebedee.cloud',
  'wss://relay.nostr.band'
];

// Prefixo para identificar conteúdo da UFRJ Social
const UFRJ_SOCIAL_PREFIX = 'ufrj:';
const UFRJ_SOCIAL_KIND = 30078; // Tipo personalizado para a UFRJ Social

/**
 * Classe para gerenciar a conexão com relays Nostr
 */
class NostrClient {
  constructor() {
    this.relays = [];
    this.connectedRelays = [];
    this.privateKey = null;
    this.publicKey = null;
    this.profile = null;
    this.subscriptions = new Map();
    this.cache = new Map();
    this.isInitialized = false;
  }

  /**
   * Inicializa o cliente Nostr
   * @param {string[]} userRelays - Lista de relays fornecida pelo usuário
   * @returns {Promise<boolean>} - Status da inicialização
   */
  async init(userRelays = []) {
    try {
      console.log('Inicializando cliente Nostr...');
      
      // Combinar relays padrão com relays do usuário
      const relayUrls = [...new Set([...DEFAULT_RELAYS, ...userRelays])];
      
      // Inicializar conexões com relays
      this.relays = relayUrls.map(url => relayInit(url));
      
      // Conectar a todos os relays
      const connectionPromises = this.relays.map(async (relay, index) => {
        try {
          await relay.connect();
          console.log(`Conectado ao relay: ${relay.url}`);
          this.connectedRelays.push(relay);
          return true;
        } catch (error) {
          console.warn(`Falha ao conectar ao relay ${relay.url}:`, error);
          return false;
        }
      });
      
      // Aguardar conexões
      const results = await Promise.allSettled(connectionPromises);
      
      // Verificar se temos pelo menos um relay conectado
      if (this.connectedRelays.length === 0) {
        console.error('Não foi possível conectar a nenhum relay');
        return false;
      }
      
      // Carregar ou gerar chaves
      await this._loadOrGenerateKeys();
      
      // Carregar perfil do usuário
      await this._loadUserProfile();
      
      this.isInitialized = true;
      console.log('Cliente Nostr inicializado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar cliente Nostr:', error);
      return false;
    }
  }

  /**
   * Carrega ou gera chaves criptográficas para o usuário
   * @private
   */
  async _loadOrGenerateKeys() {
    // Tentar carregar chaves do localStorage
    const storedPrivateKey = localStorage.getItem('ufrj_social_nostr_key');
    
    if (storedPrivateKey) {
      try {
        this.privateKey = storedPrivateKey;
        this.publicKey = getPublicKey(this.privateKey);
        console.log('Chaves carregadas do armazenamento local');
      } catch (error) {
        console.error('Erro ao carregar chaves existentes:', error);
        await this._generateNewKeys();
      }
    } else {
      await this._generateNewKeys();
    }
  }

  /**
   * Gera novas chaves criptográficas para o usuário
   * @private
   */
  async _generateNewKeys() {
    this.privateKey = generatePrivateKey();
    this.publicKey = getPublicKey(this.privateKey);
    
    // Armazenar chave privada (com cuidado, em uma aplicação real usaríamos armazenamento mais seguro)
    localStorage.setItem('ufrj_social_nostr_key', this.privateKey);
    console.log('Novas chaves geradas');
  }

  /**
   * Carrega o perfil do usuário dos relays
   * @private
   */
  async _loadUserProfile() {
    if (!this.publicKey) return null;
    
    try {
      // Eventos de tipo 0 são metadados de perfil no Nostr
      const filter = {
        kinds: [0],
        authors: [this.publicKey],
        limit: 1
      };
      
      let profileEvent = null;
      
      // Buscar perfil em todos os relays conectados
      for (const relay of this.connectedRelays) {
        try {
          const sub = relay.sub([filter]);
          
          const profilePromise = new Promise((resolve) => {
            sub.on('event', event => {
              resolve(event);
              sub.unsub();
            });
            
            // Timeout para o caso de não haver resposta
            setTimeout(() => {
              sub.unsub();
              resolve(null);
            }, 3000);
          });
          
          const event = await profilePromise;
          if (event) {
            profileEvent = event;
            break;
          }
        } catch (error) {
          console.warn(`Erro ao buscar perfil no relay ${relay.url}:`, error);
        }
      }
      
      if (profileEvent) {
        this.profile = JSON.parse(profileEvent.content);
        return this.profile;
      }
      
      // Se não encontrou perfil, criar um básico
      this.profile = {
        name: 'Usuário UFRJ',
        about: 'Membro da comunidade UFRJ Social',
        picture: 'https://i.imgur.com/8wBmA9w.png' // Imagem padrão (placeholder)
      };
      
      return this.profile;
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      return null;
    }
  }

  /**
   * Atualiza o perfil do usuário
   * @param {Object} profileData - Dados do perfil (name, about, picture, etc)
   * @returns {Promise<Object>} - Evento do perfil atualizado
   */
  async updateProfile(profileData) {
    if (!this.isInitialized || !this.privateKey) {
      throw new Error('Cliente Nostr não inicializado corretamente');
    }
    
    try {
      // Criar evento de metadados de perfil (kind 0)
      const event = {
        kind: 0,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: JSON.stringify({
          ...this.profile,
          ...profileData,
          updated_at: new Date().toISOString()
        })
      };
      
      // Finalizar e assinar o evento
      const signedEvent = finalizeEvent(event, this.privateKey);
      
      // Publicar em todos os relays conectados
      const publishPromises = this.connectedRelays.map(relay => {
        return relay.publish(signedEvent);
      });
      
      await Promise.allSettled(publishPromises);
      
      // Atualizar perfil local
      this.profile = JSON.parse(event.content);
      
      console.log('Perfil atualizado com sucesso');
      return signedEvent;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Publica uma postagem na rede UFRJ Social
   * @param {Object} postData - Dados do post (content, community, etc)
   * @returns {Promise<Object>} - Evento do post publicado
   */
  async createPost(postData) {
    if (!this.isInitialized || !this.privateKey) {
      throw new Error('Cliente Nostr não inicializado corretamente');
    }
    
    try {
      // Montar tags
      const tags = [
        ['client', 'ufrj-social'],
        ['version', '1.0.0']
      ];
      
      // Adicionar tag de comunidade se especificada
      if (postData.community) {
        tags.push(['community', postData.community]);
      }
      
      // Se for resposta a outro post, adicionar tag de resposta
      if (postData.replyTo) {
        tags.push(['e', postData.replyTo, '', 'reply']);
      }
      
      // Se tiver menções, adicionar
      if (postData.mentions && Array.isArray(postData.mentions)) {
        postData.mentions.forEach(pubkey => {
          tags.push(['p', pubkey]);
        });
      }
      
      // Se tiver hashtags, adicionar
      if (postData.hashtags && Array.isArray(postData.hashtags)) {
        postData.hashtags.forEach(tag => {
          tags.push(['t', tag]);
        });
      }
      
      // Estruturar o conteúdo para UFRJ Social
      const ufrjContent = {
        text: postData.content,
        community: postData.community || 'geral',
        type: postData.type || 'post',
        title: postData.title || '',
        media: postData.media || [],
        timestamp: Date.now()
      };
      
      // Criar evento Nostr (usamos o kind 1 para notas de texto simples, ou nosso kind personalizado)
      const event = {
        kind: postData.useCustomKind ? UFRJ_SOCIAL_KIND : 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: tags,
        content: JSON.stringify(ufrjContent)
      };
      
      // Finalizar e assinar o evento
      const signedEvent = finalizeEvent(event, this.privateKey);
      
      // Publicar em todos os relays conectados
      const publishPromises = this.connectedRelays.map(relay => {
        return relay.publish(signedEvent);
      });
      
      const results = await Promise.allSettled(publishPromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      console.log(`Post publicado com sucesso em ${successCount}/${this.connectedRelays.length} relays`);
      return signedEvent;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw error;
    }
  }

  /**
   * Busca posts da comunidade UFRJ Social
   * @param {Object} options - Opções de filtragem (community, limit, etc)
   * @returns {Promise<Array>} - Lista de posts
   */
  async getPosts(options = {}) {
    if (!this.isInitialized) {
      throw new Error('Cliente Nostr não inicializado corretamente');
    }
    
    const {
      community,
      limit = 20,
      since,
      authors,
      kinds = [1, UFRJ_SOCIAL_KIND],
      hashtag
    } = options;
    
    try {
      // Construir filtro base
      const filter = {
        kinds,
        limit
      };
      
      // Adicionar parâmetros de filtragem
      if (since) {
        filter.since = Math.floor(since / 1000);
      }
      
      if (authors && authors.length > 0) {
        filter.authors = authors;
      }
      
      // Tags para filtrar
      const filterTags = [];
      
      // Adicionar comunidade se especificada
      if (community) {
        filterTags.push(['community', community]);
      }
      
      // Adicionar hashtag se especificada
      if (hashtag) {
        filterTags.push(['t', hashtag]);
      }
      
      // Adicionar tag de cliente UFRJ Social
      filterTags.push(['client', 'ufrj-social']);
      
      if (filterTags.length > 0) {
        filter['#t'] = filterTags.map(t => t[1]);
      }
      
      // Armazenar todos os eventos encontrados
      const events = [];
      
      // Buscar em todos os relays conectados
      const subPromises = this.connectedRelays.map(relay => {
        return new Promise((resolve) => {
          const sub = relay.sub([filter]);
          
          sub.on('event', event => {
            // Verificar se o evento já existe na lista (evitar duplicatas)
            if (!events.some(e => e.id === event.id)) {
              events.push(event);
            }
          });
          
          // Definir um timeout para encerrar a busca
          setTimeout(() => {
            sub.unsub();
            resolve();
          }, 5000);
        });
      });
      
      // Aguardar todas as buscas
      await Promise.all(subPromises);
      
      // Ordenar eventos do mais recente para o mais antigo
      events.sort((a, b) => b.created_at - a.created_at);
      
      // Processar eventos para o formato da UFRJ Social
      const posts = events.map(this._processPostEvent);
      
      return posts;
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      return [];
    }
  }

  /**
   * Processa um evento Nostr para o formato de post da UFRJ Social
   * @private
   * @param {Object} event - Evento Nostr
   * @returns {Object} - Post formatado
   */
  _processPostEvent(event) {
    try {
      // Tentar extrair o conteúdo JSON da UFRJ Social
      let ufrjContent;
      try {
        ufrjContent = JSON.parse(event.content);
      } catch (e) {
        // Se não for JSON, é um post simples do Nostr
        ufrjContent = {
          text: event.content,
          community: 'geral',
          type: 'post',
          timestamp: event.created_at * 1000
        };
      }
      
      // Extrair informações das tags
      const community = event.tags.find(t => t[0] === 'community')?.[1] || ufrjContent.community || 'geral';
      const hashtags = event.tags.filter(t => t[0] === 't').map(t => t[1]);
      const mentions = event.tags.filter(t => t[0] === 'p').map(t => t[1]);
      const replyTo = event.tags.find(t => t[0] === 'e' && t[3] === 'reply')?.[1];
      
      return {
        id: event.id,
        pubkey: event.pubkey,
        content: ufrjContent.text,
        title: ufrjContent.title || '',
        community,
        hashtags,
        mentions,
        replyTo,
        type: ufrjContent.type || 'post',
        media: ufrjContent.media || [],
        createdAt: event.created_at * 1000,
        timestamp: ufrjContent.timestamp || (event.created_at * 1000),
        raw: event
      };
    } catch (error) {
      console.error('Erro ao processar evento de post:', error);
      return {
        id: event.id,
        pubkey: event.pubkey,
        content: event.content,
        community: 'geral',
        createdAt: event.created_at * 1000,
        raw: event
      };
    }
  }

  /**
   * Segue um usuário no Nostr
   * @param {string} pubkey - Chave pública do usuário a seguir
   * @returns {Promise<Object>} - Evento de contato atualizado
   */
  async followUser(pubkey) {
    if (!this.isInitialized || !this.privateKey) {
      throw new Error('Cliente Nostr não inicializado corretamente');
    }
    
    try {
      // Buscar lista atual de seguidos
      const currentFollows = await this._getFollowList();
      
      // Verificar se já segue
      if (currentFollows.includes(pubkey)) {
        console.log('Usuário já está sendo seguido');
        return null;
      }
      
      // Adicionar novo usuário à lista
      const newFollows = [...currentFollows, pubkey];
      
      // Criar novo evento de contatos (kind 3)
      const tags = newFollows.map(pk => ['p', pk]);
      
      const event = {
        kind: 3,
        created_at: Math.floor(Date.now() / 1000),
        tags: tags,
        content: ''
      };
      
      // Finalizar e assinar o evento
      const signedEvent = finalizeEvent(event, this.privateKey);
      
      // Publicar em todos os relays conectados
      const publishPromises = this.connectedRelays.map(relay => {
        return relay.publish(signedEvent);
      });
      
      await Promise.allSettled(publishPromises);
      
      console.log(`Seguindo usuário ${pubkey}`);
      return signedEvent;
    } catch (error) {
      console.error('Erro ao seguir usuário:', error);
      throw error;
    }
  }

  /**
   * Deixa de seguir um usuário no Nostr
   * @param {string} pubkey - Chave pública do usuário a deixar de seguir
   * @returns {Promise<Object>} - Evento de contato atualizado
   */
  async unfollowUser(pubkey) {
    if (!this.isInitialized || !this.privateKey) {
      throw new Error('Cliente Nostr não inicializado corretamente');
    }
    
    try {
      // Buscar lista atual de seguidos
      const currentFollows = await this._getFollowList();
      
      // Verificar se segue o usuário
      if (!currentFollows.includes(pubkey)) {
        console.log('Usuário não está sendo seguido');
        return null;
      }
      
      // Remover usuário da lista
      const newFollows = currentFollows.filter(pk => pk !== pubkey);
      
      // Criar novo evento de contatos (kind 3)
      const tags = newFollows.map(pk => ['p', pk]);
      
      const event = {
        kind: 3,
        created_at: Math.floor(Date.now() / 1000),
        tags: tags,
        content: ''
      };
      
      // Finalizar e assinar o evento
      const signedEvent = finalizeEvent(event, this.privateKey);
      
      // Publicar em todos os relays conectados
      const publishPromises = this.connectedRelays.map(relay => {
        return relay.publish(signedEvent);
      });
      
      await Promise.allSettled(publishPromises);
      
      console.log(`Deixou de seguir usuário ${pubkey}`);
      return signedEvent;
    } catch (error) {
      console.error('Erro ao deixar de seguir usuário:', error);
      throw error;
    }
  }

  /**
   * Obtém a lista de usuários seguidos
   * @private
   * @returns {Promise<Array>} - Lista de chaves públicas dos usuários seguidos
   */
  async _getFollowList() {
    if (!this.publicKey) return [];
    
    try {
      // Eventos de tipo 3 são listas de contatos no Nostr
      const filter = {
        kinds: [3],
        authors: [this.publicKey],
        limit: 1
      };
      
      let contactEvent = null;
      
      // Buscar em todos os relays conectados
      for (const relay of this.connectedRelays) {
        try {
          const sub = relay.sub([filter]);
          
          const contactPromise = new Promise((resolve) => {
            sub.on('event', event => {
              resolve(event);
              sub.unsub();
            });
            
            setTimeout(() => {
              sub.unsub();
              resolve(null);
            }, 3000);
          });
          
          const event = await contactPromise;
          if (event) {
            contactEvent = event;
            break;
          }
        } catch (error) {
          console.warn(`Erro ao buscar contatos no relay ${relay.url}:`, error);
        }
      }
      
      if (contactEvent) {
        // Extrair todas as tags 'p' (pessoas)
        const follows = contactEvent.tags
          .filter(tag => tag[0] === 'p')
          .map(tag => tag[1]);
        
        return follows;
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao obter lista de seguidos:', error);
      return [];
    }
  }

  /**
   * Reage a um post (like/dislike)
   * @param {string} eventId - ID do evento ao qual reagir
   * @param {string} reaction - Tipo de reação (+/-)
   * @returns {Promise<Object>} - Evento de reação
   */
  async reactToPost(eventId, reaction = '+') {
    if (!this.isInitialized || !this.privateKey) {
      throw new Error('Cliente Nostr não inicializado corretamente');
    }
    
    try {
      // Criar evento de reação (kind 7)
      const event = {
        kind: 7,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['e', eventId],
          ['client', 'ufrj-social']
        ],
        content: reaction
      };
      
      // Finalizar e assinar o evento
      const signedEvent = finalizeEvent(event, this.privateKey);
      
      // Publicar em todos os relays conectados
      const publishPromises = this.connectedRelays.map(relay => {
        return relay.publish(signedEvent);
      });
      
      await Promise.allSettled(publishPromises);
      
      console.log(`Reagiu ao post ${eventId} com ${reaction}`);
      return signedEvent;
    } catch (error) {
      console.error('Erro ao reagir ao post:', error);
      throw error;
    }
  }

  /**
   * Desconecta de todos os relays
   */
  async disconnect() {
    try {
      const disconnectPromises = this.connectedRelays.map(relay => {
        return relay.close();
      });
      
      await Promise.allSettled(disconnectPromises);
      
      this.connectedRelays = [];
      this.isInitialized = false;
      
      console.log('Desconectado de todos os relays');
    } catch (error) {
      console.error('Erro ao desconectar dos relays:', error);
    }
  }
}

// Instância singleton do cliente Nostr
const nostrClient = new NostrClient();

export default nostrClient;