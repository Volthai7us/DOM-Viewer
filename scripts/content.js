let observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
        for (let addedNode of mutation.addedNodes) {
            const tag = addedNode.tagName
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK') {
                continue
            }
            sendToPopup(addedNode)
        }
    }
})

const tracker = []

observer.observe(document, { childList: true, subtree: true })

function sendToPopup(data) {
    const dataString = innerHTML(data)
    chrome.runtime.sendMessage(dataString)
}

function innerHTML(node) {
    let allInnerHTML = ''
    allInnerHTML = getAllInnerHTML(node, allInnerHTML)

    return allInnerHTML
}

function getAllInnerHTML(node, allInnerHTML) {
    for (let child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            allInnerHTML += child.nodeValue
        } else {
            getAllInnerHTML(child, allInnerHTML)
        }
    }

    return allInnerHTML
}
