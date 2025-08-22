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
    //se o comando foi /bom dia ele cria um array com a posição 0 sendo o texto completo, no caso /bomdia, e cria na
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
