const fs = require('fs');
const axios = require('axios');

const instaMp4Command = async (sock, from, Info, args, prefix, API_KEY_TED, sasah) => {
    try {
        const reply = (texto) => sock.sendMessage(from, { text: texto }, { quoted: sasah });
        const url = args[0];
        if (!url) return reply(`❌ Cadê o link do Instagram?\nExemplo: ${prefix}instamp4 https://www.instagram.com/reel/xxxxx/`);

        // Função para baixar buffer
        const getBuffer = async (link) => {
            try {
                const res = await axios.get(link, { responseType: 'arraybuffer' });
                return Buffer.from(res.data, "utf-8");
            } catch {
                return null;
            }
        };

        // Chama API do Tedzinho
        const instaApi = await axios.get(
            `https://tedzinho.com.br/api/download/instagram/v2?apikey=${API_KEY_TED}&url=${encodeURIComponent(url)}`
        ).then(res => res.data)
        .catch(() => null);

        if (!instaApi || !instaApi.resultado || instaApi.resultado.length === 0) {
            return reply("⚠️ Não consegui encontrar o vídeo do Instagram.");
        }

        // Pega o primeiro resultado
        const resultado = instaApi.resultado[0];
        const videoUrl = resultado.url;
        const thumb = resultado.thumbnail;

        // Baixa vídeo
        const videoBuffer = await getBuffer(videoUrl);
        if (!videoBuffer) return reply("❌ Falha ao baixar o vídeo do Instagram.");

        // Monta legenda
        const caption = `📸 *Instagram Reel*\n✅ Vídeo encontrado!`;

        // Envia vídeo com miniatura
        await sock.sendMessage(from, {
            video: videoBuffer,
            mimetype: "video/mp4",
            fileName: `Instagram_Reel.mp4`,
            caption: caption,
            jpegThumbnail: await getBuffer(thumb)
        }, { quoted: sasah });

    } catch (e) {
        console.error("❌ Erro no comando Instagram MP4:", e);
        await sock.sendMessage(from, { text: "❌ Erro ao processar o vídeo do Instagram." }, { quoted: sasah });
    }
};

// Exporta o comando
module.exports = instaMp4Command;