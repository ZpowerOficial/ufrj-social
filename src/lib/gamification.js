/**
 * UFRJ Social - Sistema de Gamificação
 * 
 * Este módulo implementa o sistema de gamificação da UFRJ Social, incluindo:
 * - Sistema de níveis e experiência
 * - Sistema de conquistas/badges
 * - Sistema de reputação em comunidades
 * - Sistema de desafios e recompensas
 */

// Constantes para o sistema de gamificação
const XP_PER_LEVEL = 1000; // XP necessário para cada nível
const MAX_LEVEL = 100; // Nível máximo que um usuário pode atingir

// Estrutura de pontos por atividade
const ACTIVITY_POINTS = {
  CREATE_POST: 10,
  COMMENT: 5,
  RECEIVE_LIKE: 2,
  GIVE_LIKE: 1,
  POST_LIKED: 3,
  COMMENT_LIKED: 2,
  POST_SHARED: 5,
  JOIN_COMMUNITY: 3,
  DAILY_LOGIN: 5,
  COMPLETE_PROFILE: 20,
  VERIFY_EMAIL: 50
};

// Lista de badges/conquistas disponíveis
const BADGES = [
  {
    id: 'welcome',
    name: 'Bem-vindo à UFRJ',
    description: 'Completou o cadastro e perfil na UFRJ Social',
    icon: 'handshake',
    category: 'geral',
    xpReward: 50
  },
  {
    id: 'first_post',
    name: 'Primeiro Post',
    description: 'Criou seu primeiro post na plataforma',
    icon: 'edit',
    category: 'engajamento',
    xpReward: 50
  },
  {
    id: 'first_comment',
    name: 'Primeiros Comentários',
    description: 'Fez 5 comentários na plataforma',
    icon: 'message-circle',
    category: 'engajamento',
    xpReward: 50,
    requirement: 5
  },
  {
    id: 'community_leader',
    name: 'Líder Comunitário',
    description: 'Criou uma comunidade que alcançou 50 membros',
    icon: 'users',
    category: 'comunidade',
    xpReward: 200,
    requirement: 50
  },
  {
    id: 'helper',
    name: 'Colaborador',
    description: 'Respondeu 10 perguntas marcadas como úteis',
    icon: 'help-circle',
    category: 'acadêmico',
    xpReward: 100,
    requirement: 10
  },
  {
    id: 'verified',
    name: 'Verificado',
    description: 'Confirmou e-mail com domínio ufrj.br',
    icon: 'check-circle',
    category: 'identidade',
    xpReward: 100
  },
  {
    id: 'popular_post',
    name: 'Post Popular',
    description: 'Teve um post com mais de 50 curtidas',
    icon: 'award',
    category: 'engajamento',
    xpReward: 150,
    requirement: 50
  },
  {
    id: 'contributor',
    name: 'Contribuidor Frequente',
    description: 'Publicou pelo menos 30 posts',
    icon: 'edit-3',
    category: 'engajamento',
    xpReward: 200,
    requirement: 30
  },
  {
    id: 'community_active',
    name: 'Ativo na Comunidade',
    description: 'Participou de pelo menos 10 comunidades diferentes',
    icon: 'users',
    category: 'comunidade',
    xpReward: 150,
    requirement: 10
  },
  {
    id: 'academic_support',
    name: 'Suporte Acadêmico',
    description: 'Compartilhou pelo menos 5 materiais de estudo',
    icon: 'book',
    category: 'acadêmico',
    xpReward: 100,
    requirement: 5
  },
  {
    id: 'consecutive_login',
    name: 'Login Consecutivo',
    description: 'Acessou a plataforma por 7 dias consecutivos',
    icon: 'calendar',
    category: 'geral',
    xpReward: 70,
    requirement: 7
  }
];

// Desafios disponíveis
const CHALLENGES = [
  {
    id: 'weekly_posts',
    name: 'Poster da Semana',
    description: 'Faça 5 posts esta semana',
    category: 'engajamento',
    duration: '7d',
    goal: 5,
    action: 'CREATE_POST',
    xpReward: 100
  },
  {
    id: 'daily_comments',
    name: 'Comentarista do Dia',
    description: 'Faça 3 comentários hoje',
    category: 'engajamento',
    duration: '1d',
    goal: 3,
    action: 'COMMENT',
    xpReward: 50
  },
  {
    id: 'community_explorer',
    name: 'Explorador de Comunidades',
    description: 'Participe de 3 novas comunidades esta semana',
    category: 'comunidade',
    duration: '7d',
    goal: 3,
    action: 'JOIN_COMMUNITY',
    xpReward: 75
  },
  {
    id: 'helpful_answers',
    name: 'Respostas Úteis',
    description: 'Tenha 5 respostas marcadas como úteis este mês',
    category: 'acadêmico',
    duration: '30d',
    goal: 5,
    action: 'ANSWER_MARKED_USEFUL',
    xpReward: 150
  }
];

/**
 * Classe para gerenciar o sistema de gamificação
 */
class GamificationSystem {
  constructor() {
    this.badges = BADGES;
    this.challenges = CHALLENGES;
    this.initialized = false;
    this.storage = localStorage;
  }

  /**
   * Inicializa o sistema de gamificação
   * @param {string} userId - ID do usuário
   * @returns {Object} - Dados de gamificação do usuário
   */
  init(userId) {
    if (!userId) {
      console.error('ID de usuário necessário para inicializar o sistema de gamificação');
      return null;
    }

    try {
      this.userId = userId;
      
      // Carregar dados de gamificação do usuário
      const userData = this._loadUserData();
      
      // Se não existir, criar dados iniciais
      if (!userData) {
        const initialData = {
          userId,
          xp: 0,
          level: 1,
          totalPoints: 0,
          badges: [],
          activeChallenges: [],
          completedChallenges: [],
          communities: {},
          stats: {
            posts: 0,
            comments: 0,
            likes_given: 0,
            likes_received: 0,
            communities_joined: 0,
            consecutive_days: 0,
            last_login: Date.now()
          },
          updatedAt: Date.now()
        };
        
        this._saveUserData(initialData);
        this.userData = initialData;
      } else {
        this.userData = userData;
        
        // Verificar login diário
        this._checkDailyLogin();
      }
      
      // Verificar desafios expirados
      this._cleanupExpiredChallenges();
      
      this.initialized = true;
      return this.userData;
    } catch (error) {
      console.error('Erro ao inicializar sistema de gamificação:', error);
      return null;
    }
  }

  /**
   * Carrega os dados de gamificação do usuário
   * @private
   * @returns {Object|null} - Dados do usuário ou null se não existir
   */
  _loadUserData() {
    try {
      const key = `ufrj_social_gamification_${this.userId}`;
      const data = this.storage.getItem(key);
      
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error);
      return null;
    }
  }

  /**
   * Salva os dados de gamificação do usuário
   * @private
   * @param {Object} data - Dados a serem salvos
   */
  _saveUserData(data) {
    try {
      const key = `ufrj_social_gamification_${this.userId}`;
      data.updatedAt = Date.now();
      this.storage.setItem(key, JSON.stringify(data));
      this.userData = data;
    } catch (error) {
      console.error('Erro ao salvar dados de gamificação:', error);
    }
  }

  /**
   * Verifica se é um novo dia desde o último login
   * @private
   */
  _checkDailyLogin() {
    const lastLogin = new Date(this.userData.stats.last_login);
    const today = new Date();
    
    // Verificar se é um novo dia (ignorando horas/minutos/segundos)
    const isNewDay = 
      lastLogin.getFullYear() !== today.getFullYear() ||
      lastLogin.getMonth() !== today.getMonth() ||
      lastLogin.getDate() !== today.getDate();
    
    if (isNewDay) {
      // Verificar se é um dia consecutivo (diferença de apenas 1 dia)
      const lastLoginDay = new Date(lastLogin);
      lastLoginDay.setHours(0, 0, 0, 0);
      
      const todayStartDay = new Date(today);
      todayStartDay.setHours(0, 0, 0, 0);
      
      const differenceInDays = Math.round((todayStartDay - lastLoginDay) / (1000 * 60 * 60 * 24));
      
      if (differenceInDays === 1) {
        // Dia consecutivo
        this.userData.stats.consecutive_days += 1;
        
        // Verificar conquista de login consecutivo
        this._checkBadgeProgress('consecutive_login', this.userData.stats.consecutive_days);
      } else {
        // Quebrou a sequência
        this.userData.stats.consecutive_days = 1;
      }
      
      // Adicionar pontos de login diário
      this.addPoints(ACTIVITY_POINTS.DAILY_LOGIN, 'DAILY_LOGIN');
      
      // Atualizar data do último login
      this.userData.stats.last_login = Date.now();
      
      this._saveUserData(this.userData);
    }
  }

  /**
   * Remove desafios expirados
   * @private
   */
  _cleanupExpiredChallenges() {
    if (!this.userData.activeChallenges) return;
    
    const now = Date.now();
    const activeChallenges = this.userData.activeChallenges.filter(challenge => {
      return challenge.expiresAt > now;
    });
    
    if (activeChallenges.length !== this.userData.activeChallenges.length) {
      this.userData.activeChallenges = activeChallenges;
      this._saveUserData(this.userData);
    }
  }

  /**
   * Adiciona pontos de experiência ao usuário
   * @param {number} points - Quantidade de pontos a adicionar
   * @param {string} activity - Tipo de atividade que gerou os pontos
   * @param {string} [communityId] - ID da comunidade (opcional)
   * @returns {Object} - Resultado da adição de pontos, incluindo level up se ocorrer
   */
  addPoints(points, activity, communityId = null) {
    if (!this.initialized || !this.userData) {
      console.error('Sistema de gamificação não inicializado');
      return null;
    }
    
    try {
      const oldLevel = this.userData.level;
      const oldXp = this.userData.xp;
      
      // Adicionar pontos
      this.userData.xp += points;
      this.userData.totalPoints += points;
      
      // Atualizar estatísticas
      this._updateStats(activity);
      
      // Verificar progresso em desafios ativos
      this._updateChallengesProgress(activity);
      
      // Se tiver comunidade, adicionar pontos na comunidade
      if (communityId) {
        if (!this.userData.communities[communityId]) {
          this.userData.communities[communityId] = {
            points: 0,
            level: 1,
            reputation: 0
          };
        }
        
        this.userData.communities[communityId].points += points;
        
        // Calcular novo nível de reputação na comunidade
        const newCommunityLevel = Math.floor(this.userData.communities[communityId].points / 100) + 1;
        if (newCommunityLevel > this.userData.communities[communityId].level) {
          this.userData.communities[communityId].level = newCommunityLevel;
        }
      }
      
      // Calcular novo nível
      const newLevel = Math.min(
        Math.floor(this.userData.xp / XP_PER_LEVEL) + 1,
        MAX_LEVEL
      );
      
      const leveledUp = newLevel > oldLevel;
      if (leveledUp) {
        this.userData.level = newLevel;
      }
      
      // Salvar alterações
      this._saveUserData(this.userData);
      
      return {
        userId: this.userId,
        oldXp,
        newXp: this.userData.xp,
        pointsAdded: points,
        oldLevel,
        newLevel,
        leveledUp,
        activity
      };
    } catch (error) {
      console.error('Erro ao adicionar pontos:', error);
      return null;
    }
  }

  /**
   * Atualiza estatísticas do usuário com base na atividade
   * @private
   * @param {string} activity - Tipo de atividade
   */
  _updateStats(activity) {
    switch (activity) {
      case 'CREATE_POST':
        this.userData.stats.posts += 1;
        // Verificar conquista de primeiro post
        if (this.userData.stats.posts === 1) {
          this.awardBadge('first_post');
        }
        // Verificar conquista de contribuidor frequente
        this._checkBadgeProgress('contributor', this.userData.stats.posts);
        break;
        
      case 'COMMENT':
        this.userData.stats.comments += 1;
        // Verificar conquista de primeiros comentários
        this._checkBadgeProgress('first_comment', this.userData.stats.comments);
        break;
        
      case 'GIVE_LIKE':
        this.userData.stats.likes_given += 1;
        break;
        
      case 'RECEIVE_LIKE':
        this.userData.stats.likes_received += 1;
        break;
        
      case 'JOIN_COMMUNITY':
        this.userData.stats.communities_joined += 1;
        // Verificar conquista de comunidades
        this._checkBadgeProgress('community_active', this.userData.stats.communities_joined);
        break;
    }
  }

  /**
   * Atualiza o progresso em desafios ativos
   * @private
   * @param {string} activity - Tipo de atividade
   */
  _updateChallengesProgress(activity) {
    if (!this.userData.activeChallenges) return;
    
    const updatedChallenges = this.userData.activeChallenges.map(challenge => {
      if (challenge.action === activity) {
        challenge.progress += 1;
        
        // Verificar se o desafio foi completado
        if (challenge.progress >= challenge.goal) {
          challenge.completed = true;
          
          // Adicionar XP como recompensa
          this.userData.xp += challenge.xpReward;
          
          // Mover para desafios completados
          if (!this.userData.completedChallenges) {
            this.userData.completedChallenges = [];
          }
          
          this.userData.completedChallenges.push({
            ...challenge,
            completedAt: Date.now()
          });
        }
      }
      return challenge;
    });
    
    // Filtrar desafios completados
    this.userData.activeChallenges = updatedChallenges.filter(c => !c.completed);
  }

  /**
   * Verifica o progresso de uma conquista específica
   * @private
   * @param {string} badgeId - ID da conquista
   * @param {number} progress - Progresso atual
   */
  _checkBadgeProgress(badgeId, progress) {
    const badge = this.badges.find(b => b.id === badgeId);
    
    if (!badge) return;
    
    // Verificar se o usuário já tem esta conquista
    if (this.userData.badges.some(b => b.id === badgeId)) return;
    
    // Verificar se o progresso atingiu o requisito
    if (badge.requirement && progress >= badge.requirement) {
      this.awardBadge(badgeId);
    }
  }

  /**
   * Concede uma conquista ao usuário
   * @param {string} badgeId - ID da conquista
   * @returns {Object|null} - Detalhes da conquista concedida ou null em caso de erro
   */
  awardBadge(badgeId) {
    if (!this.initialized || !this.userData) {
      console.error('Sistema de gamificação não inicializado');
      return null;
    }
    
    try {
      // Verificar se a conquista existe
      const badge = this.badges.find(b => b.id === badgeId);
      if (!badge) {
        console.error(`Conquista não encontrada: ${badgeId}`);
        return null;
      }
      
      // Verificar se o usuário já tem esta conquista
      if (this.userData.badges.some(b => b.id === badgeId)) {
        console.log(`Usuário já possui a conquista: ${badgeId}`);
        return null;
      }
      
      // Adicionar a conquista
      const badgeWithTimestamp = {
        ...badge,
        awardedAt: Date.now()
      };
      
      this.userData.badges.push(badgeWithTimestamp);
      
      // Adicionar XP de recompensa
      if (badge.xpReward) {
        this.userData.xp += badge.xpReward;
      }
      
      // Salvar alterações
      this._saveUserData(this.userData);
      
      return badgeWithTimestamp;
    } catch (error) {
      console.error('Erro ao conceder conquista:', error);
      return null;
    }
  }

  /**
   * Aceita um desafio
   * @param {string} challengeId - ID do desafio
   * @returns {Object|null} - Detalhes do desafio aceito ou null em caso de erro
   */
  acceptChallenge(challengeId) {
    if (!this.initialized || !this.userData) {
      console.error('Sistema de gamificação não inicializado');
      return null;
    }
    
    try {
      // Verificar se o desafio existe
      const challenge = this.challenges.find(c => c.id === challengeId);
      if (!challenge) {
        console.error(`Desafio não encontrado: ${challengeId}`);
        return null;
      }
      
      // Verificar se o usuário já tem este desafio ativo
      if (this.userData.activeChallenges && 
          this.userData.activeChallenges.some(c => c.id === challengeId)) {
        console.log(`Usuário já aceitou o desafio: ${challengeId}`);
        return null;
      }
      
      // Calcular data de expiração
      let expiresAt;
      if (challenge.duration.endsWith('d')) {
        const days = parseInt(challenge.duration);
        expiresAt = Date.now() + (days * 24 * 60 * 60 * 1000);
      } else if (challenge.duration.endsWith('h')) {
        const hours = parseInt(challenge.duration);
        expiresAt = Date.now() + (hours * 60 * 60 * 1000);
      } else {
        // Padrão: 7 dias
        expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
      }
      
      // Adicionar o desafio
      const activeChallenge = {
        ...challenge,
        progress: 0,
        acceptedAt: Date.now(),
        expiresAt
      };
      
      if (!this.userData.activeChallenges) {
        this.userData.activeChallenges = [];
      }
      
      this.userData.activeChallenges.push(activeChallenge);
      
      // Salvar alterações
      this._saveUserData(this.userData);
      
      return activeChallenge;
    } catch (error) {
      console.error('Erro ao aceitar desafio:', error);
      return null;
    }
  }

  /**
   * Obtém o nível de reputação do usuário em uma comunidade
   * @param {string} communityId - ID da comunidade
   * @returns {Object} - Informações de reputação na comunidade
   */
  getCommunityReputation(communityId) {
    if (!this.initialized || !this.userData) {
      console.error('Sistema de gamificação não inicializado');
      return null;
    }
    
    if (!communityId) {
      console.error('ID da comunidade não fornecido');
      return null;
    }
    
    if (!this.userData.communities[communityId]) {
      return {
        communityId,
        points: 0,
        level: 1,
        reputation: 'Novato'
      };
    }
    
    const communityData = this.userData.communities[communityId];
    let reputation = 'Novato';
    
    // Determinar título de reputação com base no nível
    if (communityData.level >= 10) {
      reputation = 'Lenda';
    } else if (communityData.level >= 8) {
      reputation = 'Expert';
    } else if (communityData.level >= 6) {
      reputation = 'Mentor';
    } else if (communityData.level >= 4) {
      reputation = 'Contribuidor';
    } else if (communityData.level >= 2) {
      reputation = 'Participante';
    }
    
    return {
      communityId,
      ...communityData,
      reputation
    };
  }

  /**
   * Obtém todas as estatísticas e dados de gamificação do usuário
   * @returns {Object} - Dados completos de gamificação
   */
  getUserStats() {
    if (!this.initialized || !this.userData) {
      console.error('Sistema de gamificação não inicializado');
      return null;
    }
    
    // Calcular XP para o próximo nível
    const currentLevelXP = (this.userData.level - 1) * XP_PER_LEVEL;
    const nextLevelXP = this.userData.level * XP_PER_LEVEL;
    const xpForNextLevel = nextLevelXP - currentLevelXP;
    const currentLevelProgress = this.userData.xp - currentLevelXP;
    const progressPercentage = (currentLevelProgress / xpForNextLevel) * 100;
    
    return {
      ...this.userData,
      nextLevelXP,
      currentLevelProgress,
      xpForNextLevel,
      progressPercentage: Math.min(progressPercentage, 100),
      availableChallenges: this._getAvailableChallenges()
    };
  }

  /**
   * Obtém os desafios disponíveis que o usuário pode aceitar
   * @private
   * @returns {Array} - Lista de desafios disponíveis
   */
  _getAvailableChallenges() {
    const activeIds = this.userData.activeChallenges?.map(c => c.id) || [];
    const completedIds = this.userData.completedChallenges?.map(c => c.id) || [];
    
    // Filtrar desafios que não estão ativos ou completados recentemente
    return this.challenges.filter(challenge => {
      // Verificar se não está ativo
      if (activeIds.includes(challenge.id)) {
        return false;
      }
      
      // Verificar se não foi completado recentemente (últimos 3 dias)
      const recentlyCompleted = this.userData.completedChallenges?.find(c => {
        return c.id === challenge.id && 
               (Date.now() - c.completedAt) < (3 * 24 * 60 * 60 * 1000);
      });
      
      return !recentlyCompleted;
    });
  }

  /**
   * Limpa todos os dados de gamificação de um usuário
   * @returns {boolean} - Resultado da operação
   */
  clearUserData() {
    try {
      const key = `ufrj_social_gamification_${this.userId}`;
      this.storage.removeItem(key);
      this.userData = null;
      this.initialized = false;
      return true;
    } catch (error) {
      console.error('Erro ao limpar dados de gamificação:', error);
      return false;
    }
  }
}

// Exportar instância singleton
const gamification = new GamificationSystem();
export default gamification;