const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const http = require('http');

const log = require('./utils/logger');
const handleSticker = require('./commands/sticker');

// ==========================
// CLIENT CONFIG
// ==========================
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: '.wwebjs_auth'
  }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
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
// EVENTS
// ==========================
client.on('qr', (qr) => {
  console.log('\n📱 Escaneie o QR Code:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  log('SYSTEM', 'Bot conectado!');
});

client.on('disconnected', (reason) => {
  log('ERROR', `Desconectado: ${reason}`);
  setTimeout(() => client.initialize(), 5000);
});

// ==========================
// MESSAGES
// ==========================
client.on('message_create', async (msg) => {
  try {
    const texto = msg.body.toLowerCase().trim();

    if (msg.fromMe && !texto.startsWith('uga-')) return;

    // Easter egg
    if (/one\s*piece/i.test(texto)) {
      await msg.reply('Você é tchola');
      return;
    }

    // ==========================
    // ROUTER DE COMANDOS
    // ==========================
    if (texto === 'uga-stick') {
      return handleSticker(msg);
    }

  } catch (err) {
    log('ERROR', err.stack || err);
    await msg.reply('❌ Erro interno');
  }
});

// ==========================
// KEEP ALIVE
// ==========================
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('🤖 Bot rodando!');
}).listen(process.env.PORT || 3000);

// ==========================
client.initialize();