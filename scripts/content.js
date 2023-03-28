let language = 'tr-TR'
let translateCandidate = []

let observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
        if (mutation.type === 'childList') {
            for (let node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    update(node)
                }
            }
        }
    }
})

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        update(document)
    })
} else {
    update(document)
}

observer.observe(document, { childList: true, subtree: true })

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'language') {
        language = request.language
        update(document)
        translateCandidate = []
    } else if (request.action === 'fetch') {
        const translateCandidateNumber = translateCandidate.length
        chrome.runtime.sendMessage({
            action: 'sync',
            candidateNumber: translateCandidateNumber,
            language: language,
        })
    } else if (request.action === 'translate') {
        for (let i = 0; i < translateCandidate.length; i++) {
            const element = translateCandidate[i]
            const promise = translate(element.text)
            promise.then((result) => {
                if (result.content == undefined) {
                    result.content = ''
                }
                element.node.textContent = result.content
                element.node.parentNode.querySelector(
                    'input[name="translate_checkbox"]',
                ).checked = false
                console.log(result)
            })
        }

        translateCandidate = []
    }

    return true
})

async function db_check(input) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                contentScriptQuery: 'postData',
                db_check: true,
                input: input,
                language: language,
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    setTimeout(() => {
                        db_check(input)
                    }, 1000)
                } else {
                    if (response != undefined && response != '') {
                        resolve(response)
                    } else {
                        reject('error')
                    }
                }
            },
        )
    })
}

async function translate(input) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                contentScriptQuery: 'postData',
                translate: true,
                input: input,
                language: language,
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    setTimeout(() => {
                        translate(input)
                    }, 1000)
                } else {
                    if (response != undefined && response != '') {
                        resolve(response)
                    } else {
                        reject('error')
                    }
                }
            },
        )
    })
}

function update(node) {
    const nodes = textNodesUnder(node)
    const text = []
    nodes.map((node) => text.push(node.text))
    var promise = db_check(text)
    promise.then((result) => {
        const not_in_new = result.content['not in new']
        const not_in_properties = result.content['not in properties']

        for (let node of nodes) {
            try {
                if (
                    node.text.trim().length > 0 &&
                    node.class.includes('locale')
                ) {
                    duplicate_check(node)
                    if (not_in_new.includes(node.text)) {
                        not_in_new_handler(node)
                    } else if (not_in_properties.includes(node.text)) {
                        not_in_properties_handler(node)
                    } else {
                        node.node.parentNode.classList.add('in_translated')
                    }
                }
            } catch (e) {
                console.log(e)
            }
        }
    })
}

function not_in_new_handler(node) {
    node.node.parentNode.classList.add('not_in_new')
    if (
        node.node.parentNode.querySelector(
            'input[name="translate_checkbox"]',
        ) == null
    ) {
        node.node.parentNode.addEventListener('click', () => {})
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.name = 'translate_checkbox'
        checkbox.classList.add('translate_checkbox')

        checkbox.addEventListener('click', (e) => {
            e.stopPropagation()
            if (checkbox.checked) {
                checkbox.classList.add('checked')
                translateCandidate.push(node)
            } else {
                checkbox.classList.remove('checked')
                translateCandidate = translateCandidate.filter(
                    (item) => item !== node,
                )
            }
        })
        node.node.parentNode.appendChild(checkbox)
    }
}

function not_in_properties_handler(node) {
    node.node.parentNode.classList.add('not_in_properties')
}

function duplicate_check(node) {
    if (
        node.node.parentNode.querySelector(
            'input[name="translate_checkbox"]',
        ) != null
    ) {
        node.node.parentNode
            .querySelector('input[name="translate_checkbox"]')
            .remove()
    }

    if (node.node.parentNode.classList.contains('not_in_new')) {
        node.node.parentNode.classList.remove('not_in_new')
    }
    if (node.node.parentNode.classList.contains('not_in_properties')) {
        node.node.parentNode.classList.remove('not_in_properties')
    }
}

function textNodesUnder(el) {
    var n,
        a = [],
        walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false)
    while ((n = walk.nextNode())) {
        if (
            typeof n.parentNode.className === 'string' &&
            n.parentNode.className.includes('locale')
        ) {
            a.push({
                node: n,
                text: n.textContent,
                class: n.parentNode.className,
            })
        }
    }
    return a
}
