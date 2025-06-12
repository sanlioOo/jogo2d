// script.js

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Carregamento de Imagens
const background = new Image();
background.src = "assets/background1.png";

const background2 = new Image();
background2.src = "assets/background2.png"; // segunda imagem de fundo

const player = new Image();
player.src = "assets/player.png";

const ouroBranco = new Image();
ouroBranco.src = "assets/sushi.png";

const barraOuro = new Image();
barraOuro.src = "assets/sushi.png";

const bomba = new Image();
bomba.src = "assets/spider.png";

const playerParado = new Image();
playerParado.src = "assets/player.png";

const playerPasso1 = new Image();
playerPasso1.src = "assets/player2.png";

const playerPasso2 = new Image();
playerPasso2.src = "assets/player2.png";

const gatoPasso0 = new Image();
gatoPasso0.src = "assets/dog.png";

const gatoPasso1 = new Image();
gatoPasso1.src = "assets/dog2.png";

const gatoPasso2 = new Image();
gatoPasso2.src = "assets/dog2.png"; // **CORRIGIDO: Era gatoPassos2, deve ser gatoPasso2**

const bgWidth = canvas.width;
const bgHeight = canvas.height;

let bgX = 0;
const bgSpeed = 4;

// Variáveis do personagem e do jogo
let mapX = 0;
const playerX = canvas.width / 2 - 40;
let playerY = 235;
const playerWidth = 70;
const playerHeight = 90;
let frameAtual = 0;
let contadorFrames = 0;
const velocidadeAnimacao = 5;

// Pulo
let velocityY = 0;
const gravity = 0.5;
const jumpStrength = 12;
const groundY = 235;
let canJump = true;

// Controle
let keys = {};

// Pontuação e nível
let score = 0;
let nivel = 1;
let ourosParaProximoNivel = 10;

// Tamanhos dos itens
const ouroBrancoSize = 60;
const barraOuroSize = 100;

// Listas de itens
let ourosBrancos = [gerarOuroBranco(), gerarOuroBranco(), gerarOuroBranco(), gerarOuroBranco()];
let barrasOuro = [];

// Obstáculos
let obstaculos = [];
let velocidadeObstaculo = 4;

// Variáveis para animação do gato
let frameGatoAtual = 0;
let contadorFramesGato = 0;
const velocidadeAnimacaoGato = 10;
const gatoX = 300;
const gatoY = 270;
const gatoWidth = 50;
const gatoHeight = 50;

// Variável de estado do jogo
let gameState = "playing";

// --- Funções do jogo ---

function gerarOuroBranco() {
    return {
        x: mapX + canvas.width + Math.random() * 1000,
        y: Math.random() > 0.5 ? 235 : 150,
        collected: false,
    };
}

function gerarBarraOuro() {
    return {
        x: mapX + canvas.width + Math.random() * 1000,
        y: Math.random() > 0.5 ? 235 : 150,
        collected: false,
    };
}

function gerarObstaculo() {
    return {
        x: mapX + canvas.width + Math.random() * 800,
        y: Math.random() > 0.5 ? 235 : 150,
        size: 40,
    };
}

// Função para colisão circular (caixa do player x círculo da bomba)
function checarColisaoCircular(px, py, pw, ph, cx, cy, cr) {
    const closestX = Math.max(px, Math.min(cx, px + pw));
    const closestY = Math.max(py, Math.min(cy, py + ph));
    const distanceX = cx - closestX;
    const distanceY = cy - closestY;
    const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    return distanceSquared < (cr * cr);
}

// Resetar o jogo quando colidir com obstáculo
function resetGame() {
    score = 0;
    nivel = 1;
    ourosParaProximoNivel = 10;
    mapX = 0;
    velocidadeObstaculo = 4;
    ourosBrancos = [gerarOuroBranco(), gerarOuroBranco(), gerarOuroBranco(), gerarOuroBranco()];
    barrasOuro = [];
    obstaculos = [gerarObstaculo()];
    playerY = groundY;
    velocityY = 0;
    canJump = true;
    gameState = "playing";
}

// Função para desenhar a pontuação e o nível
function drawScoreAndLevel() {
    ctx.font = "20px 'Press Start 2P'";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "green";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    const texto1 = `Sushi: ${score}/${ourosParaProximoNivel}`;
    const texto2 = `Nível ${nivel}`;

    ctx.strokeText(texto1, 20, 50);
    ctx.fillText(texto1, 20, 50);

    ctx.strokeText(texto2, 20, 80);
    ctx.fillText(texto2, 20, 80);
}


// Função para exibir a tela de Game Over
function gameOverScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, bgWidth, bgHeight);

    ctx.save(); // Salva o estado do contexto

    ctx.font = "40px 'Press Start 2P'";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const gameOverText = "GAME OVER";
    const restartText = "RESTART";

    ctx.strokeText(gameOverText, canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText(gameOverText, canvas.width / 2, canvas.height / 2 - 50);

    ctx.font = "25px 'Press Start 2P'";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "green";

    const buttonX = canvas.width / 2;
    const buttonY = canvas.height / 2 + 50;

    ctx.strokeText(restartText, buttonX, buttonY);
    ctx.fillText(restartText, buttonX, buttonY);

    ctx.restore(); // Restaura o estado do contexto

    // Não adicionamos mais o listener aqui, ele é adicionado uma única vez no final do script
    drawScoreAndLevel();
}

// Handler de clique para a tela de Game Over (único listener no document)
function handleGameOverClick(event) {
    if (gameState !== "gameOver") { // Só age se o jogo estiver em Game Over
        return;
    }

    // Calcula as coordenadas do clique em relação ao canvas, ajustando para escala
    const rect = canvas.getBoundingClientRect(); // Pega as dimensões e posição do canvas na tela
    const scaleX = canvas.width / rect.width;   // Fator de escala X: largura interna / largura visível
    const scaleY = canvas.height / rect.height; // Fator de escala Y: altura interna / altura visível

    const mouseX = (event.clientX - rect.left) * scaleX; // Ajusta a coordenada X do clique
    const mouseY = (event.clientY - rect.top) * scaleY;   // Ajusta a coordenada Y do clique

    // Coordenadas do botão RESTART (permanecem as mesmas, pois são relativas ao canvas.width/height)
    ctx.font = "25px 'Press Start 2P'";
    const restartText = "RESTART";
    const textWidth = ctx.measureText(restartText).width;
    const textHeight = 25; // Aproximar a altura do texto com base no tamanho da fonte

    const buttonX = canvas.width / 2;
    const buttonY = canvas.height / 2 + 50;

    const clickPadding = 20;
    const buttonLeft = buttonX - textWidth / 2 - clickPadding;
    const buttonRight = buttonX + textWidth / 2 + clickPadding;
    const buttonTop = buttonY - textHeight / 2 - clickPadding;
    const buttonBottom = buttonY + textHeight / 2 + clickPadding;

    // Verifica se o clique foi dentro da área do botão
    if (mouseX >= buttonLeft && mouseX <= buttonRight &&
        mouseY >= buttonTop && mouseY <= buttonBottom) {
        resetGame();
        gameLoop();
    }
}


// Controle de teclas
window.addEventListener("keydown", (e) => {
    if (gameState === "playing") {
        keys[e.key] = true;
        if ((e.key === "ArrowUp" || e.key === " ") && canJump) {
            velocityY = -jumpStrength;
            canJump = false;
        }
    }
});

window.addEventListener("keyup", (e) => {
    if (gameState === "playing") {
        keys[e.key] = false;
    }
});

// Função para desenhar o gato animado (agora sem a lógica de atualização de frame aqui)
function desenharGato() {
    let imagemGato;
    // O frameGatoAtual será atualizado fora desta função agora.
    if (frameGatoAtual === 0) imagemGato = gatoPasso0;
    else if (frameGatoAtual === 1) imagemGato = gatoPasso1;
    else imagemGato = gatoPasso2; // **CORRIGIDO: Era gatoPassos2, deve ser gatoPasso2**

    ctx.drawImage(imagemGato, gatoX, gatoY, gatoWidth, gatoHeight);
}

// Loop do jogo
function gameLoop() {
    if (gameState === "playing") {
        // Movimento do mapa
        let isMoving = false; // Flag para verificar se o player está se movendo
        if (keys["ArrowRight"] || keys["d"]) {
            mapX += bgSpeed;
            isMoving = true;
        }
        if (keys["ArrowLeft"] || keys["a"]) {
            mapX -= bgSpeed;
            if (mapX < 0) mapX = 0; // não deixar voltar além do início
            isMoving = true;
        }

        // Gravidade
        velocityY += gravity;
        playerY += velocityY;

        if (playerY > groundY) {
            playerY = groundY;
            velocityY = 0;
            canJump = true;
        }

        // Limpar tela
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Escolher background de acordo com o nível
        const currentBackground = nivel === 1 ? background : background2;

        // Movimento do fundo
        bgX = -mapX % bgWidth;

        // Desenhar fundo em looping
        ctx.drawImage(currentBackground, bgX, 0, bgWidth, bgHeight);
        ctx.drawImage(currentBackground, bgX + bgWidth, 0, bgWidth, bgHeight);
        ctx.drawImage(currentBackground, bgX - bgWidth, 0, bgWidth, bgHeight);

        // Desenhar ouros brancos
        ourosBrancos.forEach(o => {
            if (!o.collected) {
                const screenX = o.x - mapX;
                ctx.drawImage(ouroBranco, screenX, o.y, ouroBrancoSize, ouroBrancoSize);
            }
        });

        // Desenhar barras de ouro
        barrasOuro.forEach(b => {
            if (!b.collected) {
                const screenX = b.x - mapX;
                ctx.drawImage(barraOuro, screenX, b.y, barraOuroSize, barraOuroSize);
            }
        });

        // Atualizar e desenhar obstáculos
        obstaculos.forEach((obs, index) => {
            obs.x -= velocidadeObstaculo;
            const screenX = obs.x - mapX;
            ctx.drawImage(bomba, screenX, obs.y, obs.size, obs.size);

            const cx = screenX + obs.size / 2;
            const cy = obs.y + obs.size / 2;
            const cr = obs.size / 2;

            if (checarColisaoCircular(playerX, playerY, playerWidth, playerHeight, cx, cy, cr)) {
                gameState = "gameOver";
            }

            if (screenX + obs.size < 0) {
                obstaculos.splice(index, 1);
                obstaculos.push(gerarObstaculo());
            }
        });

        // Verificar coleta dos ouros brancos
        ourosBrancos.forEach(o => {
            if (!o.collected) {
                const screenX = o.x - mapX;
                if (
                    playerX < screenX + ouroBrancoSize &&
                    playerX + playerWidth > screenX &&
                    playerY < o.y + ouroBrancoSize &&
                    playerY + playerHeight > o.y
                ) {
                    o.collected = true;
                    score += 1;
                    ourosBrancos.push(gerarOuroBranco());

                    if (score >= ourosParaProximoNivel) {
                        nivel++;
                        ourosParaProximoNivel += 10;
                        velocidadeObstaculo += 1;
                    }
                }
            }
        });

        // Verificar coleta das barras de ouro
        barrasOuro.forEach(b => {
            if (!b.collected) {
                const screenX = b.x - mapX;
                if (
                    playerX < screenX + barraOuroSize &&
                    playerX + playerWidth > screenX &&
                    playerY < b.y + barraOuroSize &&
                    playerY + playerHeight > b.y
                ) {
                    b.collected = true;
                    score += 5;
                    barrasOuro.push(gerarBarraOuro());

                    if (score >= ourosParaProximoNivel) {
                        nivel++;
                        ourosParaProximoNivel += 10;
                        velocidadeObstaculo += 1;
                    }
                }
            }
        });

        // Desenhar o personagem animado e Lógica de animação do Gato
        let imagemPersonagem;

        if (isMoving) { // Se o player está se movendo (teclas ArrowRight/d ou ArrowLeft/a pressionadas)
            contadorFrames++;
            if (contadorFrames >= velocidadeAnimacao) {
                contadorFrames = 0;
                frameAtual = (frameAtual + 1) % 3;
            }
            if (frameAtual === 0) imagemPersonagem = playerParado;
            else if (frameAtual === 1) imagemPersonagem = playerPasso1;
            else imagemPersonagem = playerPasso2;

            // Lógica de animação do gato: move os frames se o jogador estiver se movendo
            contadorFramesGato++;
            if (contadorFramesGato >= velocidadeAnimacaoGato) {
                contadorFramesGato = 0;
                frameGatoAtual = (frameGatoAtual + 1) % 3; // Anima o gato
            }

        } else { // Se o player está parado
            imagemPersonagem = playerParado;
            frameAtual = 0; // Opcional: faz o player parar no primeiro frame de parado
            // Gato parado: definir para o primeiro frame (gatoPasso0)
            frameGatoAtual = 0; // O gato também para de animar
        }

        ctx.drawImage(imagemPersonagem, playerX, playerY, playerWidth, playerHeight);

        // Desenhar o gato animado (a lógica de frame agora está na condição acima)
        desenharGato(); // Apenas chama a função para desenhar o frame atual

        drawScoreAndLevel();

        requestAnimationFrame(gameLoop);
    } else if (gameState === "gameOver") {
        gameOverScreen();
    }
}

// --- Código de inicialização e eventos DOM (este bloco fica no final) ---

const fullscreenButton = document.getElementById("fullscreenButton");

// Certifique-se de que o botão existe antes de adicionar o listener
if (fullscreenButton) {
    fullscreenButton.addEventListener("click", () => {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
        }
    });
} else {
    console.error("Botão de tela cheia não encontrado! Verifique o ID 'fullscreenButton' no HTML.");
}

// Adicione o listener de clique no 'document', mais robusto para tela cheia
document.addEventListener("click", handleGameOverClick);


// Inicia o jogo
resetGame();
gameLoop();