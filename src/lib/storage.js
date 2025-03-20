import { supabase } from './supabase';

class StorageService {
  constructor() {
    this.bucketName = 'media-uploads';
    this.isInitialized = false;
  }

  /**
   * Inicializa o serviço de armazenamento
   * @returns {Promise<boolean>} - Status da inicialização
   */
  async init() {
    try {
      console.log('Inicializando serviço de armazenamento...');
      
      // Verifica se o bucket existe, se não, tenta criar
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets.some(bucket => bucket.name === this.bucketName);
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket(this.bucketName, {
          public: true,
          fileSizeLimit: 50 * 1024 * 1024 // 50MB
        });
        
        if (error) {
          console.warn('Erro ao criar bucket:', error);
          // Continuar mesmo sem criar o bucket - pode existir com outro nome
        }
      }
      
      this.isInitialized = true;
      console.log('Serviço de armazenamento inicializado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar serviço de armazenamento:', error);
      return false;
    }
  }

  /**
   * Adiciona um arquivo ao armazenamento
   * @param {File|Blob} file - Arquivo a ser enviado
   * @param {Object} metadata - Metadados do arquivo
   * @returns {Promise<Object>} - Informações do arquivo armazenado
   */
  async addFile(file, metadata = {}) {
    if (!this.isInitialized) {
      await this.init();
    }

    // Validar o arquivo
    if (!file) {
      throw new Error('Arquivo não fornecido');
    }
    
    try {
      // Criar nome de arquivo único
      const fileExt = file.name?.split('.').pop() || 'file';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Definir caminho com base nos metadados
      let path = 'uploads';
      if (metadata.type) {
        path = metadata.type;
      }
      if (metadata.communityId) {
        path = `${path}/${metadata.communityId}`;
      }
      
      const filePath = `${path}/${fileName}`;
      
      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase
        .storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
          metadata: {
            ...metadata,
            originalName: file.name,
            size: file.size,
            source: 'ufrj-social'
          }
        });
      
      if (error) throw error;
      
      // Obter URL público
      const { data: urlData } = supabase
        .storage
        .from(this.bucketName)
        .getPublicUrl(filePath);
      
      // Retornar informações no formato compatível com o IPFS
      return {
        cid: filePath, // Usar caminho como identificador
        url: urlData.publicUrl,
        path: filePath,
        metadata: {
          name: file.name,
          type: file.type,
          size: file.size,
          ...metadata,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      console.error('Erro ao adicionar arquivo ao armazenamento:', error);
      throw error;
    }
  }

  /**
   * Obtém o URL para um arquivo
   * @param {string} cid - Identificador do arquivo (caminho)
   * @returns {string} - URL para o arquivo
   */
  getFileUrl(cid) {
    if (!cid) return null;
    
    // Se for uma URL completa, retornar como está
    if (cid.startsWith('http')) return cid;
    
    // Se for um CID IPFS, converter para um caminho válido
    const cleanCid = cid.replace('ipfs://', '');
    
    const { data } = supabase
      .storage
      .from(this.bucketName)
      .getPublicUrl(cleanCid);
    
    return data.publicUrl;
  }

  /**
   * Busca um arquivo do armazenamento
   * @param {string} cid - Identificador do arquivo (caminho)
   * @returns {Promise<Blob>} - Dados do arquivo
   */
  async getFile(cid) {
    if (!cid) {
      throw new Error('Identificador não fornecido');
    }
    
    try {
      // Se for uma URL, buscar via fetch
      if (cid.startsWith('http')) {
        const response = await fetch(cid);
        if (!response.ok) {
          throw new Error(`Erro ao buscar arquivo: ${response.status}`);
        }
        return await response.blob();
      }
      
      // Caso contrário, buscar via Supabase
      const { data, error } = await supabase
        .storage
        .from(this.bucketName)
        .download(cid);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar arquivo:', error);
      throw error;
    }
  }

  /**
   * Remove um arquivo do armazenamento
   * @param {string} cid - Identificador do arquivo (caminho)
   * @returns {Promise<boolean>} - Status da operação
   */
  async deleteFile(cid) {
    if (!cid || cid.startsWith('http')) {
      return false; // Não podemos excluir URLs externas
    }
    
    try {
      const { error } = await supabase
        .storage
        .from(this.bucketName)
        .remove([cid]);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      return false;
    }
  }
}

// Instância singleton
const storageService = new StorageService();
export default storageService;