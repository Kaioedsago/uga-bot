const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const YTDlpWrap = require('yt-dlp-wrap').default;
const ytDlp = new YTDlpWrap();
const qrcode = require('qrcode-terminal');
const sharp = require('sharp');
const http = require('http');

// ============================================================
// CONFIGURAÇÃO DO CLIENTE
// LocalAuth salva a sessão em disco para não precisar
// escanear o QR Code toda vez que o bot reiniciar
// ============================================================
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  }
});

// ============================================================
// QR CODE — aparece no terminal na primeira vez
// ============================================================
client.on('qr', (qr) => {
  console.log('\n📱 Escaneie o QR Code:\n');
  qrcode.generate(qr, { small: true });
});

// ============================================================
// PRONTO — bot conectado e funcionando
// ============================================================
client.on('ready', () => {
  console.log('✅ Bot conectado!');
  console.log('📌 Comandos ativos: !uga-stick');
});

// ============================================================
// MENSAGENS — toda mensagem recebida passa por aqui
// ============================================================
client.on('message', async (msg) => {
  try {
    const comando = msg.body.toLowerCase().trim();

    // --------------------------------------------------------
    // DETECTOR DE ONE PIECE
    // Detecta qualquer variação: "one piece", "OnePiece",
    // "ONEPIECE", "one  piece", etc.
    // Fica antes dos comandos para funcionar em qualquer mensagem
    // --------------------------------------------------------
    if (/one\s*piece/i.test(msg.body)) {
      await msg.reply('Você é tchola');
      return;
    }

    // Se não for o comando certo, ignora
    if (comando !== '!uga-stick') return;

    // --------------------------------------------------------
    // !UGA-STICK — converte imagem ou GIF em figurinha
    // --------------------------------------------------------
    if (!msg.hasMedia) {
      await msg.reply('⚠️ Envie uma *imagem* ou *GIF* junto com o comando !uga-stick');
      return;
    }

    await msg.reply('⏳ Convertendo para figurinha...');

    // Baixa a mídia da mensagem
    const media = await msg.downloadMedia();

    if (!media) {
      await msg.reply('❌ Não consegui baixar a imagem. Tente novamente.');
      return;
    }

    // Verifica se o formato é aceito
    const tiposAceitos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!tiposAceitos.includes(media.mimetype)) {
      await msg.reply('❌ Formato não suportado. Envie JPG, PNG, GIF ou WEBP.');
      return;
    }

    // --------------------------------------------------------
    // Processa a imagem com sharp:
    // - Redimensiona para 512x512 (exigido pelo WhatsApp)
    // - Converte para WebP (formato de figurinha)
    // - Suporta GIFs animados com { animated: true }
    // --------------------------------------------------------
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

    // Cria o objeto de mídia e envia como figurinha
    const sticker = new MessageMedia(
      'image/webp',
      stickerBuffer.toString('base64'),
      'sticker.webp'
    );

        if (comando.startsWith('!uga-video')) {

    // Pega a URL que vem depois do comando
    // Ex: "!uga-video https://www.instagram.com/reel/abc123"
    const url = msg.body.split(' ')[1];

    if (!url) {
        await msg.reply('⚠️ Envie o link junto! Ex: *!uga-video https://instagram.com/...*');
        return;
    }

    await msg.reply('⏳ Baixando vídeo...');

    const caminhoVideo = `./video_${Date.now()}.mp4`;

    // yt-dlp baixa o vídeo e salva no servidor
    await ytDlp.execPromise([
        url,
        '-o', caminhoVideo,   // caminho de saída
        '--no-playlist',       // não baixa playlists inteiras
        '-f', 'best[ext=mp4]' // melhor qualidade em MP4
    ]);

    // Lê o arquivo baixado e converte para base64 para enviar
    const videoBuffer = fs.readFileSync(caminhoVideo);
    const videoMedia = new MessageMedia(
        'video/mp4',
        videoBuffer.toString('base64'),
        'video.mp4'
    );

    await msg.reply(videoMedia);

    // Deleta o arquivo do servidor após enviar para não acumular lixo
    fs.unlinkSync(caminhoVideo);
    }

    await msg.reply(sticker, null, { sendMediaAsSticker: true });
    console.log(`✅ Figurinha enviada para: ${msg.from}`);

  } catch (erro) {
    console.error('❌ Erro:', erro);
    await msg.reply('❌ Ocorreu um erro. Tente novamente!');
  }
});





// ============================================================
// DESCONECTADO — tenta reconectar automaticamente após 5s
// ============================================================
client.on('disconnected', (reason) => {
  console.log('⚠️ Desconectado:', reason);
  setTimeout(() => client.initialize(), 5000);
});

// ============================================================
// KEEP ALIVE — servidor HTTP para o Render não hibernar
// O UptimeRobot bate nessa URL a cada 5 min mantendo o bot vivo
// ============================================================
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('🤖 Bot rodando!');
}).listen(process.env.PORT || 3000, () => {
  console.log(`🌐 Keep-alive rodando na porta ${process.env.PORT || 3000}`);
});

client.initialize();
