const https = require("https");
const http = require("http");
// 请求接口的option对象
const options = {
    '105': {
        displayName: '测试插件105',
        name: '105',
        url: 'https://154.40.59.105:3006/api/chat-process',
        method: 'POST',
        protocol: 'https',
        type: 'plugin',
        parentMessageId : '',
        conversationId : '',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'Origin': 'https://154.40.59.105:3006',
            'Pragma': 'no-cache',
            'Proxy-Connection': 'keep-alive',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
        },
        body: function (message, parentMessageId) {
            return JSON.stringify({
                prompt: message,
                options: {
                    parentMessageId: parentMessageId
                },
                systemMessage: 'You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: 2023-03-29',
                temperature: 0.8,
                top_p: 1,
            })
        },
        fn: function (controller,event,messages, message) {
            const opt = Object.assign({
                method: this.method,
                headers: this.headers,
            }, {
                signal: controller.signal,
            });

            let req = null

            const httpCallBack = (res) => {
                let data = '';
                let reply = ''
                let endJson = {}
                res.on('data', (chunk) => {
                    try {
                        data += chunk;
                        let strings = data.split('&KFw6loC9Qvy&');
                        if (strings.length > 1) {
                            reply = strings[1]
                        }else if (strings.length > 2){
                            endJson = JSON.parse(strings[2])
                        }
                        console.log(reply);
                        event.sender.send('reply', reply)

                    } catch (e) {
                        console.error(e)
                    }
                });
                res.on('end', () => {
                    try {
                        this.parentMessageId = endJson.id
                        if (endJson.conversationId){
                            this.conversationId = endJson.conversationId
                        }
                        messages.push({"role": "assistant", "content": reply})
                        event.sender.send('reply', reply + '\n**end**')
                    } catch (e) {
                        console.error(e)
                    }

                });
                req.on('error', (error) => {
                    // 判断如果是取消
                    if (error.name === 'AbortError') {
                        console.log('请求被取消了')
                        event.sender.send('reply', data + '\n**end**')
                        return
                    }
                    console.error(error);
                });
            }
            if ("https" === this.protocol) {
                req = https.request(this.url, opt, httpCallBack);
            } else {
                req = http.request(this.url, opt, httpCallBack);
            }
            const postData = this.body(message, this.parentMessageId,this.conversationId);

            req.write(postData);
            req.end();
        },
        testSpeedFn: function (callback) {
            const opt = {
                method: this.method,
                headers: this.headers,
            };

            let req = null
            const start = new Date().getTime();
            const httpCallBack = (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    try {
                        data += chunk;

                    } catch (e) {
                        console.error(e)
                    }
                });
                res.on('end', () => {
                    try {
                        const end = new Date().getTime();
                        const time = end - start;
                        callback(time, res)
                    } catch (e) {
                        console.error(e)
                    }

                });
                req.on('error', (error) => {
                    // 判断如果是取消
                    callback(null, res)
                    console.error(error);
                });
            }
            if ("https" === this.protocol) {
                req = https.request(this.url, opt, httpCallBack);
            } else {
                req = http.request(this.url, opt, httpCallBack);
            }
            const postData = this.body('你好', '','');
            req.write(postData);
            req.end();
        },
        testSpeed: 1,
    }
};


module.exports = {
    options: options,
};
