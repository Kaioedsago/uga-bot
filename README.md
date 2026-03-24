# Uga Bot 🦎

Um bot multifuncional para WhatsApp, construído com Node.js que por enquanto só cria figurinhas mas a ideia é escalar até ele ser "BEM" mais funcional.

---

## 🚀 Sobre o Projeto

Uga Bot só teve o estopim de criação com a dificuldade dos apps de figurinhas com anuncios e etc, a ideia é que futuramente ele crie figurinhas, baixe audios e muito mais.

A arquitetura foi pensada para ser modular, facilitando a adição de novos comandos e recursos no futuro.

---

## ✨ Funcionalidades Atuais

- [x] **Criação de Figurinhas (Stickers)**
  - **Método 1 (Responder):** Responda a uma imagem, GIF ou vídeo com o comando `uga-stick`.
  - **Método 2 (Legenda):** Envie uma imagem, GIF ou vídeo diretamente com a legenda `uga-stick`.

---

## 🗺️ Planos Futuros (Roadmap)

A visão para o Uga Bot é transformá-lo em um assistente completo. As próximas funcionalidades planejadas incluem:

- [x] Baixar músicas e vídeos do YouTube.
- [ ] Fazer pesquisas em plataformas como a Wikipedia.
- [ ] Buscar letras de músicas.
- [ ] Criar enquetes personalizadas.
- [ ] Gerenciar tarefas e lembretes para grupos.
- [ ] *Sugestões são sempre bem-vindas.*

---

## 🛠️ Como Usar (Para Desenvolvedores)

Siga os passos abaixo para rodar sua própria instância do Uga Bot.

#### Pré-requisitos
* **Node.js v20+**.

#### Instalação
1. Clone o repositório:
   ```bash
   git clone [https://github.com/SEU_USUARIO/uga-bot.git](https://github.com/SEU_USUARIO/uga-bot.git)
   Entre no diretório do projeto:

2. cd uga-bot
Instale as dependências:

3. npm install
Inicie o bot:

4. node index.js
Escaneie o QR Code gerado no terminal com o número de WhatsApp que será o bot.

#### 💻 Tecnologias Utilizadas
* **Node.js**

* **whatsapp-web.js**

* **yt-dlp-wrap**

