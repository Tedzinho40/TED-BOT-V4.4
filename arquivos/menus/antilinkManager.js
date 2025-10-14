const fs = require('fs');
const path = require('path');

class AntiLinkManager {
  constructor() {
    this.file = path.join(__dirname, 'antilinkSettings.json');
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      if (fs.existsSync(this.file)) {
        return JSON.parse(fs.readFileSync(this.file, 'utf8'));
      }
    } catch (err) {
      // Erro ignorado
    }
    return {};
  }

  saveSettings() {
    try {
      fs.writeFileSync(this.file, JSON.stringify(this.settings, null, 2));
    } catch (err) {
      // Erro ignorado
    }
  }

  enable(groupId) {
    if (!this.settings[groupId]) this.settings[groupId] = {};
    this.settings[groupId].enabled = true;
    this.settings[groupId].updatedAt = new Date().toISOString();
    this.saveSettings();
  }

  disable(groupId) {
    if (this.settings[groupId]) {
      this.settings[groupId].enabled = false;
      this.settings[groupId].updatedAt = new Date().toISOString();
      this.saveSettings();
    }
  }

  isEnabled(groupId) {
    return this.settings[groupId]?.enabled || false;
  }

  async checkMessage(sock, from, Info) {
    try {
      if (!from.endsWith('@g.us') || !this.isEnabled(from)) return false;

      const body = Info.message?.conversation ||
                   Info.message?.extendedTextMessage?.text ||
                   Info.message?.imageMessage?.caption ||
                   Info.message?.videoMessage?.caption || "";

      const regexLink = /(https?:\/\/)?(www\.)?(chat\.whatsapp\.com|wa\.me|discord\.gg|instagram\.com|t\.me|youtube\.com|facebook\.com|twitter\.com)/gi;

      if (regexLink.test(body)) {
        const participant = Info.key.participant || Info.key.remoteJid;
        const metadata = await sock.groupMetadata(from);
        const participantInfo = metadata.participants.find(p => p.id === participant);
        const isAdmin = participantInfo && (participantInfo.admin === 'admin' || participantInfo.admin === 'superadmin');

        if (!isAdmin) {
          await this.applyPunishment(sock, from, participant, Info);
          return true;
        }
      }
      
      return false;
    } catch {
      return false;
    }
  }

  async applyPunishment(sock, groupId, participant, Info) {
    try {
      try { await sock.sendMessage(groupId, { delete: Info.key }); } catch {}
      try { await sock.groupParticipantsUpdate(groupId, [participant], 'remove'); } catch {}
      try { await sock.groupSettingUpdate(groupId, 'announcement'); } catch {}

      await sock.sendMessage(groupId, {
        text: `🚨 *AntiLinkHard Ativo!*\n\n🔗 Link detectado!\n@${participant.split('@')[0]} foi *banido*.\nO grupo foi *fechado temporariamente* por segurança.`,
        mentions: [participant]
      });

      setTimeout(async () => {
        try {
          await sock.groupSettingUpdate(groupId, 'not_announcement');
          await sock.sendMessage(groupId, {
            text: '✅ O grupo foi reaberto automaticamente após verificação.'
          });
        } catch {}
      }, 5000);

    } catch {}
  }
}

module.exports = AntiLinkManager;