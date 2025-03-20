/**
 * UFRJ Social - Gerenciador de Cache
 * 
 * Este módulo implementa o sistema de cache local para permitir que a aplicação
 * funcione offline e sincronize quando online.
 */

// Configurações de cache
const CACHE_PREFIX = 'ufrj_social_cache_';
const QUEUE_KEY = 'ufrj_social_sync_queue';
const CACHE_EXPIRATION = {
  posts: 24 * 60 * 60 * 1000, // 24 horas
  profiles: 7 * 24 * 60 * 60 * 1000, // 7 dias
  communities: 3 * 24 * 60 * 60 * 1000, // 3 dias
  media: 14 * 24 * 60 * 60 * 1000, // 14 dias
  default: 24 * 60 * 60 * 1000 // 24 horas
};

// Tamanho máximo de cache
const MAX_CACHE_SIZE = {
  posts: 200,
  profiles: 100,
  communities: 50,
  media: 50,
  default: 100
};

/**
 * Gerenciador de cache para dados offline e sincronização
 */
class CacheManager {
  constructor() {
    this.storage = localStorage;
    this.memoryCache = new Map();
    this.syncQueue = [];
    this.isInitialized = false;
    this.networkStatus = navigator.onLine;
    this.storageAvailable = this._isStorageAvailable();
    this.registeredCallbacks = new Map();
    
    // Configurar detecção de status de rede
    this._setupNetworkDetection();
  }

  /**
   * Inicializa o gerenciador de cache
   * @returns {boolean} - Status da inicialização
   */
  init() {
    try {
      console.log('Inicializando gerenciador de cache...');
      
      // Verificar disponibilidade de armazenamento
      if (!this.storageAvailable) {
        console.warn('Armazenamento local não disponível, usando apenas cache em memória');
      }
      
      // Carregar fila de sincronização
      this._loadSyncQueue();
      
      // Inicializar cache em memória com itens recentes
      this._preloadFrequentItems();
      
      this.isInitialized = true;
      console.log('Gerenciador de cache inicializado com sucesso!');
      
      // Se estiver online, tentar processar a fila de sincronização
      if (this.networkStatus) {
        this.processSyncQueue();
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao inicializar gerenciador de cache:', error);
      return false;
    }
  }

  /**
   * Verifica se o armazenamento local está disponível
   * @private
   * @returns {boolean} - True se o armazenamento estiver disponível
   */
  _isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Configura a detecção de mudanças no status da rede
   * @private
   */
  _setupNetworkDetection() {
    window.addEventListener('online', () => {
      console.log('Conexão de rede restaurada');
      this.networkStatus = true;
      
      // Tentar processar a fila de sincronização
      if (this.isInitialized) {
        this.processSyncQueue();
      }
      
      // Notificar callbacks registrados
      this._notifyNetworkChange(true);
    });
    
    window.addEventListener('offline', () => {
      console.log('Conexão de rede perdida');
      this.networkStatus = false;
      
      // Notificar callbacks registrados
      this._notifyNetworkChange(false);
    });
  }

  /**
   * Notifica callbacks sobre mudanças na conexão
   * @private
   * @param {boolean} isOnline - Status atual da rede
   */
  _notifyNetworkChange(isOnline) {
    const callbacks = this.registeredCallbacks.get('networkChange') || [];
    callbacks.forEach(callback => {
      try {
        callback(isOnline);
      } catch (error) {
        console.error('Erro ao executar callback de mudança de rede:', error);
      }
    });
  }

  /**
   * Carrega a fila de sincronização do armazenamento
   * @private
   */
  _loadSyncQueue() {
    if (!this.storageAvailable) return;
    
    try {
      const queueData = this.storage.getItem(QUEUE_KEY);
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
        console.log(`Fila de sincronização carregada: ${this.syncQueue.length} item(s) pendente(s)`);
      }
    } catch (error) {
      console.error('Erro ao carregar fila de sincronização:', error);
      this.syncQueue = [];
    }
  }

  /**
   * Salva a fila de sincronização no armazenamento
   * @private
   */
  _saveSyncQueue() {
    if (!this.storageAvailable) return;
    
    try {
      this.storage.setItem(QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Erro ao salvar fila de sincronização:', error);
    }
  }

  /**
   * Pré-carrega itens frequentemente acessados para o cache em memória
   * @private
   */
  _preloadFrequentItems() {
    if (!this.storageAvailable) return;
    
    try {
      // Buscar chaves recentes do armazenamento
      const categories = ['posts', 'profiles', 'communities'];
      
      categories.forEach(category => {
        const metaKey = `${CACHE_PREFIX}meta_${category}`;
        try {
          const meta = JSON.parse(this.storage.getItem(metaKey) || '{}');
          const recentKeys = (meta.recentKeys || []).slice(0, 10); // Carregar até 10 itens recentes
          
          recentKeys.forEach(key => {
            const fullKey = `${CACHE_PREFIX}${category}_${key}`;
            try {
              const item = JSON.parse(this.storage.getItem(fullKey) || 'null');
              if (item) {
                this.memoryCache.set(fullKey, item);
              }
            } catch (e) {
              // Ignorar erro de item individual
            }
          });
        } catch (e) {
          console.warn(`Erro ao carregar metadados de cache para ${category}:`, e);
        }
      });
    } catch (error) {
      console.error('Erro ao pré-carregar itens de cache:', error);
    }
  }

  /**
   * Armazena um item no cache
   * @param {string} category - Categoria do item (posts, profiles, communities, etc)
   * @param {string} key - Chave do item
   * @param {any} data - Dados a serem armazenados
   * @param {Object} options - Opções adicionais
   * @returns {boolean} - Resultado da operação
   */
  setItem(category, key, data, options = {}) {
    if (!this.isInitialized) {
      console.warn('Gerenciador de cache não inicializado');
      return false;
    }
    
    if (!category || !key) {
      console.error('Categoria e chave são obrigatórias');
      return false;
    }
    
    try {
      const fullKey = `${CACHE_PREFIX}${category}_${key}`;
      const timestamp = Date.now();
      
      // Adicionar metadados e timestamp aos dados
      const itemWithMeta = {
        data,
        meta: {
          timestamp,
          expires: timestamp + (options.expiration || CACHE_EXPIRATION[category] || CACHE_EXPIRATION.default),
          category,
          key,
          ...options.meta
        }
      };
      
      // Armazenar em memória
      this.memoryCache.set(fullKey, itemWithMeta);
      
      // Armazenar no localStorage (se disponível)
      if (this.storageAvailable) {
        this.storage.setItem(fullKey, JSON.stringify(itemWithMeta));
        
        // Atualizar metadados da categoria
        this._updateCategoryMeta(category, key, timestamp);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao armazenar item no cache:', error);
      return false;
    }
  }

  /**
   * Atualiza os metadados de uma categoria
   * @private
   * @param {string} category - Categoria do item
   * @param {string} key - Chave do item
   * @param {number} timestamp - Timestamp da atualização
   */
  _updateCategoryMeta(category, key, timestamp) {
    if (!this.storageAvailable) return;
    
    try {
      const metaKey = `${CACHE_PREFIX}meta_${category}`;
      let meta;
      
      try {
        meta = JSON.parse(this.storage.getItem(metaKey) || '{}');
      } catch (e) {
        meta = {};
      }
      
      // Inicializar arrays se não existirem
      if (!meta.keys) meta.keys = [];
      if (!meta.recentKeys) meta.recentKeys = [];
      
      // Adicionar chave se não existir
      if (!meta.keys.includes(key)) {
        meta.keys.push(key);
      }
      
      // Atualizar lista de chaves recentes
      meta.recentKeys = meta.recentKeys.filter(k => k !== key);
      meta.recentKeys.unshift(key);
      
      // Limitar tamanho da lista de chaves recentes
      meta.recentKeys = meta.recentKeys.slice(0, 20);
      
      // Atualizar timestamp da última modificação
      meta.lastUpdated = timestamp;
      
      // Verificar tamanho do cache e limpar se necessário
      if (meta.keys.length > (MAX_CACHE_SIZE[category] || MAX_CACHE_SIZE.default)) {
        this._cleanupCategory(category, meta);
      }
      
      // Salvar metadados atualizados
      this.storage.setItem(metaKey, JSON.stringify(meta));
    } catch (error) {
      console.error(`Erro ao atualizar metadados da categoria ${category}:`, error);
    }
  }

  /**
   * Limpa os itens mais antigos de uma categoria
   * @private
   * @param {string} category - Categoria a ser limpa
   * @param {Object} meta - Metadados da categoria
   */
  _cleanupCategory(category, meta) {
    if (!this.storageAvailable) return;
    
    try {
      const maxSize = MAX_CACHE_SIZE[category] || MAX_CACHE_SIZE.default;
      const keysToRemove = meta.keys.slice(0, meta.keys.length - maxSize);
      
      // Remover chaves antigas
      keysToRemove.forEach(key => {
        // Remover do armazenamento
        this.storage.removeItem(`${CACHE_PREFIX}${category}_${key}`);
        
        // Remover da lista de chaves
        meta.keys = meta.keys.filter(k => k !== key);
        
        // Remover da lista de chaves recentes
        meta.recentKeys = meta.recentKeys.filter(k => k !== key);
      });
      
      console.log(`Limpeza de cache: removidos ${keysToRemove.length} itens da categoria ${category}`);
    } catch (error) {
      console.error(`Erro ao limpar categoria ${category}:`, error);
    }
  }

  /**
   * Recupera um item do cache
   * @param {string} category - Categoria do item
   * @param {string} key - Chave do item
   * @returns {any|null} - Dados armazenados ou null se não existir/expirado
   */
  getItem(category, key) {
    if (!this.isInitialized) {
      console.warn('Gerenciador de cache não inicializado');
      return null;
    }
    
    if (!category || !key) {
      console.error('Categoria e chave são obrigatórias');
      return null;
    }
    
    try {
      const fullKey = `${CACHE_PREFIX}${category}_${key}`;
      
      // Tentar obter do cache em memória primeiro
      let item = this.memoryCache.get(fullKey);
      
      // Se não estiver em memória, tentar obter do localStorage
      if (!item && this.storageAvailable) {
        const storedItem = this.storage.getItem(fullKey);
        if (storedItem) {
          try {
            item = JSON.parse(storedItem);
            
            // Adicionar ao cache em memória
            this.memoryCache.set(fullKey, item);
          } catch (e) {
            console.warn(`Erro ao parsear item do cache: ${fullKey}`, e);
          }
        }
      }
      
      // Verificar se o item existe e não expirou
      if (item && item.meta) {
        const now = Date.now();
        
        if (item.meta.expires > now) {
          return item.data;
        } else {
          // Item expirado, remover do cache
          this.removeItem(category, key);
          return null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao recuperar item do cache:', error);
      return null;
    }
  }

  /**
   * Remove um item do cache
   * @param {string} category - Categoria do item
   * @param {string} key - Chave do item
   * @returns {boolean} - Resultado da operação
   */
  removeItem(category, key) {
    if (!this.isInitialized) {
      console.warn('Gerenciador de cache não inicializado');
      return false;
    }
    
    if (!category || !key) {
      console.error('Categoria e chave são obrigatórias');
      return false;
    }
    
    try {
      const fullKey = `${CACHE_PREFIX}${category}_${key}`;
      
      // Remover do cache em memória
      this.memoryCache.delete(fullKey);
      
      // Remover do localStorage
      if (this.storageAvailable) {
        this.storage.removeItem(fullKey);
        
        // Atualizar metadados da categoria
        const metaKey = `${CACHE_PREFIX}meta_${category}`;
        try {
          const meta = JSON.parse(this.storage.getItem(metaKey) || '{}');
          
          // Remover da lista de chaves
          if (meta.keys) {
            meta.keys = meta.keys.filter(k => k !== key);
          }
          
          // Remover da lista de chaves recentes
          if (meta.recentKeys) {
            meta.recentKeys = meta.recentKeys.filter(k => k !== key);
          }
          
          // Salvar metadados atualizados
          this.storage.setItem(metaKey, JSON.stringify(meta));
        } catch (e) {
          console.warn(`Erro ao atualizar metadados ao remover item: ${fullKey}`, e);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao remover item do cache:', error);
      return false;
    }
  }

  /**
   * Limpa todo o cache ou uma categoria específica
   * @param {string} [category] - Categoria a ser limpa (opcional)
   * @returns {boolean} - Resultado da operação
   */
  clearCache(category) {
    if (!this.isInitialized) {
      console.warn('Gerenciador de cache não inicializado');
      return false;
    }
    
    try {
      if (category) {
        // Limpar apenas uma categoria
        
        // Remover da memória
        for (const key of this.memoryCache.keys()) {
          if (key.startsWith(`${CACHE_PREFIX}${category}_`)) {
            this.memoryCache.delete(key);
          }
        }
        
        // Remover do localStorage
        if (this.storageAvailable) {
          const metaKey = `${CACHE_PREFIX}meta_${category}`;
          try {
            const meta = JSON.parse(this.storage.getItem(metaKey) || '{}');
            
            // Remover todos os itens da categoria
            if (meta.keys) {
              meta.keys.forEach(key => {
                this.storage.removeItem(`${CACHE_PREFIX}${category}_${key}`);
              });
            }
            
            // Limpar metadados
            meta.keys = [];
            meta.recentKeys = [];
            meta.lastUpdated = Date.now();
            
            // Salvar metadados atualizados
            this.storage.setItem(metaKey, JSON.stringify(meta));
          } catch (e) {
            console.warn(`Erro ao limpar metadados da categoria: ${category}`, e);
          }
        }
      } else {
        // Limpar todo o cache
        
        // Limpar cache em memória
        this.memoryCache.clear();
        
        // Limpar localStorage
        if (this.storageAvailable) {
          // Obter todas as chaves que começam com o prefixo
          const keysToRemove = [];
          for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
              keysToRemove.push(key);
            }
          }
          
          // Remover as chaves
          keysToRemove.forEach(key => {
            this.storage.removeItem(key);
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      return false;
    }
  }

  /**
   * Adiciona uma operação à fila de sincronização
   * @param {string} type - Tipo de operação
   * @param {Object} data - Dados da operação
   * @returns {string} - ID da operação adicionada
   */
  addToSyncQueue(type, data) {
    if (!this.isInitialized) {
      console.warn('Gerenciador de cache não inicializado');
      return null;
    }
    
    try {
      const operationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const operation = {
        id: operationId,
        type,
        data,
        timestamp: Date.now(),
        attempts: 0,
        status: 'pending'
      };
      
      // Adicionar à fila
      this.syncQueue.push(operation);
      
      // Salvar fila atualizada
      this._saveSyncQueue();
      
      // Se estiver online, tentar processar imediatamente
      if (this.networkStatus) {
        this.processSyncQueue();
      }
      
      return operationId;
    } catch (error) {
      console.error('Erro ao adicionar à fila de sincronização:', error);
      return null;
    }
  }

  /**
   * Processa a fila de sincronização
   * @returns {Promise<number>} - Número de operações processadas com sucesso
   */
  async processSyncQueue() {
    if (!this.isInitialized) {
      console.warn('Gerenciador de cache não inicializado');
      return 0;
    }
    
    if (!this.networkStatus) {
      console.log('Sem conexão de rede, sincronização adiada');
      return 0;
    }
    
    if (this.syncQueue.length === 0) {
      return 0;
    }
    
    console.log(`Processando fila de sincronização: ${this.syncQueue.length} operação(ões) pendente(s)`);
    
    let successCount = 0;
    const callbacks = this.registeredCallbacks.get('syncOperation') || [];
    
    // Processar operações na ordem em que foram adicionadas
    for (let i = 0; i < this.syncQueue.length; i++) {
      const operation = this.syncQueue[i];
      
      // Pular operações já completadas ou com muitas tentativas
      if (operation.status === 'completed' || operation.attempts >= 5) {
        continue;
      }
      
      // Atualizar status e tentativa
      operation.status = 'processing';
      operation.attempts += 1;
      
      try {
        let processed = false;
        
        // Chamar callbacks registrados
        for (const callback of callbacks) {
          try {
            const result = await callback(operation);
            if (result === true) {
              processed = true;
              break;
            }
          } catch (e) {
            console.warn(`Erro ao executar callback de sincronização para operação ${operation.type}:`, e);
          }
        }
        
        if (processed) {
          // Marcar como concluída
          operation.status = 'completed';
          operation.completedAt = Date.now();
          successCount++;
        } else {
          // Marcar como falha
          operation.status = 'failed';
          operation.lastError = 'Nenhum handler processou a operação';
        }
      } catch (error) {
        // Registrar erro
        operation.status = 'failed';
        operation.lastError = error.message || 'Erro desconhecido';
        console.error(`Erro ao processar operação ${operation.id} (${operation.type}):`, error);
      }
    }
    
    // Remover operações completadas após 1 hora
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.syncQueue = this.syncQueue.filter(op => {
      return op.status !== 'completed' || !op.completedAt || op.completedAt > oneHourAgo;
    });
    
    // Salvar fila atualizada
    this._saveSyncQueue();
    
    console.log(`Sincronização concluída: ${successCount} operação(ões) processada(s) com sucesso`);
    return successCount;
  }

  /**
   * Registra um callback para um evento específico
   * @param {string} event - Nome do evento ('syncOperation', 'networkChange', etc)
   * @param {Function} callback - Função de callback
   * @returns {boolean} - Resultado do registro
   */
  registerCallback(event, callback) {
    if (!event || typeof callback !== 'function') {
      return false;
    }
    
    if (!this.registeredCallbacks.has(event)) {
      this.registeredCallbacks.set(event, []);
    }
    
    const callbacks = this.registeredCallbacks.get(event);
    callbacks.push(callback);
    
    return true;
  }

  /**
   * Remove um callback registrado
   * @param {string} event - Nome do evento
   * @param {Function} callback - Função de callback a remover
   * @returns {boolean} - Resultado da remoção
   */
  unregisterCallback(event, callback) {
    if (!event || !this.registeredCallbacks.has(event)) {
      return false;
    }
    
    const callbacks = this.registeredCallbacks.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
      return true;
    }
    
    return false;
  }

  /**
   * Obtém estatísticas do cache
   * @returns {Object} - Estatísticas do cache
   */
  getStats() {
    const stats = {
      memoryCache: {
        size: this.memoryCache.size
      },
      localStorage: {
        available: this.storageAvailable,
        size: 0,
        items: 0
      },
      syncQueue: {
        total: this.syncQueue.length,
        pending: 0,
        processing: 0,
        failed: 0,
        completed: 0
      },
      categories: {}
    };
    
    // Estatísticas da fila de sincronização
    this.syncQueue.forEach(op => {
      stats.syncQueue[op.status]++;
    });
    
    // Estatísticas do armazenamento local
    if (this.storageAvailable) {
      let totalSize = 0;
      let itemCount = 0;
      
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          const value = this.storage.getItem(key);
          totalSize += (key.length + (value ? value.length : 0)) * 2; // Aproximação em bytes
          itemCount++;
          
          // Extrair categoria do nome da chave
          if (key.startsWith(`${CACHE_PREFIX}meta_`)) {
            const category = key.split('_')[1];
            if (!stats.categories[category]) {
              stats.categories[category] = { items: 0, size: 0 };
            }
          } else {
            const parts = key.split('_');
            if (parts.length >= 2) {
              const category = parts[1];
              if (!stats.categories[category]) {
                stats.categories[category] = { items: 0, size: 0 };
              }
              stats.categories[category].items++;
              stats.categories[category].size += (key.length + (value ? value.length : 0)) * 2;
            }
          }
        }
      }
      
      stats.localStorage.size = totalSize;
      stats.localStorage.items = itemCount;
    }
    
    return stats;
  }

  /**
   * Verifica o status atual da rede
   * @returns {boolean} - Status da rede (true = online)
   */
  isOnline() {
    return this.networkStatus;
  }
}

// Instância singleton
const cacheManager = new CacheManager();
export default cacheManager;