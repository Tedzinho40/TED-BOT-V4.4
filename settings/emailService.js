const nodemailer = require('nodemailer');
const emailConfig = require('../settings/emailConfig.json');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: emailConfig.service,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass
      }
    });

    // Memória para guardar códigos (usuário -> {codigo, expira, tentativas})
    this.codes = {};
  }

  // ========= GERA CÓDIGO =========
  generateRecoveryCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
  }

  // ========= ENVIA E-MAIL =========
  async sendRecoveryEmail(to) {
    try {
      const recoveryCode = this.generateRecoveryCode();
      const expira = Date.now() + 10 * 60 * 1000; // 10 min

      // salva na memória
      this.codes[to] = { code: recoveryCode, expira, tentativas: 3 };

      const mailOptions = {
        from: emailConfig.defaultFrom,
        to: to,
        subject: "🔑 Código de Recuperação",
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center;">
            <h2 style="color:#4CAF50;">Código de Recuperação</h2>
            <p>Use o código abaixo para prosseguir:</p>
            <h1 style="letter-spacing: 5px; color: #000;">${recoveryCode}</h1>
            <p style="font-size:12px; color:gray;">Este código expira em 10 minutos.</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email enviado para:', to, '| Código:', recoveryCode);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return { success: false, error: error.message };
    }
  }

  // ========= VERIFICA CÓDIGO =========
  verifyCode(user, code) {
    const registro = this.codes[user];
    if (!registro) return { success: false, error: "Nenhum código ativo. Solicite um novo." };

    if (Date.now() > registro.expira) {
      delete this.codes[user];
      return { success: false, error: "⏰ Código expirado. Solicite outro." };
    }

    if (registro.code === code) {
      delete this.codes[user]; // remove depois de usar
      return { success: true };
    }

    // Se errou, desconta uma tentativa
    registro.tentativas -= 1;

    if (registro.tentativas <= 0) {
      delete this.codes[user];
      return { success: false, error: "❌ Número máximo de tentativas atingido. Solicite novo código." };
    }

    return { success: false, error: `Código incorreto. Restam ${registro.tentativas} tentativas.` };
  }
}

module.exports = new EmailService();