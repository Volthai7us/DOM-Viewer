chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.contentScriptQuery == 'postData') {
        const formdata = new URLSearchParams()
        formdata.append('language', request.language)
        let url
        if (request.db_check) {
            url =
                'https://ms-ozturkoglu.jotform.dev/intern-api/ai-translate/db-check'
            for (let i = 0; i < request.input.length; i++) {
                formdata.append(`input[${i}]`, request.input[i])
            }
        } else if (request.translate) {
            url =
                'https://ms-ozturkoglu.jotform.dev/intern-api/ai-translate/translate'
            formdata.append('input', request.input)
        }

        fetch(url, {
            method: 'POST',
            body: formdata,
        })
            .then((response) => response.json())
            .then((data) => {
                sendResponse(data)
            })
            .catch((error) => {
                console.log(error)
            })

        return true
    }
})
