// src/services/AudioTranscriptionService.js

const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { OpenAI } = require('openai');
const mime = require('mime-types');
const { v4: uuidv4 } = require('uuid');

// Configurar o caminho do ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcreve um arquivo MP3 usando a API Whisper da OpenAI.
 * @param {string} mp3FilePath - Caminho completo para o arquivo MP3.
 * @returns {Promise<string>} O texto transcrito.
 */
async function transcribeMp3(mp3FilePath) {
  try {
    if (!fs.existsSync(mp3FilePath)) {
      throw new Error(`MP3 file not found: ${mp3FilePath}`);
    }
    const audio = fs.createReadStream(mp3FilePath);
    const response = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: 'pt', // Define o idioma para português
    });
    console.log('Transcription:', response.text);
    return response.text;
  } catch (error) {
    console.error('Transcription error:', error.message);
    throw new Error('Erro ao transcrever o áudio.'); // Propaga o erro para ser tratado pela função chamadora
  } finally {
    // Limpar o arquivo mp3 temporário
    if (fs.existsSync(mp3FilePath)) {
      fs.unlinkSync(mp3FilePath);
      console.log(`Temporary MP3 file deleted: ${mp3FilePath}`);
    }
  }
}

/**
 * Converte um arquivo de áudio Opus para MP3.
 * @param {string} opusFilePath - Caminho completo para o arquivo Opus.
 * @param {string} mp3FilePath - Caminho para salvar o arquivo MP3 convertido.
 * @returns {Promise<void>} Uma promessa que resolve quando a conversão é concluída.
 */
async function convertOpusToMp3(opusFilePath, mp3FilePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(opusFilePath)) {
      return reject(new Error(`Opus file not found: ${opusFilePath}`));
    }
    ffmpeg(opusFilePath)
      .toFormat('mp3')
      .on('error', (err) => {
        console.error('Error converting audio:', err);
        reject(err);
      })
      .on('end', () => {
        console.log('Audio conversion finished.');
        resolve();
      })
      .save(mp3FilePath);
  }).finally(() => {
    // Limpar o arquivo opus temporário
    if (fs.existsSync(opusFilePath)) {
      fs.unlinkSync(opusFilePath);
      console.log(`Temporary Opus file deleted: ${opusFilePath}`);
    }
  });
}

/**
 * Verifica se a mensagem de áudio foi lida.
 * No whatsapp-web.js, 'ack' 3 significa READ (lida) e 4 significa PLAYED (reproduzida).
 * @param {Object} message - O objeto da mensagem do WhatsApp.
 * @returns {boolean} True se a mensagem foi lida, false caso contrário.
 */
function isMessageRead(message) {
  return message.ack >= 3;
}

/**
 * Lida com a transcrição de mensagens de áudio, incluindo delay e verificação de leitura.
 * @param {Object} client - A instância do cliente WhatsApp.
 * @param {Object} message - O objeto da mensagem de áudio do WhatsApp.
 * @param {number} delayMinutes - O tempo de delay em minutos antes de tentar transcrever.
 */
async function handleAudioTranscription(client, message, delayMinutes) {
  if (message.type !== 'ptt') { // 'ptt' é o tipo para áudios (push to talk)
    return; // Ignora se não for uma mensagem de áudio
  }

  const delayMilliseconds = delayMinutes * 60 * 1000;
  const originalMessageId = message.id._serialized; // Salva o ID original para verificar se foi lido

  console.log(`[AudioTranscriptionService] Agendando transcrição para ${message.from} em ${delayMinutes} minutos. ID: ${originalMessageId}`);

  setTimeout(async () => {
    try {
      // Re-obter a mensagem para ter o status de ack atualizado
      // Isso é crucial para verificar se a mensagem foi lida APÓS o delay
      const currentMessage = await client.getMessageById(originalMessageId);

      if (!currentMessage) {
        console.warn(`[AudioTranscriptionService] Mensagem com ID ${originalMessageId} não encontrada após o delay.`);
        return;
      }

      if (!isMessageRead(currentMessage)) {
        console.log(`[AudioTranscriptionService] Áudio de ${message.from} (ID: ${originalMessageId}) não lido. Iniciando transcrição.`);
        await currentMessage.reply(`Seu áudio não foi escutado em ${delayMinutes} minutos e será transcrito:`);

        try {
          const media = await currentMessage.downloadMedia();
          if (!media || !media.data || !media.mimetype) {
            console.error('[AudioTranscriptionService] Falha ao baixar mídia ou dados incompletos.');
            await currentMessage.reply('Não foi possível baixar o áudio para transcrever.');
            return;
          }

          const extension = mime.extension(media.mimetype);
          if (!extension) {
            console.error(`[AudioTranscriptionService] Tipo MIME desconhecido: ${media.mimetype}`);
            await currentMessage.reply('Formato de áudio não suportado para transcrição.');
            return;
          }

          // Caminhos para arquivos temporários
          const tempAudiosDir = path.join(__dirname, '../../temp_audios');
          if (!fs.existsSync(tempAudiosDir)) {
              fs.mkdirSync(tempAudiosDir, { recursive: true });
          }
          
          const filename = path.join(tempAudiosDir, `${uuidv4()}.${extension}`);
          const mp3Filename = `${filename}.mp3`;

          fs.writeFileSync(filename, media.data, 'base64');
          console.log(`[AudioTranscriptionService] Áudio temporário salvo: ${filename}`);

          await convertOpusToMp3(filename, mp3Filename);
          let audio_transcribe = await transcribeMp3(mp3Filename);
          
          await currentMessage.reply(`Transcrição do áudio: \n\n_${audio_transcribe}_`);
          console.log(`[AudioTranscriptionService] Transcrição enviada para ${message.from}`);

        } catch (innerError) {
          console.error('[AudioTranscriptionService] Erro durante o processo de transcrição de áudio:', innerError);
          await currentMessage.reply('Ocorreu um erro ao transcrever o áudio. Tente novamente mais tarde.');
        }
      } else {
        console.log(`[AudioTranscriptionService] Áudio de ${message.from} (ID: ${originalMessageId}) já foi lido. Transcrição cancelada.`);
      }
    } catch (outerError) {
      console.error(`[AudioTranscriptionService] Erro ao re-obter mensagem ou no setTimeout: ${outerError}`);
    }
  }, delayMilliseconds);
}

module.exports = {
  handleAudioTranscription,
  // Exportar outras funções se precisar delas individualmente para testes ou outros módulos
  transcribeMp3,
  convertOpusToMp3,
  isMessageRead
};
