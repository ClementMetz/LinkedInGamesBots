// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installée et prête.");
});

chrome.action.onClicked.addListener((tab) => {
    // Vérifiez que l'onglet est valide et qu'il peut recevoir le script
    console.log("Bonjour")
    if (tab.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("file://")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.log("Erreur lors de l'injection du script de contenu :", chrome.runtime.lastError);
            } else {
                console.log("Script de contenu injecté.");
            }
        });
    } else {
        console.log("L'onglet ne permet pas l'injection de script.");
    }
});
