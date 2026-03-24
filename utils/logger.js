module.exports = function log(tipo, msg) {
  const agora = new Date().toLocaleTimeString();

  const cores = {
    SYSTEM: '\x1b[36m',
    SUCCESS: '\x1b[32m',
    ERROR: '\x1b[31m'
  };

  const reset = '\x1b[0m';

  if (!cores[tipo]) return;

  console.log(`${cores[tipo]}[${agora}] [${tipo}] ${msg}${reset}`);
};