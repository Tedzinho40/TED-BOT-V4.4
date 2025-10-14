// ============================================
// 🔇 MUTE MANAGER - Gerenciador de Mutes
// ============================================
const fs = require('fs');
const path = require('path');

class MuteManager {
  constructor() {
    this.muteFile = path.join(__dirname, 'mutedUsers.json');
    this.mutedUsers = this.loadMutedUsers();

    // Executa limpeza automática a cada 24 horas
    setInterval(() => {
      try {
        this.cleanOldData();
      } catch (err) {
        console.error('[MUTE] Erro ao limpar dados antigos:', err);
      }
    }, 24 * 60 * 60 * 1000); // 24h
  }

  // =========================================================
  // 📂 Carrega dados do arquivo JSON (ou cria se não existir)
  // =========================================================
  loadMutedUsers() {
    try {
      if (!fs.existsSync(this.muteFile)) {
        fs.writeFileSync(this.muteFile, JSON.stringify({}, null, 2));
      }
      const data = fs.readFileSync(this.muteFile, 'utf8');
      return JSON.parse(data || '{}');
    } catch (error) {
      console.error('[MUTE] Erro ao carregar mutedUsers:', error);
      return {};
    }
  }

  // =========================================================
  // 💾 Salva alterações no JSON de forma segura
  // =========================================================
  saveMutedUsers() {
    try {
      const tempFile = this.muteFile + '.tmp';
      fs.writeFileSync(tempFile, JSON.stringify(this.mutedUsers, null, 2));
      fs.renameSync(tempFile, this.muteFile);
      return true;
    } catch (error) {
      console.error('[MUTE] Erro ao salvar mutedUsers:', error);
      return false;
    }
  }

  // =========================================================
  // 🔇 Mutar usuário em um grupo
  // =========================================================
  muteUser(groupId, userId, mutedBy) {
    if (!this.mutedUsers[groupId]) {
      this.mutedUsers[groupId] = {};
    }

    this.mutedUsers[groupId][userId] = {
      mutedBy,
      mutedAt: new Date().toISOString(),
      mutedAtTimestamp: Date.now()
    };

    console.log(`[MUTE] Usuário ${userId} mutado em ${groupId} por ${mutedBy}`);
    return this.saveMutedUsers();
  }

  // =========================================================
  // 🔊 Desmutar usuário
  // =========================================================
  unmuteUser(groupId, userId) {
    if (this.mutedUsers[groupId] && this.mutedUsers[groupId][userId]) {
      delete this.mutedUsers[groupId][userId];

      // Remove o grupo se ficar vazio
      if (Object.keys(this.mutedUsers[groupId]).length === 0) {
        delete this.mutedUsers[groupId];
      }

      console.log(`[MUTE] Usuário ${userId} desmutado em ${groupId}`);
      return this.saveMutedUsers();
    }
    return false;
  }

  // =========================================================
  // 🔍 Verifica se o usuário está mutado
  // =========================================================
  isUserMuted(groupId, userId) {
    return !!(this.mutedUsers[groupId] && this.mutedUsers[groupId][userId]);
  }

  // ✅ Alias para compatibilidade (isMuted → isUserMuted)
  isMuted(groupId, userId) {
    return this.isUserMuted(groupId, userId);
  }

  // =========================================================
  // 📋 Lista todos os usuários mutados de um grupo
  // =========================================================
  getMutedUsers(groupId) {
    return this.mutedUsers[groupId] || {};
  }

  // =========================================================
  // 🧹 Remove mutes com mais de 30 dias
  // =========================================================
  cleanOldData() {
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    let cleaned = 0;

    for (const groupId in this.mutedUsers) {
      for (const userId in this.mutedUsers[groupId]) {
        const data = this.mutedUsers[groupId][userId];
        if (now - data.mutedAtTimestamp > thirtyDays) {
          delete this.mutedUsers[groupId][userId];
          cleaned++;
        }
      }

      if (Object.keys(this.mutedUsers[groupId]).length === 0) {
        delete this.mutedUsers[groupId];
      }
    }

    if (cleaned > 0) {
      console.log(`[MUTE] ${cleaned} registros antigos removidos.`);
      this.saveMutedUsers();
    }
  }

  // =========================================================
  // 🗂️ Retorna todos os grupos que têm usuários mutados
  // =========================================================
  getAllMutedGroups() {
    return Object.keys(this.mutedUsers);
  }
}

// =========================================================
// 🧩 Exporta instância única (singleton)
// =========================================================
module.exports = new MuteManager();