const https = require("https");
const http = require("http");
// 请求接口的option对象
const options = {
    'demo1': {
        displayName: '演示插件',
        name: 'demo1',
        url: 'https://gpt.aigcfast.com/api/chat-stream',
        method: 'POST',
        protocol: 'https',
        type: 'plugin',
        parentMessageId: '',
        conversationId: '',
        messages:[],
        headers: {
            'authority': 'gpt.aigcfast.com',
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'cache-control': 'no-cache',
            'content-type': 'application/json',
            'origin': 'https://gpt.aigcfast.com',
            'pragma': 'no-cache',
            'referer': 'https://gpt.aigcfast.com/',
            'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
            'path': 'v1/chat/completions',
        },
        body: function (message) {
            return JSON.stringify({
                messages: [
                    {
                        role: 'user',
                        content: message,
                    }
                ],
                stream: true,
                model: 'gpt-3.5-turbo',
                temperature: 1,
                presence_penalty: 0,
            })
        },
        fn: function (controller, event, messages, message) {
            let _this = this;
            // _this.messages.push({"role": "user", "content": message})
            const opt = Object.assign({
                method: _this.method,
                headers: _this.headers,
            }, {
                signal: controller.signal,
            });

            let req = null

            const httpCallBack = (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    try {
                        data += chunk;
                        event.sender.send('reply', data)

                    } catch (e) {
                        console.error(e)
                    }
                });
                res.on('end', () => {
                    try {
                        event.sender.send('reply', data + '\n**end**')
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
                req = https.request(_this.url, opt, httpCallBack);
            } else {
                req = http.request(_this.url, opt, httpCallBack);
            }
            const postData = _this.body(message);
            // log.info('========================' + postData)
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
            const postData = JSON.stringify(Object.assign(this.body(),{messages:'你好'}));
            req.write(postData);
            req.end();
        },
        clear:function (){
            this.messages.length = 0
        },
        testSpeed: 0,
    }
};


module.exports = {
    options: options,
};
