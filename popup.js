let commands = {}

//Salva os comandos no storage do chrome
async function salvarComandos(){
    try{
        await chrome.storage.sync.set({quickCommands : commands}) //Salva tudo que está em commands no quickCommands
        console.log("Comandos salvos com sucesso!")
    }catch (error){
        console.error('Erro ao salvar comandos:', error);
        showStatus('Erro ao salvar comandos!', true);
    }

    //Os comandos são salvos no array quickCommands no formato key/value
    //Caso commands esteja vazio essa função cria comandos iniciais também
}

//Loada as comandos que estão no storage do chrome e verifica se tem ou não
async function carregarComandos(){
    try{
        const retornarComandos = await chrome.storage.sync.get(['quickCommands']); //Pega os key/value que estão em quickCommands
        if (retornarComandos != null){ //Checa se quickCommands está nulo ou não
            commands = retornarComandos.quickCommands; //Vincula a commands o que estava em quickCommands
            renderizarComandos(); //Renderiza no html os comandos que estão em commands
        }
    }catch (error){
        console.error('Erro ao carregar comandos:', error);
        showStatus('Erro ao carregar comandos!', true);
    }
}

function renderizarComandos(){
    const container = document.getElementById('commandsList');
    const commandKeys = Object.keys(commands); //Retorna as keys dos key-value pair, ou seja, somente o "nome" do comando

    if (commandKeys.length === 0){
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <p>Nenhum comando criado ainda.<br>Adicione seu primeiro comando acima!</p>
            </div>
        `;
        return;
    }


}