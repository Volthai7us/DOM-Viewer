const tracker = document.getElementById('tracker')

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // while (tracker.firstChild) {
    //     tracker.removeChild(tracker.firstChild)
    // }

    // console.log(request)

    // const texts = request

    // for (let i = 0; i < texts.length; i++) {
    //     const textNode = document.createTextNode(texts[i])
    //     tracker.appendChild(textNode)
    // }

    const textNode = document.createTextNode(request)
    tracker.appendChild(textNode)
})
