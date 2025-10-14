// groupManager.js - Sistema avançado de gerenciamento de dados de grupos
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class GroupManager {
  constructor() {
    this.dataPath = path.join(__dirname, 'groups');
    this.messagesPath = path.join(__dirname, 'messages');
    this.backupPath = path.join(__dirname, 'backups');
    
    // Criar diretórios se não existirem
    [this.dataPath, this.messagesPath, this.backupPath].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    this.cache = new Map();
    this.messageBuffer = new Map();
    this.saveInterval = null;
    
    // Iniciar salvamento automático a cada 5 minutos
    this.startAutoSave();
  }

  // Salvar dados completos do grupo
  async saveGroupData(sock, groupId, eventType = 'update') {
    try {
      const metadata = await sock.groupMetadata(groupId);
      const timestamp = Date.now();
      
      const groupData = {
        id: groupId,
        name: metadata.subject,
        description: metadata.desc || '',
        owner: metadata.owner,
        creation: metadata.creation,
        size: metadata.size,
        participants: metadata.participants.map(p => ({
          id: p.id,
          admin: p.admin,
          superAdmin: p.admin === 'superadmin',
          isAdmin: p.admin !== null,
          joinedAt: timestamp
        })),
        admins: metadata.participants.filter(p => p.admin !== null).map(p => p.id),
        memberCount: metadata.participants.length,
        adminCount: metadata.participants.filter(p => p.admin !== null).length,
        settings: {
          announce: metadata.announce,
          restrict: metadata.restrict,
          ephemeralDuration: metadata.ephemeralDuration
        },
        lastUpdate: timestamp,
        eventType,
        stats: {
          totalMessages: this.getMessageCount(groupId),
          lastActivity: timestamp,
          activeMembers: this.getActiveMembers(groupId)
        }
      };
      
      // Salvar no cache
      this.cache.set(groupId, groupData);
      
      // Salvar no arquivo
      const filePath = path.join(this.dataPath, `${this.sanitizeFilename(groupId)}.json`);
      fs.writeFileSync(filePath, JSON.stringify(groupData, null, 2));
      
      // Log da atividade
      console.log(chalk.hex('#DDA0DD').bold(`💾 [${new Date().toLocaleTimeString('pt-BR')}] Dados salvos`));
      console.log(chalk.hex('#DDA0DD')(`   └─ Grupo: ${metadata.subject}`));
      console.log(chalk.hex('#DDA0DD')(`   └─ Membros: ${metadata.participants.length}`));
      console.log(chalk.hex('#DDA0DD')(`   └─ Evento: ${eventType}`));
      
      return groupData;
    } catch (error) {
      console.log(chalk.red(`❌ Erro ao salvar dados do grupo: ${error.message}`));
      return null;
    }
  }

  // Salvar mensagem individual
  saveMessage(groupId, messageData) {
    const timestamp = Date.now();
    const messageEntry = {
      id: messageData.key.id,
      from: messageData.key.remoteJid,
      participant: messageData.key.participant,
      timestamp,
      type: this.getMessageType(messageData),
      content: this.extractMessageContent(messageData),
      quoted: messageData.message?.extendedTextMessage?.contextInfo?.quotedMessage ? true : false,
      mentions: messageData.message?.extendedTextMessage?.contextInfo?.mentionedJid || [],
      isFromMe: messageData.key.fromMe
    };
    
    // Adicionar ao buffer
    if (!this.messageBuffer.has(groupId)) {
      this.messageBuffer.set(groupId, []);
    }
    this.messageBuffer.get(groupId).push(messageEntry);
    
    // Se buffer ficar muito grande, salvar imediatamente
    if (this.messageBuffer.get(groupId).length >= 50) {
      this.flushMessageBuffer(groupId);
    }
  }

  // Extrair conteúdo da mensagem
  extractMessageContent(messageData) {
    const Info = messageData.message;
    
    if (Info.conversation) return Info.conversation;
    if (Info.extendedTextMessage?.text) return Info.extendedTextMessage.text;
    if (Info.imageMessage?.caption) return Info.imageMessage.caption;
    if (Info.videoMessage?.caption) return Info.videoMessage.caption;
    if (Info.documentMessage?.caption) return Info.documentMessage.caption;
    if (Info.stickerMessage) return '[Figurinha]';
    if (Info.imageMessage) return '[Imagem]';
    if (Info.videoMessage) return '[Vídeo]';
    if (Info.audioMessage) return '[Áudio]';
    if (Info.documentMessage) return '[Documento]';
    if (Info.locationMessage) return '[Localização]';
    if (Info.contactMessage) return '[Contato]';
    
    return '[Mensagem não suportada]';
  }

  // Determinar tipo da mensagem
  getMessageType(messageData) {
    const Info = messageData.message;
    
    if (Info.conversation || Info.extendedTextMessage) return 'text';
    if (Info.imageMessage) return 'image';
    if (Info.videoMessage) return 'video';
    if (Info.audioMessage) return 'audio';
    if (Info.documentMessage) return 'document';
    if (Info.stickerMessage) return 'sticker';
    if (Info.locationMessage) return 'location';
    if (Info.contactMessage) return 'contact';
    
    return 'unknown';
  }

  // Salvar buffer de mensagens no arquivo
  flushMessageBuffer(groupId) {
    if (!this.messageBuffer.has(groupId) || this.messageBuffer.get(groupId).length === 0) {
      return;
    }
    
    const messages = this.messageBuffer.get(groupId);
    const date = new Date().toISOString().split('T')[0];
    const filePath = path.join(this.messagesPath, `${this.sanitizeFilename(groupId)}_${date}.json`);
    
    let existingMessages = [];
    if (fs.existsSync(filePath)) {
      try {
        existingMessages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (error) {
        console.log(chalk.yellow(`⚠️ Erro ao ler mensagens existentes: ${error.message}`));
      }
    }
    
    existingMessages.push(...messages);
    fs.writeFileSync(filePath, JSON.stringify(existingMessages, null, 2));
    
    // Limpar buffer
    this.messageBuffer.set(groupId, []);
    
    console.log(chalk.hex('#87CEEB')(`📝 Buffer de mensagens salvo: ${messages.length} mensagens`));
  }

  // Obter dados do grupo
  getGroupData(groupId) {
    if (this.cache.has(groupId)) {
      return this.cache.get(groupId);
    }
    
    const filePath = path.join(this.dataPath, `${this.sanitizeFilename(groupId)}.json`);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.cache.set(groupId, data);
        return data;
      } catch (error) {
        console.log(chalk.red(`❌ Erro ao ler dados do grupo: ${error.message}`));
      }
    }
    
    return null;
  }

  // Obter contagem de mensagens
  getMessageCount(groupId) {
    const messagesDir = this.messagesPath;
    const files = fs.readdirSync(messagesDir).filter(file => 
      file.startsWith(this.sanitizeFilename(groupId)) && file.endsWith('.json')
    );
    
    let totalMessages = 0;
    files.forEach(file => {
      try {
        const messages = JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf8'));
        totalMessages += messages.length;
      } catch (error) {
        // Ignorar arquivos corrompidos
      }
    });
    
    return totalMessages;
  }

  // Obter membros ativos (que enviaram mensagens recentemente)
  getActiveMembers(groupId) {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const today = new Date().toISOString().split('T')[0];
    const filePath = path.join(this.messagesPath, `${this.sanitizeFilename(groupId)}_${today}.json`);
    
    if (!fs.existsSync(filePath)) return 0;
    
    try {
      const messages = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const activeUsers = new Set();
      
      messages.forEach(Info => {
        if (Info.timestamp > oneDayAgo && Info.participant) {
          activeUsers.add(Info.participant);
        }
      });
      
      return activeUsers.size;
    } catch (error) {
      return 0;
    }
  }

  // Criar backup dos dados
  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.backupPath, `backup_${timestamp}`);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Copiar dados dos grupos
    const groupFiles = fs.readdirSync(this.dataPath);
    groupFiles.forEach(file => {
      fs.copyFileSync(
        path.join(this.dataPath, file),
        path.join(backupDir, file)
      );
    });
    
    // Copiar mensagens do dia atual
    const today = new Date().toISOString().split('T')[0];
    const messageFiles = fs.readdirSync(this.messagesPath).filter(file => 
      file.includes(today)
    );
    
    messageFiles.forEach(file => {
      fs.copyFileSync(
        path.join(this.messagesPath, file),
        path.join(backupDir, file)
      );
    });
    
    console.log(chalk.hex('#4ECDC4')(`💾 Backup criado: ${backupDir}`));
    return backupDir;
  }

  // Iniciar salvamento automático
  startAutoSave() {
    this.saveInterval = setInterval(() => {
      // Salvar todos os buffers de mensagens
      for (const groupId of this.messageBuffer.keys()) {
        this.flushMessageBuffer(groupId);
      }
      
      // Criar backup a cada hora
      const now = new Date();
      if (now.getMinutes() === 0) {
        this.createBackup();
      }
    }, 5 * 60 * 1000); // 5 minutos
  }

  // Parar salvamento automático
  stopAutoSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }
  }

  // Sanitizar nome do arquivo
  sanitizeFilename(filename) {
    return filename.replace(/[^a-zA-Z0-9-_]/g, '_');
  }

  // Obter estatísticas gerais
  getGeneralStats() {
    const groupFiles = fs.readdirSync(this.dataPath);
    let totalGroups = groupFiles.length;
    let totalMembers = 0;
    let totalMessages = 0;
    
    groupFiles.forEach(file => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(this.dataPath, file), 'utf8'));
        totalMembers += data.memberCount || 0;
        totalMessages += data.stats?.totalMessages || 0;
      } catch (error) {
        // Ignorar arquivos corrompidos
      }
    });
    
    return {
      totalGroups,
      totalMembers,
      totalMessages,
      cacheSize: this.cache.size,
      bufferSize: Array.from(this.messageBuffer.values()).reduce((sum, arr) => sum + arr.length, 0)
    };
  }

  // Limpar dados antigos (mais de 30 dias)
  cleanOldData() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const messageFiles = fs.readdirSync(this.messagesPath);
    let deletedFiles = 0;
    
    messageFiles.forEach(file => {
      const filePath = path.join(this.messagesPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        deletedFiles++;
      }
    });
    
    if (deletedFiles > 0) {
      console.log(chalk.yellow(`🧹 Limpeza concluída: ${deletedFiles} arquivos antigos removidos`));
    }
  }
}

module.exports = GroupManager;

