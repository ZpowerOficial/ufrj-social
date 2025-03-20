/**
 * UFRJ Social - Módulo de Integração IPFS
 * 
 * Este módulo implementa a integração com o IPFS para armazenamento
 * descentralizado de arquivos multimídia na rede social.
 */

import { create } from 'ipfs-http-client';

// Gateway público para exibição de conteúdo IPFS
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// Configurações para upload de arquivos
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/markdown'
];

/**
 * Classe para gerenciar operações IPFS
 */
class IPFSClient {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.uploadQueue = [];
    this.processingQueue = false;
  }

  /**
   * Inicializa o cliente IPFS
   * @returns {Promise<boolean>} - Status da inicialização
   */
  async init() {
    try {
      console.log('Inicializando cliente IPFS...');
      
      // Utilizamos um serviço de gateway IPFS público com suporte para API
      // Em um ambiente de produção, recomendaria usar um nó IPFS privado
      this.client = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: 'Basic ' + btoa(process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_API_SECRET)
        }
      });
      
      // Verificar se o cliente está funcionando
      await this.client.version();
      
      this.isInitialized = true;
      console.log('Cliente IPFS inicializado com sucesso!');
      
      // Processar fila de uploads pendentes, se houver
      if (this.uploadQueue.length > 0) {
        this._processQueue();
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao inicializar cliente IPFS:', error);
      
      // Fallback para gateway IPFS via pinata ou web3.storage
      this._initFallback();
      
      return false;
    }
  }

  /**
   * Inicializa um cliente alternativo caso o principal falhe
   * @private
   */
  async _initFallback() {
    try {
      console.log('Tentando inicializar cliente IPFS alternativo...');
      
      // Utilizamos web3.storage como fallback
      if (process.env.WEB3_STORAGE_TOKEN) {
        const { Web3Storage } = await import('web3.storage');
        this.fallbackClient = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });
        
        this.isInitialized = true;
        console.log('Cliente IPFS alternativo inicializado com sucesso!');
        
        // Processar fila de uploads pendentes, se houver
        if (this.uploadQueue.length > 0) {
          this._processQueue();
        }
        
        return true;
      } else {
        console.warn('Token Web3.Storage não disponível para fallback');
        return false;
      }
    } catch (error) {
      console.error('Erro ao inicializar cliente IPFS alternativo:', error);
      return false;
    }
  }

  /**
   * Adiciona um arquivo ao IPFS
   * @param {File|Blob} file - Arquivo a ser enviado
   * @param {Object} metadata - Metadados do arquivo
   * @returns {Promise<Object>} - Informações do arquivo no IPFS
   */
  async addFile(file, metadata = {}) {
    // Validar o arquivo
    if (!file) {
      throw new Error('Arquivo não fornecido');
    }
    
    // Verificar tamanho máximo
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    
    // Verificar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido: ${file.type}`);
    }
    
    // Se o cliente não estiver pronto, adicionar à fila
    if (!this.isInitialized) {
      return new Promise((resolve, reject) => {
        this.uploadQueue.push({
          file,
          metadata,
          resolve,
          reject
        });
        
        // Tentar inicializar o cliente
        this.init();
      });
    }
    
    try {
      let cid;
      
      // Preparar metadados completos
      const fullMetadata = {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        ...metadata,
        source: 'ufrj-social',
        timestamp: Date.now()
      };
      
      // Criar objeto com o arquivo e metadados
      const fileData = new File(
        [file], 
        file.name, 
        { type: file.type }
      );
      
      // Upload usando o cliente principal ou fallback
      if (this.client) {
        // Adicionar arquivo ao IPFS
        const result = await this.client.add(fileData);
        cid = result.path;
      } else if (this.fallbackClient) {
        // Usar Web3.Storage como fallback
        const fileWithMetadata = new File(
          [JSON.stringify(fullMetadata), fileData], 
          'metadata.json', 
          { type: 'application/json' }
        );
        
        const result = await this.fallbackClient.put([fileWithMetadata, fileData]);
        cid = result;
      } else {
        throw new Error('Nenhum cliente IPFS disponível');
      }
      
      // Retornar informações do arquivo no IPFS
      return {
        cid,
        url: `${IPFS_GATEWAY}${cid}`,
        metadata: fullMetadata
      };
    } catch (error) {
      console.error('Erro ao adicionar arquivo ao IPFS:', error);
      throw error;
    }
  }

  /**
   * Processa a fila de uploads pendentes
   * @private
   */
  async _processQueue() {
    if (this.processingQueue || !this.isInitialized) return;
    
    this.processingQueue = true;
    
    try {
      while (this.uploadQueue.length > 0) {
        const { file, metadata, resolve, reject } = this.uploadQueue.shift();
        
        try {
          const result = await this.addFile(file, metadata);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Obtém o URL para um arquivo no IPFS
   * @param {string} cid - CID do arquivo no IPFS
   * @returns {string} - URL para o arquivo
   */
  getFileUrl(cid) {
    if (!cid) return null;
    
    // Remover prefixo ipfs:// se existir
    const cleanCid = cid.replace('ipfs://', '');
    
    return `${IPFS_GATEWAY}${cleanCid}`;
  }

  /**
   * Busca um arquivo do IPFS
   * @param {string} cid - CID do arquivo no IPFS
   * @returns {Promise<Blob>} - Dados do arquivo
   */
  async getFile(cid) {
    if (!cid) {
      throw new Error('CID não fornecido');
    }
    
    try {
      // Remover prefixo ipfs:// se existir
      const cleanCid = cid.replace('ipfs://', '');
      
      // Buscar pelo gateway público
      const response = await fetch(`${IPFS_GATEWAY}${cleanCid}`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar arquivo: ${response.status} ${response.statusText}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Erro ao buscar arquivo do IPFS:', error);
      throw error;
    }
  }
}

// Instância singleton do cliente IPFS
const ipfsClient = new IPFSClient();

export default ipfsClient;