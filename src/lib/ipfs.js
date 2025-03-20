/**
 * UFRJ Social - Módulo de Armazenamento
 * 
 * Este módulo implementa o armazenamento de arquivos utilizando Supabase Storage,
 * mantendo uma interface compatível com a implementação IPFS anterior.
 */

import storageService from './storage';

// Gateway para compatibilidade legada
const GATEWAY_URL = 'https://ufrjsocial.com/files/';

/**
 * Classe para gerenciar operações de armazenamento
 */
class IPFSClient {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.uploadQueue = [];
    this.processingQueue = false;
  }

  /**
   * Inicializa o cliente de armazenamento
   * @returns {Promise<boolean>} - Status da inicialização
   */
  async init() {
    try {
      console.log('Inicializando cliente de armazenamento...');
      
      // Inicializar o serviço de armazenamento Supabase
      const success = await storageService.init();
      
      if (success) {
        this.isInitialized = true;
        console.log('Cliente de armazenamento inicializado com sucesso!');
        
        // Processar fila de uploads pendentes, se houver
        if (this.uploadQueue.length > 0) {
          this._processQueue();
        }
      }
      
      return success;
    } catch (error) {
      console.error('Erro ao inicializar cliente de armazenamento:', error);
      return false;
    }
  }

  /**
   * Adiciona um arquivo ao armazenamento
   * @param {File|Blob} file - Arquivo a ser enviado
   * @param {Object} metadata - Metadados do arquivo
   * @returns {Promise<Object>} - Informações do arquivo no armazenamento
   */
  async addFile(file, metadata = {}) {
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
    
    // Delegar para o serviço de armazenamento
    return await storageService.addFile(file, metadata);
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
          const result = await storageService.addFile(file, metadata);
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
   * Obtém o URL para um arquivo no armazenamento
   * @param {string} cid - Identificador do arquivo
   * @returns {string} - URL para o arquivo
   */
  getFileUrl(cid) {
    return storageService.getFileUrl(cid);
  }

  /**
   * Busca um arquivo do armazenamento
   * @param {string} cid - Identificador do arquivo
   * @returns {Promise<Blob>} - Dados do arquivo
   */
  async getFile(cid) {
    return await storageService.getFile(cid);
  }
}

// Instância singleton
const ipfsClient = new IPFSClient();

export default ipfsClient;