/**
 * UFRJ Social - Sistema de Segurança
 * 
 * Este módulo implementa funções de segurança para a UFRJ Social,
 * focando principalmente na proteção de chaves criptográficas, 
 * criptografia de conteúdo sensível e verificação de identidade.
 */

import { nip19, getPublicKey, verifySignature } from 'nostr-tools';
import CryptoJS from 'crypto-js';

/**
 * Chave de encriptação usando uma chave derivada da senha do usuário
 * @type {string|null}
 */
let encryptionKey = null;

/**
 * Classe para gerenciar a segurança da aplicação
 */
class SecurityManager {
  constructor() {
    this.isInitialized = false;
    this.secureStorage = window.localStorage;
    this.trustLevel = 0; // 0-100, onde 100 é máxima confiança
  }

  /**
   * Inicializa o gerenciador de segurança
   * @param {string} password - Senha do usuário para derivar chave de encriptação
   * @returns {boolean} - Status da inicialização
   */
  init(password) {
    try {
      if (!password) {
        console.error('Senha necessária para inicializar o sistema de segurança');
        return false;
      }
      
      // Derivar chave de encriptação da senha
      encryptionKey = CryptoJS.PBKDF2(password, 'UFRJ_SOCIAL_SALT', {
        keySize: 256 / 32,
        iterations: 1000
      }).toString();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Erro ao inicializar sistema de segurança:', error);
      return false;
    }
  }

  /**
   * Verifica se o sistema está inicializado
   * @private
   */
  _checkInitialized() {
    if (!this.isInitialized || !encryptionKey) {
      throw new Error('Sistema de segurança não inicializado');
    }
  }

  /**
   * Criptografa a chave privada Nostr para armazenamento seguro
   * @param {string} privateKey - Chave privada Nostr
   * @returns {string} - Chave privada criptografada
   */
  encryptPrivateKey(privateKey) {
    this._checkInitialized();
    
    try {
      const encrypted = CryptoJS.AES.encrypt(privateKey, encryptionKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Erro ao criptografar chave privada:', error);
      throw error;
    }
  }

  /**
   * Descriptografa a chave privada Nostr armazenada
   * @param {string} encryptedPrivateKey - Chave privada criptografada
   * @returns {string} - Chave privada descriptografada
   */
  decryptPrivateKey(encryptedPrivateKey) {
    this._checkInitialized();
    
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedPrivateKey, encryptionKey).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar chave privada:', error);
      throw error;
    }
  }

  /**
   * Armazena a chave privada Nostr de forma segura
   * @param {string} privateKey - Chave privada Nostr
   * @returns {boolean} - Status da operação
   */
  savePrivateKey(privateKey) {
    try {
      // Verificar se é uma chave válida
      const publicKey = getPublicKey(privateKey);
      if (!publicKey) {
        throw new Error('Chave privada inválida');
      }
      
      // Criptografar a chave
      const encryptedKey = this.encryptPrivateKey(privateKey);
      
      // Armazenar a chave criptografada
      this.secureStorage.setItem('ufrj_social_key', encryptedKey);
      
      // Armazenar também o npub (versão codificada da chave pública)
      const npub = nip19.npubEncode(publicKey);
      this.secureStorage.setItem('ufrj_social_npub', npub);
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar chave privada:', error);
      return false;
    }
  }

  /**
   * Recupera a chave privada Nostr armazenada
   * @returns {string|null} - Chave privada ou null se não existir
   */
  getPrivateKey() {
    this._checkInitialized();
    
    try {
      const encryptedKey = this.secureStorage.getItem('ufrj_social_key');
      if (!encryptedKey) return null;
      
      return this.decryptPrivateKey(encryptedKey);
    } catch (error) {
      console.error('Erro ao recuperar chave privada:', error);
      return null;
    }
  }

  /**
   * Verifica se o usuário tem uma chave privada armazenada
   * @returns {boolean} - True se o usuário tem uma chave
   */
  hasPrivateKey() {
    return !!this.secureStorage.getItem('ufrj_social_key');
  }

  /**
   * Recupera a chave pública Nostr
   * @returns {string|null} - Chave pública codificada (npub) ou null
   */
  getPublicKey() {
    return this.secureStorage.getItem('ufrj_social_npub');
  }

  /**
   * Remove as chaves armazenadas
   * @returns {boolean} - Status da operação
   */
  clearKeys() {
    try {
      this.secureStorage.removeItem('ufrj_social_key');
      this.secureStorage.removeItem('ufrj_social_npub');
      return true;
    } catch (error) {
      console.error('Erro ao remover chaves:', error);
      return false;
    }
  }

  /**
   * Criptografa uma mensagem para um destinatário específico
   * @param {string} message - Mensagem a ser criptografada
   * @param {string} recipientPubkey - Chave pública do destinatário
   * @returns {string} - Mensagem criptografada
   */
  encryptMessage(message, recipientPubkey) {
    this._checkInitialized();
    
    try {
      // Em uma implementação real, usaríamos criptografia de curva elíptica
      // Por simplicidade, aqui usamos AES com um segredo compartilhado derivado
      const sharedSecret = CryptoJS.SHA256(encryptionKey + recipientPubkey).toString();
      
      const encrypted = CryptoJS.AES.encrypt(message, sharedSecret).toString();
      return encrypted;
    } catch (error) {
      console.error('Erro ao criptografar mensagem:', error);
      throw error;
    }
  }

  /**
   * Descriptografa uma mensagem recebida
   * @param {string} encryptedMessage - Mensagem criptografada
   * @param {string} senderPubkey - Chave pública do remetente
   * @returns {string} - Mensagem descriptografada
   */
  decryptMessage(encryptedMessage, senderPubkey) {
    this._checkInitialized();
    
    try {
      // Usar o mesmo segredo compartilhado para descriptografar
      const sharedSecret = CryptoJS.SHA256(encryptionKey + senderPubkey).toString();
      
      const decrypted = CryptoJS.AES.decrypt(encryptedMessage, sharedSecret).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar mensagem:', error);
      throw error;
    }
  }

  /**
   * Verifica a assinatura de um evento Nostr
   * @param {Object} event - Evento Nostr
   * @returns {boolean} - True se a assinatura for válida
   */
  verifyEventSignature(event) {
    try {
      return verifySignature(event);
    } catch (error) {
      console.error('Erro ao verificar assinatura:', error);
      return false;
    }
  }

  /**
   * Verifica se uma chave pública pertence a um domínio específico (NIP-05)
   * @param {string} pubkey - Chave pública a verificar
   * @param {string} domain - Domínio a verificar (ex: ufrj.br)
   * @returns {Promise<boolean>} - True se a verificação for bem-sucedida
   */
  async verifyIdentity(pubkey, domain) {
    try {
      // Remover prefixo npub se existir
      let cleanPubkey = pubkey;
      if (pubkey.startsWith('npub')) {
        cleanPubkey = nip19.decode(pubkey).data;
      }
      
      // Implementação básica de verificação NIP-05
      // Em um cenário real, isso seria mais completo
      const url = `https://${domain}/.well-known/nostr.json?name=_`;
      
      const response = await fetch(url);
      if (!response.ok) return false;
      
      const data = await response.json();
      
      // Verificar se alguma das chaves no arquivo corresponde à nossa chave
      for (const [name, key] of Object.entries(data.names || {})) {
        if (key === cleanPubkey) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar identidade:', error);
      return false;
    }
  }

  /**
   * Calcula o nível de confiança de um perfil com base em diversos fatores
   * @param {Object} profile - Perfil a avaliar
   * @param {string} profile.pubkey - Chave pública
   * @param {Object} profile.metadata - Metadados do perfil
   * @param {boolean} profile.nip05Verified - Se o NIP-05 foi verificado
   * @param {number} profile.followersCount - Número de seguidores
   * @param {number} profile.postsCount - Número de posts
   * @returns {number} - Nível de confiança (0-100)
   */
  calculateTrustLevel(profile) {
    if (!profile || !profile.pubkey) return 0;
    
    let trustScore = 0;
    
    // NIP-05 verificado é um forte indicador de confiança
    if (profile.nip05Verified) {
      trustScore += 40;
      
      // Bônus adicional se o domínio for da UFRJ
      if (profile.metadata && profile.metadata.nip05 && 
          profile.metadata.nip05.includes('@ufrj.br')) {
        trustScore += 20;
      }
    }
    
    // Perfil completo indica maior confiabilidade
    if (profile.metadata) {
      if (profile.metadata.name) trustScore += 5;
      if (profile.metadata.picture) trustScore += 5;
      if (profile.metadata.about) trustScore += 5;
    }
    
    // Atividade na plataforma
    if (profile.followersCount > 5) trustScore += 5;
    if (profile.followersCount > 20) trustScore += 5;
    if (profile.postsCount > 10) trustScore += 5;
    if (profile.postsCount > 50) trustScore += 5;
    
    // Garantir que o valor final esteja entre 0-100
    return Math.min(Math.max(trustScore, 0), 100);
  }

  /**
   * Gera um resumo (hash) do conteúdo para verificação de integridade
   * @param {string} content - Conteúdo a resumir
   * @returns {string} - Hash SHA-256 do conteúdo
   */
  hashContent(content) {
    return CryptoJS.SHA256(content).toString();
  }

  /**
   * Verifica se o conteúdo corresponde ao hash esperado
   * @param {string} content - Conteúdo a verificar
   * @param {string} expectedHash - Hash esperado
   * @returns {boolean} - True se o hash for válido
   */
  verifyContentIntegrity(content, expectedHash) {
    const contentHash = this.hashContent(content);
    return contentHash === expectedHash;
  }

  /**
   * Sanitiza conteúdo para prevenir ataques XSS
   * @param {string} content - Conteúdo a sanitizar
   * @returns {string} - Conteúdo sanitizado
   */
  sanitizeContent(content) {
    if (!content) return '';
    
    // Implementação básica de sanitização
    // Em uma implementação real, usaríamos uma biblioteca robusta como DOMPurify
    return content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Verifica a força de uma senha
   * @param {string} password - Senha a verificar
   * @returns {Object} - Resultado da verificação
   */
  checkPasswordStrength(password) {
    const result = {
      score: 0, // 0-4
      isStrong: false,
      feedback: []
    };
    
    if (!password) {
      result.feedback.push('Senha não pode estar vazia');
      return result;
    }
    
    // Verificar comprimento
    if (password.length < 8) {
      result.feedback.push('Senha deve ter pelo menos 8 caracteres');
    } else {
      result.score += 1;
    }
    
    // Verificar complexidade
    if (/[a-z]/.test(password)) result.score += 0.5;
    if (/[A-Z]/.test(password)) result.score += 0.5;
    if (/[0-9]/.test(password)) result.score += 1;
    if (/[^A-Za-z0-9]/.test(password)) result.score += 1;
    
    // Arredondar pontuação
    result.score = Math.floor(result.score);
    
    // Determinar se é forte
    result.isStrong = result.score >= 3;
    
    // Adicionar feedback baseado na pontuação
    if (result.score < 3) {
      if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
        result.feedback.push('Adicione letras maiúsculas e minúsculas');
      }
      if (!/[0-9]/.test(password)) {
        result.feedback.push('Adicione números');
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        result.feedback.push('Adicione caracteres especiais');
      }
    }
    
    return result;
  }
}

// Instância singleton
const securityManager = new SecurityManager();
export default securityManager;