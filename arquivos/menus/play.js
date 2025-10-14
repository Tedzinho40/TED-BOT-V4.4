const axios = require("axios");

module.exports = async function playCommand(sock, from, Info, args, prefix, API_KEY_TED) {
    const reply = (texto) => sock.sendMessage(from, { text: texto }, { quoted: Info });

    try {
        const query = args.join(" ");
        if (!query) {
            return reply(`❌ Cadê o nome da música?\nExemplo: ${prefix}play Casa do Seu Zé`);
        }

        // 🔢 Função para formatar número (1.2K, 3.5M etc.)
        const formatarNumero = (num) => {
            if (isNaN(num)) return num;
            if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2).replace(/\.0+$/, "") + "B";
            if (num >= 1_000_000) return (num / 1_000_000).toFixed(2).replace(/\.0+$/, "") + "M";
            if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0+$/, "") + "K";
            return num.toString();
        };

        // 🎵 Função para enviar a música
        const enviarMusica = async (dados, apiName) => {
            const title = dados.titulo || dados.title || "Sem título";
            const author = dados.autor || dados.channel || "Desconhecido";
            const duration = dados.duracao || dados.timestamp || "Desconhecida";
            const thumbnail = dados.thumbnail || dados.thumbnails?.[0] || "https://files.catbox.moe/427zyd.jpg";
            const views = formatarNumero(dados.views || dados.viewsCount || 0);
            const publicado = dados.publicado || dados.uploadDate || "Desconhecido";
            const linkVideo = dados.videoUrl || dados.externalUrls?.video || "N/A";
            const arquivo = dados.arquivo || dados.dl_link;

            await sock.sendMessage(from, {
                image: { url: thumbnail },
                caption: `🎵 *${title}*\n👤 *Canal:* ${author}\n⏱️ *Duração:* ${duration}\n👀 *Visualizações:* ${views}\n📅 *Publicado:* ${publicado}\n🔗 *Link:* ${linkVideo}`,
                footer: `✨ Powered by ${apiName}`,
                headerType: 4
            }, { quoted: Info });

            const audioBuffer = await axios.get(arquivo, { responseType: "arraybuffer" })
                .then(r => r.data)
                .catch(() => null);

            if (!audioBuffer) return reply("❌ Falha ao baixar o áudio.");

            await sock.sendMessage(from, {
                audio: audioBuffer,
                mimetype: "audio/mpeg",
                fileName: `${title}.mp3`,
                ptt: false
            }, { quoted: Info });
        };

        // =======================
        // 1° Tentativa → API v5
        // =======================
        try {
            const apiV5 = await axios.get(
                `https://tedzinho.com.br/api/download/play_audio/v5?apikey=${API_KEY_TED}&nome_url=${encodeURIComponent(query)}`
            );
            const res = apiV5.data?.resultado;
            if (res && res.arquivo) {
                return await enviarMusica(res, "Tedzinho API v5");
            }
        } catch {}

        // =======================
        // 2° Tentativa → API v1
        // =======================
        try {
            const apiV1 = await axios.get(
                `https://tedzinho.com.br/api/download/play_audio?apikey=${API_KEY_TED}&nome_url=${encodeURIComponent(query)}`
            );
            const res = apiV1.data?.resultado;
            if (res && res.dl_link) {
                return await enviarMusica(res, "Tedzinho API v1");
            }
        } catch {}

        // =======================
        // 3° Tentativa → API v3 (backup)
        // =======================
        try {
            const apiV3 = await axios.get(
                `https://tedzinho.com.br/api/download/play_audio/v3?apikey=${API_KEY_TED}&nome_url=${encodeURIComponent(query)}`
            );
            const res = apiV3.data?.resultado;
            if (res && (res.arquivo || res.dl_link)) {
                return await enviarMusica(res, "Tedzinho API v3 (Backup)");
            }
        } catch {}

        // Se todas falharem
        await reply("❌ Não consegui encontrar essa música em nenhuma das rotas.");

    } catch (e) {
        console.error(e);
        await reply("❌ Erro ao processar sua música.");
    }
};