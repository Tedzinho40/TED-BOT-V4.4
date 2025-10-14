const axios = require('axios');

/**
 * Comando Pinterest seguro - envia 3 imagens aleatórias com delay
 */
const pinterestRandomImagesSafe = async (sock, from, Info, args, prefix, API_KEY_TED, sasah) => {
    try {
        const reply = (texto) => sock.sendMessage(from, { text: texto }, { quoted: sasah });
        const query = args.join(" ");
        if (!query) return reply(`❌ Cadê o termo de pesquisa?\nExemplo: ${prefix}pinimg Beyoncé`);

        // Chama API Tedzinho - pesquisa Pinterest
        const searchApi = await axios.get(
            `https://tedzinho.com.br/api/pesquisa/pinterest?apikey=${API_KEY_TED}&query=${encodeURIComponent(query)}`
        ).then(res => res.data)
        .catch(() => null);

        if (!searchApi || !searchApi.resultado || searchApi.resultado.length === 0) {
            return reply("⚠️ Nenhum resultado encontrado no Pinterest.");
        }

        // Seleciona 3 imagens aleatórias
        const shuffled = searchApi.resultado.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        // Função para delay
        const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

        for (const item of selected) {
            const caption = `👤 Autor: ${item.fullname} (${item.by})\n📝 Legenda: ${item.caption || "Sem legenda"}\n🔗 Fonte: ${item.source}`;

            await sock.sendMessage(from, {
                image: { url: item.image },
                caption: caption
            }, { quoted: sasah });

            // Delay de 2 segundos entre cada envio
            await wait(2000);
        }

    } catch (e) {
        console.error("❌ Erro no comando Pinterest imagens seguras:", e);
        await sock.sendMessage(from, { text: "❌ Erro ao buscar imagens do Pinterest." }, { quoted: sasah });
    }
};

module.exports = pinterestRandomImagesSafe;