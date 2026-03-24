const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlp = new YTDlpWrap();
const qrcode = require('qrcode-terminal');
const sharp = require('sharp');
const http = require('http');
const fs = require('fs');

// FRASES
const { frasesFigurinha } = require('./dados');

// ==========================
// FRASE ALEATÓRIA
// ==========================
function fraseAleatoria(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

// ==========================
// LOG CLEAN + COLORIDO
// ==========================
function log(tipo, msg) {
  const agora = new Date().toLocaleTimeString();

  const cores = {
    SYSTEM: '\x1b[36m',
    SUCCESS: '\x1b[32m',
    ERROR: '\x1b[31m'
  };

  const reset = '\x1b[0m';

  if (!cores[tipo]) return;

  console.log(`${cores[tipo]}[${agora}] [${tipo}] ${msg}${reset}`);
}

// ==========================
// CLIENT
// ==========================

process.env.PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer';
const client = new Client({
   authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    executablePath: '/opt/render/.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
      '--no-zygote'
    ]
  }
});

// ==========================
// QR CODE
// ==========================
client.on('qr', (qr) => {
  console.log('\n📱 Escaneie o QR Code:\n');
  qrcode.generate(qr, { small: true });
});

// ==========================
// READY
// ==========================
client.on('ready', () => {
  log('SYSTEM', 'Bot conectado!');
});

// ==========================
// MENSAGENS
// ==========================
client.on('message_create', async (msg) => {
  try {
    const comando = msg.body.toLowerCase().trim();

    // evita loop
    if (msg.fromMe && !comando.startsWith('uga-')) return;

    // ONE PIECE
    if (/one\s*piece/i.test(msg.body)) {
      await msg.reply('Você é tchola');
      return;
    }

    // ==========================
    // UGA-STICK
    // ==========================
    if (comando === 'uga-stick') {
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
        await msg.reply('⚠️ Envie ou responda uma imagem/GIF com uga-stick');
        return;
      }

      await msg.react('⏳');

      const stickerBuffer = await sharp(
        Buffer.from(media.data, 'base64'),
        { animated: media.mimetype === 'image/gif' }
      )
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

      await msg.react('✅');

      log('SUCCESS', 'Figurinha enviada');
      return;
    }

    // ==========================
    // UGA-VIDEO
    // ==========================
    if (comando.startsWith('uga-video')) {
      const url = msg.body.split(' ')[1];

      if (!url) {
        await msg.reply('⚠️ Envie um link válido!');
        return;
      }

      await msg.react('⏳');

      const caminho = `./video_${Date.now()}.mp4`;

      try {
        await ytDlp.execPromise([
          url,
          '-o', caminho,
          '--no-playlist',
          '-S', 'res:480'
        ]);
      } catch {
        await ytDlp.execPromise([
          url,
          '-o', caminho,
          '--no-playlist',
          '-f', 'worst'
        ]);
      }

      if (!fs.existsSync(caminho)) {
        await msg.reply('❌ Não consegui baixar esse vídeo');
        return;
      }

      const stats = fs.statSync(caminho);
      const tamanhoMB = stats.size / (1024 * 1024);

      if (tamanhoMB > 16) {
        fs.unlinkSync(caminho);
        await msg.reply('❌ Vídeo muito grande (limite ~16MB)');
        return;
      }

      const buffer = fs.readFileSync(caminho);

      const video = new MessageMedia(
        'video/mp4',
        buffer.toString('base64'),
        'video.mp4'
      );

      await msg.reply(video);

      fs.unlinkSync(caminho);

      log('SUCCESS', 'Vídeo enviado');
      return;
    }

  } catch (err) {
    log('ERROR', err.stack || err);
    await msg.reply('❌ Erro ao processar comando');
  }
});

// ==========================
// DESCONECTADO
// ==========================
client.on('disconnected', (reason) => {
  log('ERROR', `Desconectado: ${reason}`);
  setTimeout(() => client.initialize(), 5000);
});

// ==========================
// KEEP ALIVE
// ==========================
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('🤖 Bot rodando!');
}).listen(process.env.PORT || 3000);

// ==========================
// START
// ==========================
client.initialize();