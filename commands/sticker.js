const { MessageMedia } = require('whatsapp-web.js');
const sharp = require('sharp');
const { frasesFigurinha } = require('../dados');
const log = require('../utils/logger');

// ==========================
function fraseAleatoria(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

// ==========================
module.exports = async function handleSticker(msg) {
  let media;

  if (msg.hasMedia) {
    media = await msg.downloadMedia();
  } else if (msg.hasQuotedMsg) {
    const quoted = await msg.getQuotedMessage();
    if (quoted.hasMedia) {
      media = await quoted.downloadMedia();
    }
  }

  if (!media) {
    await msg.reply('⚠️ Envie ou responda uma imagem/GIF');
    return;
  }

  try {

    const buffer = Buffer.from(media.data, 'base64');

    const stickerBuffer = await sharp(buffer, {
      animated: media.mimetype === 'image/gif'
    })
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 80 })
      .toBuffer();

    const sticker = new MessageMedia(
      'image/webp',
      stickerBuffer.toString('base64'),
      'sticker.webp'
    );

    const frase = fraseAleatoria(frasesFigurinha);

    await msg.reply(frase);

    await msg.reply(sticker, null, {
      sendMediaAsSticker: true,
      stickerAuthor: 'KaioBelisco',
      stickerName: 'Uga-Bot'
    });

    log('SUCCESS', 'Sticker enviado');

  } catch (err) {
    log('ERROR', err);
    await msg.reply('❌ Erro ao criar figurinha');
  }
};