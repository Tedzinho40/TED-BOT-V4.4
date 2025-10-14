const fs = require('fs');
const axios = require('axios');

const pinterestCommand = async (sock, from, Info, args, prefix, API_KEY_TED, sasah) => {
    try {
        const reply = (texto) => sock.sendMessage(from, { text: texto }, { quoted: sasah });
        const url = args[0];
        if (!url) return reply(`❌ Cadê o link do Pinterest?\nExemplo: ${prefix}pinterest https://pin.it/xxxxx`);

        // Função para baixar buffer
        const getBuffer = async (link) => {
            try {
                const res = await axios.get(link, { responseType: 'arraybuffer' });
                return Buffer.from(res.data, "utf-8");
            } catch {
                return null;
            }
        };

        // Chama API do Tedzinho - Pinterest
        const pinApi = await axios.get(
            `https://tedzinho.com.br/api/download/pinterest-download?apikey=${API_KEY_TED}&url=${encodeURIComponent(url)}`
        ).then(res => res.data)
        .catch(() => null);

        if (!pinApi || !pinApi.resultado || !pinApi.resultado.dl_link) {
            return reply("⚠️ Não consegui encontrar o vídeo do Pinterest.");
        }

        const resultado = pinApi.resultado;
        const videoUrl = resultado.dl_link;
        const thumb = resultado.thumb;
        const title = resultado.title || "Sem título";
        const author = resultado.author?.name || "Desconhecido";
        const upload = resultado.upload || "Data desconhecida";
        const source = resultado.source || url;

        // Baixa vídeo
        const videoBuffer = await getBuffer(videoUrl);
        if (!videoBuffer) return reply("❌ Falha ao baixar o vídeo do Pinterest.");

        // Cria pasta temp se não existir
        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp', { recursive: true });

        // Arquivo temporário
        const videoPath = `./temp/pinterest_${Date.now()}.mp4`;
        fs.writeFileSync(videoPath, videoBuffer);

        // Legenda detalhada
        const caption = `📌 *Pinterest Video*\n🎬 Título: ${title}\n👤 Autor: ${author}\n🕒 Upload: ${upload}\n🔗 Fonte: ${source}`;

        // Envia vídeo com thumbnail
        await sock.sendMessage(from, {
            video: videoBuffer,
            mimetype: "video/mp4",
            fileName: `Pinterest_${title.replace(/[^a-zA-Z0-9]/g, "_")}.mp4`,
            caption: caption,
            jpegThumbnail: await getBuffer(thumb)
        }, { quoted: sasah });

        // Apaga arquivo temporário
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);

    } catch (e) {
        console.error("❌ Erro no comando Pinterest:", e);
        await sock.sendMessage(from, { text: "❌ Erro ao processar vídeo do Pinterest." }, { quoted: sasah });
    }
};

// Exporta o comando
module.exports = pinterestCommand;