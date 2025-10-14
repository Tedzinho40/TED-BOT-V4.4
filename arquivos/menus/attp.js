const axios = require('axios');
const fs = require('fs');

module.exports = async (sock, Info, NomeDoBot, API_KEY_TED, NickDono) => {
    try {
        // Controle de cooldown na memória
        if (!global.attpCooldown) global.attpCooldown = new Map();
        const getRandom = (ext = '') => `${Math.floor(Math.random() * 1000000)}${ext}`;
        const reply = (texto) => sock.sendMessage(Info.key.remoteJid, { text: texto }, { quoted: Info });

        const sender = Info.key?.participant || Info.key?.remoteJid || "usuario_desconhecido";
        const now = Date.now();

        // ✅ Cooldown de 2 segundos
        const lastUse = global.attpCooldown.get(sender) || 0;
        if (now - lastUse < 2000) {
            const restante = ((2000 - (now - lastUse)) / 1000).toFixed(1);
            return reply(`⏳ | Aguarde ${restante}s antes de usar novamente.`);
        }
        global.attpCooldown.set(sender, now);

        const body = Info.body || Info.message?.conversation || "";
        const args = body.trim().split(/ +/).slice(1);
        const q = args.join(" ");

        if (!q) return reply("⚠️ | Cadê o texto? Exemplo: *.attp TED*");

        const texto = encodeURIComponent(q);
        const url = `https://tedzinho.com.br/api/ttp/attp?apikey=${API_KEY_TED}&texto=${texto}`;

        reply(`🎨 Gerando figurinha animada com o texto: _${q}_...`);

        // Faz o download do sticker animado
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        const contentType = res.headers['content-type'];

        if (!contentType.includes('webp')) {
            console.log("ATTp retornou outro tipo:", contentType);
            return reply("⚠️ O servidor retornou um formato inesperado. Tente novamente mais tarde.");
        }

        const tempFile = getRandom('.webp');
        fs.writeFileSync(tempFile, Buffer.from(res.data));

        // Envia diretamente como sticker animado sem EXIF
        await sock.sendMessage(Info.key.remoteJid, {
            sticker: fs.readFileSync(tempFile),
            isAnimated: true, // garante que é animado
            isAiSticker: true
        }, { quoted: Info });

        fs.unlinkSync(tempFile);

    } catch (erro) {
        console.error("❌ Erro no ATTp:", erro);
        const reply = (texto) => sock.sendMessage(Info.key.remoteJid, { text: texto }, { quoted: Info });
        reply("⚠️ | Erro ao gerar figurinha animada. O servidor pode estar offline ou o texto é inválido.");
    }
};