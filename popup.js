let commands = {}

async function checarPrimeiraVisita(){
    try{
        const primeiraVisita = await chrome.storage.sync.get(['hasVisited']) //Pega a info se ja visitou no storage do Chrome
        return !primeiraVisita.hasVisited; //Verifica com true ou false
        //EX: se visitou = false o ! transforma a primeiraVisita em true, indicando que é a primeira visita
        //    se visitou = true o ! transforma o primeiraVisita em false
    }catch(error){
        console.error("Erro ao verificar primeira visita",error);
        return true;
    }
}

async function definirVisita(){
    try{
        await chrome.storage.sync.set({hasVisited: true}); //Marca o hasVisited como true
    }catch(error){
        console.error("Erro ao marcar primeira visita",error);
    }
}

//ADICIONA OS COMANDOS PLACEHOLDER/EXEMPLO PARA O PRIMEIRO USO
async function comandosExemplo(){
    const primeiraVisita = await checarPrimeiraVisita(); //Confere primeiro se é o primeiro uso ou não do user

    if(primeiraVisita && Object.keys(commands) === 0){ //Se primeira visita for true e os comandos estiverem vazios
        commands = { //Adiciona aos comandos os comandos abaixo
            'bomdia': 'Bom dia, tudo bem?! Como posso ajudar?',
            'boatarde': 'Boa tarde, tudo bem?! Como posso ajudar?',
            'boanoite': 'Boa noite, tudo bem?! Como posso ajudar?',
            'fimdia': 'Por nada, precisando estaremos a disposição. Tenha um bom dia e bom trabalho!',
            'fimtarde': 'Por nada, precisando estaremos a disposição. Tenha uma boa tarde e bom trabalho!',
            'fimnoite': 'Por nada, precisando estaremos a disposição. Tenha uma boa noite e bom trabalho!',
            'encerrardia': 'O chamado será encerrado, caso ainda precise de auxílio estaremos a disposição, tenha um bom dia e bom trabalho!',
            'encerrartarde': 'O chamado será encerrado, caso ainda precise de auxílio estaremos a disposição, tenha uma boa tarde e bom trabalho!',
            'encerrarnoite': 'O chamado será encerrado, caso ainda precise de auxílio estaremos a disposição, tenha uma boa noite e bom trabalho!',
        };

        await salvarComandos(); //Salva os comandos
        await definirVisita(); //Após salvar os comandos define que o user já fez a primeira visita dele
        renderizarComandos(); //Renderiza os comandos na tela
        showStatus('Comandos adicionados com sucesso!');
    }
}



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

    if (commandKeys.length === 0){ //Se não houver comandos gera o html abaixo indicando tabela de comandos vazia
        container.innerHTML = ` 
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <p>Nenhum comando criado ainda.<br>Adicione seu primeiro comando acima!</p>
            </div>
        `;
        return;
    }

    //Caso identifique comandos, mapeia o array de commands com o map(), vincula a uma variável trigger, que irá pegar as keys
    //dos comandos e gera um html colocando como título do comando a variável trigger (key) e como descrição do comando
    //o value referente a cada key -> /${commands[trigger]}
    //no fim da join em tudo como uma string única para display adequado
    //OBS: o map roda para item, ou seja, para cada trigger e gera a div para cada um deles
    container.innerHTML = commandKeys.map(trigger => `
    <div class ="comando">
        <div class="comando-info">
            <div class="comando-name">/${trigger}</div>
            <div class="comando-description">${commands[trigger]}</div>
        </div>
        <button class="comando-delete" onclick="deleteCommand('${trigger}')" title="Excluir comando">×</button>
    </div>
    
    `).join('')

}
