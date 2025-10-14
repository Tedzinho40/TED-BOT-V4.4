// Importa as dependências necessárias
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { exec } = require("child_process");
const fs = require("fs");

async function videoToAudio(sock, Info, from) {
  try {
    // Verifica se há vídeo na mensagem atual ou na mensagem respondida (reply)
    const quoted = Info.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const videoMsg = Info.message?.videoMessage || quoted?.videoMessage;

    if (!videoMsg) {
      return sock.sendMessage(from, {
        text: "❌ Você precisa enviar ou marcar um vídeo para extrair o áudio."
      }, { quoted: Info });
    }

    // Reage à mensagem para indicar que o processamento começou
    await sock.sendMessage(from, { react: { text: "⏳", key: Info.key } });
    await sock.sendMessage(from, {
      text: "🎵 Convertendo vídeo para áudio MP3..."
    }, { quoted: Info });

    // Baixa o conteúdo do vídeo da mensagem
    const stream = await downloadContentFromMessage(videoMsg, "video");
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    // Define nomes para os arquivos temporários de entrada e saída
    const tempInput = `temp_video_${Date.now()}.mp4`;
    const tempOutput = `audio_${Date.now()}.mp3`;

    // Salva o buffer do vídeo em um arquivo temporário
    fs.writeFileSync(tempInput, buffer);

    // Monta o comando do FFmpeg para converter o vídeo para áudio MP3
    // -i: arquivo de entrada
    // -vn: desabilita o stream de vídeo
    // -acodec libmp3lame: usa o encoder MP3 LAME
    // -ab 192k: define o bitrate do áudio para 192 kbps
    // -ar 44100: define a taxa de amostragem para 44100 Hz
    // -y: sobrescreve o arquivo de saída se ele já existir
    const ffmpegCommand = `ffmpeg -i "${tempInput}" -vn -acodec libmp3lame -ab 192k -ar 44100 -y "${tempOutput}"`;

    // Executa o comando FFmpeg
    exec(ffmpegCommand, async (error, stdout, stderr) => {
      // Deleta o arquivo de vídeo temporário, independentemente do resultado
      if (fs.existsSync(tempInput)) {
        fs.unlinkSync(tempInput);
      }

      if (error) {
        console.error("Erro no FFmpeg:", error);
        return sock.sendMessage(from, {
          text: "❌ Erro ao converter o vídeo para áudio. Verifique se o FFmpeg está instalado e acessível no PATH do sistema."
        }, { quoted: Info });
      }

      // Verifica se o arquivo de áudio foi criado com sucesso
      if (fs.existsSync(tempOutput)) {
        try {
          const audioBuffer = fs.readFileSync(tempOutput);
          const fileSizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);

          // Envia o áudio convertido
          await sock.sendMessage(from, {
            audio: audioBuffer,
            mimetype: "audio/mpeg",
            fileName: `audio_extraido_${Date.now()}.mp3`,
            ptt: false // Envia como áudio, não como mensagem de voz
          }, { quoted: Info });

          // Envia uma mensagem de sucesso com informações sobre o arquivo
          await sock.sendMessage(from, {
            text: `✅ *Áudio extraído com sucesso!*\n\n📊 Tamanho: ${fileSizeMB} MB\n🎵 Formato: MP3 192kbps`
          }, { quoted: Info });

        } catch (sendError) {
          console.error("Erro ao enviar o áudio:", sendError);
          await sock.sendMessage(from, {
            text: "❌ Ocorreu um erro ao enviar o áudio convertido."
          }, { quoted: Info });
        } finally {
          // Garante que o arquivo de áudio temporário seja deletado após o envio
          if (fs.existsSync(tempOutput)) {
            fs.unlinkSync(tempOutput);
          }
        }
      } else {
        await sock.sendMessage(from, {
          text: "❌ Falha na conversão do áudio. O arquivo de saída não foi gerado."
        }, { quoted: Info });
      }
    });

  } catch (error) {
    console.error("Erro no comando video2audio:", error);
    await sock.sendMessage(from, {
      text: "❌ Ocorreu um erro inesperado ao processar sua solicitação."
    }, { quoted: Info });
  }
}

// Exporta a função para que ela possa ser chamada por outros arquivos
module.exports = videoToAudio;
