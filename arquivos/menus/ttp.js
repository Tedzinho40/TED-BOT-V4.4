const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');

// Controle de cooldown na memória
const cooldown = new Map(); // user -> timestamp

/**
 * Comando TTP - Gera figurinha com texto usando a API do tedzinho.com.br
 * @param {Object} sock - conexão do WhatsApp (Baileys)
 * @param {Object} Info - informações da mensagem
 * @param {string} NomeDoBot - nome do bot (opcional, sem EXIF)
 * @param {string} API_KEY_TED - chave da API do tedzinho.com.br
 * @param {string} NickDono - nome do dono (opcional, sem EXIF)
 * @param {string} from - ID do chat (ex: grupo ou PV)
 */
async function ttp(sock, Info, NomeDoBot, API_KEY_TED, NickDono, from) {
    const getRandom = (ext = '') => `${Math.floor(Math.random() * 1000000)}${ext}`;
    const reply = (texto) => sock.sendMessage(from, { text: texto }, { quoted: Info });

    try {
        const sender = Info.key?.participant || Info.key?.remoteJid || "usuario_desconhecido";
        const body = Info.body || Info.message?.conversation || "";
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(" ");

        if (!q) return reply("⚠️ | Cadê o texto? Exemplo: *.ttp Flamengo*");

        const now = Date.now();
        const lastUse = cooldown.get(sender) || 0;
        if (now - lastUse < 2000) {
            const restante = ((2000 - (now - lastUse)) / 1000).toFixed(1);
            return reply(`⏳ | Aguarde ${restante}s antes de usar novamente.`);
        }
        cooldown.set(sender, now);

        const texto = encodeURIComponent(q);
        const url = `https://tedzinho.com.br/api/ttp/ttp?apikey=${API_KEY_TED}&texto=${texto}`;

        reply(`🎨 Gerando figurinha com o texto: _${q}_...`);

        const res = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(res.data);

        // Se já for webp, envia direto
        const contentType = res.headers['content-type'];
        if (contentType.includes('webp')) {
            const tempWEBP = getRandom('.webp');
            fs.writeFileSync(tempWEBP, buffer);
            await sock.sendMessage(from, { sticker: fs.readFileSync(tempWEBP), isAnimated: true, isAiSticker: true }, { quoted: Info });
            fs.unlinkSync(tempWEBP);
            return;
        }

        // Se não for webp, converte para sticker animado via ffmpeg
        const tempJPG = getRandom('.jpg');
        fs.writeFileSync(tempJPG, buffer);
        const tempWEBP = getRandom('.webp');

        const ffmpegCmd = `ffmpeg -i ${tempJPG} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${tempWEBP}`;

        exec(ffmpegCmd, async (err) => {
            fs.unlinkSync(tempJPG);
            if (err) return reply("❌ Erro ao converter a imagem para sticker!");

            await sock.sendMessage(from, { sticker: fs.readFileSync(tempWEBP), isAnimated: true, isAiSticker: true }, { quoted: Info });
            fs.unlinkSync(tempWEBP);
        });

    } catch (erro) {
        console.error("❌ Erro no TTP:", erro);
        reply("⚠️ | Erro ao gerar figurinha. O servidor pode estar offline ou o texto é inválido.");
    }
}

module.exports = ttp;