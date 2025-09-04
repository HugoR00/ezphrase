// Quando a extensão é instalada/atualizada
chrome.runtime.onInstalled.addListener((details) => {
    console.log('🎉 Assistente de Atendimento instalado!');

    if (details.reason === 'install') {
        // Primeira instalação
        console.log('✨ Primeira instalação da extensão');

        // Abre página de boas-vindas (opcional)
        // chrome.tabs.create({ url: 'welcome.html' });

    } else if (details.reason === 'update') {
        // Atualização da extensão
        console.log('🔄 Extensão atualizada para versão:', chrome.runtime.getManifest().version);
    }
});

// =============================================
// COMUNICAÇÃO ENTRE SCRIPTS
// =============================================

// Escuta mensagens de outros scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Mensagem recebida no background:', message);

    // Aqui você pode adicionar lógica para diferentes tipos de mensagem
    switch (message.type) {
        case 'GET_COMMANDS':
            // Retorna comandos salvos se necessário
            chrome.storage.sync.get(['quickCommands']).then((result) => {
                sendResponse({ commands: result.quickCommands || {} });
            });
            return true; // Indica resposta assíncrona

        case 'LOG_USAGE':
            // Log de uso de comandos (opcional para estatísticas)
            console.log('📊 Comando usado:', message.command);
            break;

        default:
            console.log('❓ Tipo de mensagem desconhecido:', message.type);
    }
});

// =============================================
// GERENCIAMENTO DE STORAGE
// =============================================

// Monitora mudanças no storage (opcional)
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.quickCommands) {
        console.log('💾 Comandos alterados no storage');

        // Notifica todas as abas ativas sobre mudanças (se necessário)
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'COMMANDS_UPDATED',
                    commands: changes.quickCommands.newValue || {}
                }).catch(() => {
                    // Ignora erros (abas sem content script)
                });
            });
        });
    }
});

// =============================================
// UTILITÁRIOS
// =============================================

// Função para obter estatísticas (opcional)
async function getUsageStats() {
    try {
        const result = await chrome.storage.sync.get(['usageStats']);
        return result.usageStats || {};
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        return {};
    }
}

// Função para limpar dados antigos (opcional)
async function cleanupOldData() {
    try {
        // Remove dados muito antigos se necessário
        const result = await chrome.storage.sync.get();
        console.log('📊 Dados atuais no storage:', Object.keys(result));
    } catch (error) {
        console.error('Erro ao limpar dados:', error);
    }
}

// =============================================
// INICIALIZAÇÃO DO SERVICE WORKER
// =============================================

console.log('🔧 Background service worker iniciado');