/**
 * UFRJ Social - Sistema de Comunidades
 * 
 * Este módulo implementa o gerenciamento de comunidades dentro da plataforma,
 * permitindo a criação, descoberta e interação com comunidades temáticas.
 */

import nostrClient from './nostr';
import ipfsClient from './ipfs';
import gamification from './gamification';

// Constantes
const COMMUNITY_KIND = 30000; // Kind personalizado para comunidades no Nostr
const COMMUNITY_PREFIX = 'ufrj:community:';
const DEFAULT_COMMUNITIES = [
  {
    id: 'geral',
    name: 'Geral UFRJ',
    description: 'Comunidade geral para todos os assuntos relacionados à UFRJ',
    icon: 'globe',
    banner: null,
    categories: ['geral'],
    rules: 'Respeite todos os membros e siga as diretrizes da universidade.',
    createdAt: Date.now(),
    discoverable: true
  },
  {
    id: 'computacao',
    name: 'Ciência da Computação',
    description: 'Comunidade para estudantes e professores de Ciência da Computação e áreas relacionadas',
    icon: 'cpu',
    banner: null,
    categories: ['acadêmico', 'tecnologia'],
    rules: 'Compartilhe conhecimento, tire dúvidas e discuta tópicos relacionados à computação.',
    createdAt: Date.now(),
    discoverable: true
  },
  {
    id: 'engenharia',
    name: 'Engenharias',
    description: 'Espaço para todas as engenharias da UFRJ',
    icon: 'tool',
    banner: null,
    categories: ['acadêmico', 'engenharia'],
    rules: 'Compartilhe projetos, dúvidas e discussões sobre engenharia.',
    createdAt: Date.now(),
    discoverable: true
  },
  {
    id: 'eventos',
    name: 'Eventos',
    description: 'Divulgação e discussão de eventos acadêmicos, culturais e sociais da UFRJ',
    icon: 'calendar',
    banner: null,
    categories: ['eventos', 'social'],
    rules: 'Compartilhe apenas eventos legítimos relacionados à comunidade UFRJ.',
    createdAt: Date.now(),
    discoverable: true
  },
  {
    id: 'caronas',
    name: 'Caronas',
    description: 'Organização de caronas entre os campi e regiões da cidade',
    icon: 'car',
    banner: null,
    categories: ['transporte', 'social'],
    rules: 'Use com responsabilidade. Sempre verifique perfis antes de combinar caronas.',
    createdAt: Date.now(),
    discoverable: true
  },
  {
    id: 'marketplace',
    name: 'Marketplace UFRJ',
    description: 'Compra, venda e troca de itens entre a comunidade UFRJ',
    icon: 'shopping-bag',
    banner: null,
    categories: ['marketplace', 'social'],
    rules: 'Anuncie apenas itens permitidos. Sem produtos ilícitos ou serviços acadêmicos.',
    createdAt: Date.now(),
    discoverable: true
  }
];

/**
 * Classe para gerenciar comunidades na UFRJ Social
 */
class CommunitiesManager {
  constructor() {
    this.communities = new Map();
    this.userCommunities = new Set();
    this.isInitialized = false;
    this.localStorageKey = 'ufrj_social_communities';
    this.userCommunitiesKey = 'ufrj_social_user_communities';
  }

  /**
   * Inicializa o gerenciador de comunidades
   * @returns {Promise<boolean>} - Status da inicialização
   */
  async init() {
    try {
      console.log('Inicializando gerenciador de comunidades...');
      
      // Carregar comunidades do armazenamento local
      this._loadFromLocalStorage();
      
      // Se não houver comunidades, carregar padrões
      if (this.communities.size === 0) {
        this._loadDefaultCommunities();
      }
      
      // Buscar comunidades da rede Nostr
      if (nostrClient.isInitialized) {
        await this._fetchCommunitiesFromNostr();
      }
      
      this.isInitialized = true;
      console.log('Gerenciador de comunidades inicializado com sucesso!');
      
      return true;
    } catch (error) {
      console.error('Erro ao inicializar gerenciador de comunidades:', error);
      return false;
    }
  }

  /**
   * Carrega comunidades do armazenamento local
   * @private
   */
  _loadFromLocalStorage() {
    try {
      // Carregar comunidades
      const communitiesJson = localStorage.getItem(this.localStorageKey);
      if (communitiesJson) {
        const communitiesArray = JSON.parse(communitiesJson);
        communitiesArray.forEach(community => {
          this.communities.set(community.id, community);
        });
      }
      
      // Carregar comunidades do usuário
      const userCommunitiesJson = localStorage.getItem(this.userCommunitiesKey);
      if (userCommunitiesJson) {
        const userCommunitiesArray = JSON.parse(userCommunitiesJson);
        this.userCommunities = new Set(userCommunitiesArray);
      }
    } catch (error) {
      console.error('Erro ao carregar comunidades do armazenamento local:', error);
    }
  }

  /**
   * Carrega comunidades padrão
   * @private
   */
  _loadDefaultCommunities() {
    DEFAULT_COMMUNITIES.forEach(community => {
      this.communities.set(community.id, community);
    });
    
    // Salvar no armazenamento local
    this._saveToLocalStorage();
  }

  /**
   * Salva comunidades no armazenamento local
   * @private
   */
  _saveToLocalStorage() {
    try {
      // Salvar comunidades
      const communitiesArray = Array.from(this.communities.values());
      localStorage.setItem(this.localStorageKey, JSON.stringify(communitiesArray));
      
      // Salvar comunidades do usuário
      const userCommunitiesArray = Array.from(this.userCommunities);
      localStorage.setItem(this.userCommunitiesKey, JSON.stringify(userCommunitiesArray));
    } catch (error) {
      console.error('Erro ao salvar comunidades no armazenamento local:', error);
    }
  }

  /**
   * Busca comunidades da rede Nostr
   * @private
   * @returns {Promise<number>} - Número de comunidades encontradas
   */
  async _fetchCommunitiesFromNostr() {
    try {
      if (!nostrClient.isInitialized) {
        console.warn('Cliente Nostr não inicializado');
        return 0;
      }
      
      // Buscar eventos de comunidade
      const filter = {
        kinds: [COMMUNITY_KIND],
        limit: 50
      };
      
      let count = 0;
      
      for (const relay of nostrClient.connectedRelays) {
        try {
          const sub = relay.sub([filter]);
          
          const communitiesPromise = new Promise((resolve) => {
            const communities = [];
            
            sub.on('event', event => {
              try {
                // Verificar se é um evento de comunidade válido
                if (!event.tags.some(tag => tag[0] === 'community')) {
                  return;
                }
                
                // Extrair dados da comunidade
                const communityData = JSON.parse(event.content);
                
                // Verificar se contém os campos necessários
                if (!communityData.id || !communityData.name) {
                  return;
                }
                
                // Verificar se já temos esta comunidade
                if (this.communities.has(communityData.id)) {
                  // Verificar qual é mais recente
                  const existingCommunity = this.communities.get(communityData.id);
                  if (existingCommunity.updatedAt && 
                      existingCommunity.updatedAt > communityData.updatedAt) {
                    return;
                  }
                }
                
                // Adicionar à lista
                communities.push(communityData);
              } catch (error) {
                console.warn('Erro ao processar evento de comunidade:', error);
              }
            });
            
            // Timeout para encerrar a busca
            setTimeout(() => {
              sub.unsub();
              resolve(communities);
            }, 5000);
          });
          
          const communities = await communitiesPromise;
          
          // Adicionar comunidades encontradas
          communities.forEach(community => {
            this.communities.set(community.id, community);
            count++;
          });
        } catch (error) {
          console.warn(`Erro ao buscar comunidades no relay ${relay.url}:`, error);
        }
      }
      
      // Salvar no armazenamento local se encontrou novas comunidades
      if (count > 0) {
        this._saveToLocalStorage();
      }
      
      return count;
    } catch (error) {
      console.error('Erro ao buscar comunidades da rede Nostr:', error);
      return 0;
    }
  }

  /**
   * Cria uma nova comunidade
   * @param {Object} communityData - Dados da comunidade
   * @returns {Promise<Object>} - Comunidade criada
   */
  async createCommunity(communityData) {
    if (!this.isInitialized) {
      throw new Error('Gerenciador de comunidades não inicializado');
    }
    
    if (!communityData.id || !communityData.name) {
      throw new Error('ID e nome da comunidade são obrigatórios');
    }
    
    try {
      // Verificar se a comunidade já existe
      if (this.communities.has(communityData.id)) {
        throw new Error(`Comunidade com ID '${communityData.id}' já existe`);
      }
      
      // Completar dados da comunidade
      const newCommunity = {
        ...communityData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: nostrClient.publicKey || 'unknown',
        memberCount: 1,
        postCount: 0
      };
      
      // Salvar banner no IPFS se fornecido
      if (communityData.bannerFile) {
        try {
          const result = await ipfsClient.addFile(communityData.bannerFile, {
            type: 'community-banner',
            communityId: communityData.id
          });
          
          newCommunity.banner = result.cid;
          delete newCommunity.bannerFile;
        } catch (error) {
          console.error('Erro ao salvar banner no IPFS:', error);
        }
      }
      
      // Adicionar à lista local
      this.communities.set(newCommunity.id, newCommunity);
      
      // Adicionar à lista de comunidades do usuário
      this.userCommunities.add(newCommunity.id);
      
      // Salvar no armazenamento local
      this._saveToLocalStorage();
      
      // Publicar na rede Nostr (se inicializado)
      if (nostrClient.isInitialized) {
        try {
          // Criar evento Nostr
          const event = {
            kind: COMMUNITY_KIND,
            content: JSON.stringify(newCommunity),
            tags: [
              ['community', newCommunity.id],
              ['name', newCommunity.name],
              ['client', 'ufrj-social']
            ]
          };
          
          // Adicionar categorias como tags
          if (newCommunity.categories && Array.isArray(newCommunity.categories)) {
            newCommunity.categories.forEach(category => {
              event.tags.push(['category', category]);
            });
          }
          
          // Publicar evento
          await nostrClient.createPost({
            content: JSON.stringify(newCommunity),
            community: newCommunity.id,
            type: 'community',
            useCustomKind: true
          });
        } catch (error) {
          console.error('Erro ao publicar comunidade na rede Nostr:', error);
        }
      }
      
      // Adicionar pontos de gamificação
      if (gamification.isInitialized) {
        gamification.addPoints(10, 'CREATE_COMMUNITY');
      }
      
      return newCommunity;
    } catch (error) {
      console.error('Erro ao criar comunidade:', error);
      throw error;
    }
  }

  /**
   * Atualiza uma comunidade existente
   * @param {string} communityId - ID da comunidade
   * @param {Object} updates - Atualizações para a comunidade
   * @returns {Promise<Object>} - Comunidade atualizada
   */
  async updateCommunity(communityId, updates) {
    if (!this.isInitialized) {
      throw new Error('Gerenciador de comunidades não inicializado');
    }
    
    try {
      // Verificar se a comunidade existe
      if (!this.communities.has(communityId)) {
        throw new Error(`Comunidade com ID '${communityId}' não encontrada`);
      }
      
      // Obter comunidade atual
      const community = this.communities.get(communityId);
      
      // Verificar se o usuário tem permissão para editar
      if (community.createdBy !== nostrClient.publicKey) {
        throw new Error('Você não tem permissão para editar esta comunidade');
      }
      
      // Salvar banner no IPFS se fornecido
      if (updates.bannerFile) {
        try {
          const result = await ipfsClient.addFile(updates.bannerFile, {
            type: 'community-banner',
            communityId
          });
          
          updates.banner = result.cid;
          delete updates.bannerFile;
        } catch (error) {
          console.error('Erro ao salvar banner no IPFS:', error);
        }
      }
      
      // Atualizar comunidade
      const updatedCommunity = {
        ...community,
        ...updates,
        updatedAt: Date.now()
      };
      
      // Atualizar na lista local
      this.communities.set(communityId, updatedCommunity);
      
      // Salvar no armazenamento local
      this._saveToLocalStorage();
      
      // Publicar na rede Nostr (se inicializado)
      if (nostrClient.isInitialized) {
        try {
          // Publicar evento de atualização
          await nostrClient.createPost({
            content: JSON.stringify(updatedCommunity),
            community: communityId,
            type: 'community-update',
            useCustomKind: true
          });
        } catch (error) {
          console.error('Erro ao publicar atualização da comunidade na rede Nostr:', error);
        }
      }
      
      return updatedCommunity;
    } catch (error) {
      console.error('Erro ao atualizar comunidade:', error);
      throw error;
    }
  }

  /**
   * Obtém uma comunidade pelo ID
   * @param {string} communityId - ID da comunidade
   * @returns {Object|null} - Dados da comunidade ou null se não existir
   */
  getCommunity(communityId) {
    if (!this.isInitialized) {
      console.error('Gerenciador de comunidades não inicializado');
      return null;
    }
    
    return this.communities.get(communityId) || null;
  }

  /**
   * Lista todas as comunidades
   * @param {Object} options - Opções de filtragem
   * @returns {Array} - Lista de comunidades
   */
  listCommunities(options = {}) {
    if (!this.isInitialized) {
      console.error('Gerenciador de comunidades não inicializado');
      return [];
    }
    
    const {
      category,
      query,
      sort = 'name',
      limit,
      userOnly = false
    } = options;
    
    let communities = Array.from(this.communities.values());
    
    // Filtrar por comunidades do usuário
    if (userOnly) {
      communities = communities.filter(community => 
        this.userCommunities.has(community.id)
      );
    }
    
    // Filtrar por categoria
    if (category) {
      communities = communities.filter(community => 
        community.categories && community.categories.includes(category)
      );
    }
    
    // Filtrar por texto
    if (query) {
      const searchQuery = query.toLowerCase();
      communities = communities.filter(community => 
        community.name.toLowerCase().includes(searchQuery) ||
        (community.description && community.description.toLowerCase().includes(searchQuery))
      );
    }
    
    // Ordenar
    switch (sort) {
      case 'name':
        communities.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'members':
        communities.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
        break;
      case 'activity':
        communities.sort((a, b) => (b.postCount || 0) - (a.postCount || 0));
        break;
      case 'created':
        communities.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
    }
    
    // Limitar resultados
    if (limit && typeof limit === 'number') {
      communities = communities.slice(0, limit);
    }
    
    return communities;
  }

  /**
   * Entra em uma comunidade
   * @param {string} communityId - ID da comunidade
   * @returns {boolean} - Resultado da operação
   */
  async joinCommunity(communityId) {
    if (!this.isInitialized) {
      console.error('Gerenciador de comunidades não inicializado');
      return false;
    }
    
    try {
      // Verificar se a comunidade existe
      if (!this.communities.has(communityId)) {
        throw new Error(`Comunidade com ID '${communityId}' não encontrada`);
      }
      
      // Verificar se já é membro
      if (this.userCommunities.has(communityId)) {
        return true; // Já é membro
      }
      
      // Adicionar à lista de comunidades do usuário
      this.userCommunities.add(communityId);
      
      // Incrementar contador de membros
      const community = this.communities.get(communityId);
      community.memberCount = (community.memberCount || 0) + 1;
      
      // Salvar no armazenamento local
      this._saveToLocalStorage();
      
      // Publicar na rede Nostr (se inicializado)
      if (nostrClient.isInitialized) {
        try {
          // Publicar evento de adesão
          await nostrClient.createPost({
            content: JSON.stringify({
              action: 'join',
              communityId,
              timestamp: Date.now()
            }),
            community: communityId,
            type: 'community-join',
            useCustomKind: true
          });
        } catch (error) {
          console.error('Erro ao publicar adesão à comunidade na rede Nostr:', error);
        }
      }
      
      // Adicionar pontos de gamificação
      if (gamification.isInitialized) {
        gamification.addPoints(3, 'JOIN_COMMUNITY', communityId);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao entrar na comunidade:', error);
      return false;
    }
  }

  /**
   * Sai de uma comunidade
   * @param {string} communityId - ID da comunidade
   * @returns {boolean} - Resultado da operação
   */
  async leaveCommunity(communityId) {
    if (!this.isInitialized) {
      console.error('Gerenciador de comunidades não inicializado');
      return false;
    }
    
    try {
      // Verificar se é membro
      if (!this.userCommunities.has(communityId)) {
        return true; // Já não é membro
      }
      
      // Remover da lista de comunidades do usuário
      this.userCommunities.delete(communityId);
      
      // Decrementar contador de membros
      if (this.communities.has(communityId)) {
        const community = this.communities.get(communityId);
        community.memberCount = Math.max((community.memberCount || 1) - 1, 0);
      }
      
      // Salvar no armazenamento local
      this._saveToLocalStorage();
      
      // Publicar na rede Nostr (se inicializado)
      if (nostrClient.isInitialized) {
        try {
          // Publicar evento de saída
          await nostrClient.createPost({
            content: JSON.stringify({
              action: 'leave',
              communityId,
              timestamp: Date.now()
            }),
            community: communityId,
            type: 'community-leave',
            useCustomKind: true
          });
        } catch (error) {
          console.error('Erro ao publicar saída da comunidade na rede Nostr:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao sair da comunidade:', error);
      return false;
    }
  }

  /**
   * Verifica se o usuário é membro de uma comunidade
   * @param {string} communityId - ID da comunidade
   * @returns {boolean} - True se for membro
   */
  isMember(communityId) {
    if (!this.isInitialized) {
      console.error('Gerenciador de comunidades não inicializado');
      return false;
    }
    
    return this.userCommunities.has(communityId);
  }

  /**
   * Obtém as comunidades do usuário
   * @returns {Array} - Lista de IDs de comunidades
   */
  getUserCommunities() {
    if (!this.isInitialized) {
      console.error('Gerenciador de comunidades não inicializado');
      return [];
    }
    
    return Array.from(this.userCommunities);
  }

  /**
   * Incrementa o contador de posts de uma comunidade
   * @param {string} communityId - ID da comunidade
   * @returns {boolean} - Resultado da operação
   */
  incrementPostCount(communityId) {
    if (!this.isInitialized || !communityId) {
      return false;
    }
    
    try {
      // Verificar se a comunidade existe
      if (!this.communities.has(communityId)) {
        return false;
      }
      
      // Incrementar contador
      const community = this.communities.get(communityId);
      community.postCount = (community.postCount || 0) + 1;
      
      // Salvar no armazenamento local
      this._saveToLocalStorage();
      
      return true;
    } catch (error) {
      console.error('Erro ao incrementar contador de posts:', error);
      return false;
    }
  }

  /**
   * Busca comunidades da rede e atualiza o cache local
   * @returns {Promise<number>} - Número de comunidades atualizadas
   */
  async refreshCommunities() {
    if (!this.isInitialized) {
      console.error('Gerenciador de comunidades não inicializado');
      return 0;
    }
    
    return await this._fetchCommunitiesFromNostr();
  }
}

// Instância singleton
const communitiesManager = new CommunitiesManager();
export default communitiesManager;