//by tedzinho

const { AssemblyAI } = require('assemblyai');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const ARQUIVOS_DIR = path.resolve('./arquivos');
// Cria a pasta ./arquivos se não existir
if (!fs.existsSync(ARQUIVOS_DIR)) {
  fs.mkdirSync(ARQUIVOS_DIR, { recursive: true });
}

async function getFileBuffer(quotedMsg) {
  if (!quotedMsg) throw new Error("Nenhuma mensagem para baixar.");

  // Passar o wrapper completo que o Baileys espera
  const wrapper = { message: quotedMsg };

  const buffer = await downloadMediaMessage(wrapper, 'buffer', {}, { logger: console });
  return buffer;
}

async function toText(sock, Info, from) {
  try {
    // 1️⃣ Verifica se há mensagem de áudio citada
    const quotedMsg = Info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg?.audioMessage) {
      return await sock.sendMessage(from, { text: "Por favor, mencione um áudio para realizar a leitura do áudio." }, { quoted: Info });
    }

    // 2️⃣ Verifica tamanho do áudio
    const audioLength = Number(quotedMsg.audioMessage.fileLength);
    if (audioLength > 2_100_000) {
      return await sock.sendMessage(from, { text: "Só realizo a transcrição de áudio de até *2MB*, envie um arquivo menor." }, { quoted: Info });
    }

    // 3️⃣ Obtém o buffer do áudio
    const bufferAudio = await getFileBuffer(quotedMsg);

    // 4️⃣ Salva o áudio localmente
    const audioPath = path.join(ARQUIVOS_DIR, `totext-${Date.now()}.mp3`);
    fs.writeFileSync(audioPath, bufferAudio);

    await sock.sendMessage(from, { text: "Estou realizando a transcrição do áudio para texto, aguarde..." }, { quoted: Info });

    // 5️⃣ Inicializa AssemblyAI
    const client = new AssemblyAI({ apiKey: '532e6841836745208e72144160b97e9f' }); // Substitua pela sua API Key

    // 6️⃣ Upload do áudio
    const uploadUrl = await client.files.upload(bufferAudio, { filename: audioPath });

    // 7️⃣ Cria a transcrição
    const transcript = await client.transcripts.create({ audio_url: uploadUrl, language_code: 'pt' });

    // 8️⃣ Aguarda a conclusão da transcrição
    async function waitForTranscript(id) {
      let result;
      do {
        await new Promise(res => setTimeout(res, 5000));
        result = await client.transcripts.get(id);
      } while (result.status !== 'completed' && result.status !== 'error');
      return result;
    }

    const finalTranscript = await waitForTranscript(transcript.id);

    // 9️⃣ Verifica se houve erro
    if (finalTranscript.status === 'error') {
      return await sock.sendMessage(from, { text: "Ocorreu um erro ao transcrever o áudio." }, { quoted: Info });
    }

    // 🔟 Verifica se há texto
    if (!finalTranscript.text || finalTranscript.text.trim() === '') {
      return await sock.sendMessage(from, { text: "Não detectei nenhuma palavra nesse áudio." }, { quoted: Info });
    }

    // 1️⃣1️⃣ Conta palavras
    const wordCount = finalTranscript.words?.length || finalTranscript.text.split(/\s+/).length;

    // 1️⃣2️⃣ Envia resultado
    await sock.sendMessage(from, { text: `• *Transcrição* - Quantidade de palavra(s) detectada(s): *${wordCount}*\n—\n• ${finalTranscript.text}` }, { quoted: Info });

    // 1️⃣3️⃣ Remove arquivo local após uso
    fs.unlink(audioPath, err => {
      if (err) console.error("Erro ao remover arquivo de áudio:", err);
    });

  } catch (e) {
    console.error("Erro no toText:", e);
    await sock.sendMessage(from, { text: "Ocorreu um erro inesperado, tente novamente." }, { quoted: Info });
  }
}

module.exports = { toText };