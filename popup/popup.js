// document.addEventListener('DOMContentLoaded', function () {
//     chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
//         var activeTab = tabs[0]
//         console.log(tabs)
//         chrome.tabs.sendMessage(activeTab.id, { action: 'fetch' })
//     })
// })

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     const tracker = document.getElementById('tracker')
//     const spanNode = document.createElement('span')
//     spanNode.innerHTML = request
//     tracker.appendChild(spanNode)
// })

let id
let candidateNumber = 0

document.addEventListener('DOMContentLoaded', function () {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        var activeTab = tabs[0]
        console.log(tabs)
        id = activeTab.id
        chrome.tabs.sendMessage(activeTab.id, { action: 'fetch' })
    })

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'sync') {
            candidateNumber = request.candidateNumber
            language = request.language
            document.getElementById('candidateNumber').innerHTML =
                candidateNumber
            document.getElementById('jfFooterLanguage').value = language
        }
    })

    document
        .getElementById('jfFooterLanguage')
        .addEventListener('change', function () {
            sendLanguage(this.value)
        })
    document.getElementById('translate').addEventListener('click', function () {
        chrome.tabs.sendMessage(id, { action: 'translate' })
    })
})

function sendLanguage(language) {
    chrome.tabs.sendMessage(id, {
        action: 'language',
        language: language,
    })
}
