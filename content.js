let commands = {};
let isLoaded = false;

//Função para loadar os comandos que estão no storage do chrome e foram criados lá no popup.js
async function carregarComandos(){
    try{
        const load = await chrome.storage.sync.get(['quickCommands']);
        if (load.quickCommands){
            commands = load.quickCommands;
            isLoaded = true;
        }

    }catch(err){
        console.log(err);
    }
}

function replaceComandos(text, cursorPosition){
    const textBeforeCursor = text.substring(0, cursorPosition); //Pega o texto que está da posiçao 0 até o cursor
    //no fim da frase, ou seja se o trigger for /bomdia ele vai pegar o /bomdia completo
    const match = textBeforeCursor.match(/\/(\w+)$/);
    //Verifica se o texto antes do cursor possui a barra, pega os dígitos do texto e no fim garante que o comando está
    //no final da linha a partir do $, tudo isso feito a partir de regex

    if (!match) return null; //Se o comando não tiver de acordo com a leitura do regex retorna nulo, ou seja, se não
    //tiver a barra retorna null

    const commandTrigger = match[1].toLowerCase(); //o regex cria um array com as correspondências, no caso
    //se o comando foi /bomdia ele cria um array com a posição 0 sendo o texto completo, no caso /bomdia, e cria na
    //posição 1 o texto sem a barra, no caso apenas bomdia
    const startPosition = cursorPosition - match[0].length;
    //Gera a posição de start tirando a posição do cursor que no caso é no fim menos o length da posição 0

    //Se identifica o comando na lista de commands
    if (commands[commandTrigger]) {
        return {
            newText: text.substring(0, startPosition) + commands[commandTrigger] + text.substring(cursorPosition),
            //Constrói novo texto pegando a posição vazia inicial + texto + posição vazia no final
            newCursorPos: startPosition + commands[commandTrigger].length,
            //Poe o cursor no fim da nova mensagem
            commandUsed: commandTrigger
            //Registra qual foi o comando usado
        };
    }

    return null;
}

///////////////////////////
//O element das 3 funções abaixo é definido lá nos eventlisteners
//////////////////////////

function realizarTroca(element,replacement){
    const valorAntigo = element.value; //Pega o texto antigo que estava na tela
    element.value = replacement.newText; //Substitui no elemento o valor pelo novo texto, ou seja, o texto
    //atrelado ao comando

    //Joga o cursor no final
    element.setSelectionRange(replacement.newCursorPos, replacement.newCursorPos);

    //Dispara eventos de notificação a frameworks, importante para casos em que se usa react por exemplo
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));

    console.log(`✅ Comando /${replacement.commandUsed} substituído!`);
}

function handleInputElement(element,event){
    if (!isLoaded || Object.keys(commands).length === 0){ //Verifica se está loadado ou se os commands estão vazios
        return;
    }

    //Detecta a posição inicial a partir do selectionStart, um componente da interface HTMLTextAreaElement, representa
    // o primeiro index do texto selecionado
    const cursorPosition = element.selectionStart;

    //Faz o replace de comandos passando no que seria o text o valor do element,que no caso é o texto que está
    //no input ou textarea e também passando a cursorPosition
    const replacement = replaceComandos(element.value,cursorPosition);

    //Se tem algo no replacement, invoca a função realizarTroca que troca jogando o element pelo novo element
    //definido acima
    if(replacement){
        setTimeout(()=>{
            realizarTroca(element,replacement);
        }, 10);
    }
}

//Trata elementos contentEditable (WhatsApp Web, etc)
function handleContentEditableElement(element, event) {
    if (!isLoaded || Object.keys(commands).length === 0){
        return;
    }

    const selection = window.getSelection();
    if (selection.rangeCount === 0){
        return;
    }

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE){
        return;
    }

    const cursorPosition = range.startOffset;
    const replacement = replaceComandos(textNode.textContent, cursorPosition);

    if (replacement) {
        setTimeout(() => {
            // Substitui texto no nó
            textNode.textContent = replacement.newText;

            // Reposiciona cursor
            const newRange = document.createRange();
            newRange.setStart(textNode, replacement.newCursorPos);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);

            // Dispara evento para notificar mudança
            element.dispatchEvent(new Event('input', {bubbles: true}));

            console.log(`✅ Comando /${replacement.commandUsed} substituído em contentEditable!`);
        }, 10);
    }
}

// Adiciona listeners para detectar digitação
function addEventListeners() {
    // Para input/textarea tradicionais
    document.addEventListener('input', (event) => {
        const element = event.target;
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            handleInputElement(element, event);
        }
    }, true);

    // Para elementos contentEditable (WhatsApp Web, Discord, etc)
    document.addEventListener('input', (event) => {
        const element = event.target;
        if (element.contentEditable === 'true') {
            handleContentEditableElement(element, event);
        }
    }, true);

    console.log('🎯 Event listeners adicionados para detectar comandos');
}

// Escuta mensagens do popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'COMMANDS_UPDATED') {
        commands = message.commands || {};
        isLoaded = true;
        console.log('🔄 Comandos atualizados via popup:', Object.keys(commands).length, 'comandos');
        sendResponse({ success: true });
    }
});

// =============================================
// INICIALIZAÇÃO
// =============================================

// Inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

async function initialize() {
    console.log('🚀 Assistente de Atendimento iniciado na página:', window.location.hostname);

    await carregarComandos();
    addEventListeners();

    // Observa mudanças no DOM para elementos adicionados dinamicamente
    const observer = new MutationObserver((mutations) => {
        // Reativa listeners se necessário (para SPAs)
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Elementos foram adicionados, listeners já estão globais
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}





