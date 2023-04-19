const https = require("https");
const http = require("http");
// 请求接口的option对象
const options = {
    'testPlugin': {
        storage:[]
            // 自己定义你想要存消息的格式, 例如:
            // [{"role": "user", "content": message}]
            // 清空的时候自己定义清空的函数
        ,
        displayName: '测试插件',
        name: 'testPlugin',
        url: 'https://localhost/api/chat-stream',
        method: 'POST',
        protocol: 'http',
        type: 'plugin',
        headers: {
            'Content-Type': 'application/json',
            // 'Content-Length': Buffer.byteLength(postData),
            'authority': 'localhost',
            'path': "v1/chat/completions",
            'accept': '*/*',
            'accept-language': 'zh-CN,zh;q=0.9',
            'cache-control': 'no-cache',
            'origin': 'http://localhost',
            'pragma': 'no-cache',
            'referer': 'https://localhost/',
            'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
        },
        options: function () {
            return {
                hostname: 'localhost',
                path: '/api/chat-stream',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Content-Length': Buffer.byteLength(postData),
                    'authority': 'localhost',
                    'path': "v1/chat/completions",
                    'accept': '*/*',
                    'accept-language': 'zh-CN,zh;q=0.9',
                    'cache-control': 'no-cache',
                    'origin': 'https://localhost',
                    'pragma': 'no-cache',
                    'referer': 'https://localhost/',
                    'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
                }
            }
        },
        body: function (messages) {
            return JSON.stringify({
                messages: messages,
                stream: true,
                model: 'gpt-3.5-turbo',
                temperature: 1,
                presence_penalty: 0,
            })
        },
        // 入参,event为回显事件,messages为当前聊天记录,格式[{"role": "user", "content": message}],message为当前输入的消息
        fn: function (controller,event, messages, message) {
            const postData = JSON.stringify({
                messages: messages,
                stream: true,
                model: 'gpt-3.5-turbo',
                temperature: 1,
                presence_penalty: 0,
            });

            const options = {
                hostname: 'localhost',
                path: '/api/chat-stream',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'authority': 'localhost',
                    'accept': '*/*',
                    'accept-language': 'zh-CN,zh;q=0.9',
                    'cache-control': 'no-cache',
                    'origin': 'http://localhost',
                    'path': "v1/chat/completions",
                    'pragma': 'no-cache',
                    'referer': 'http://localhost/',
                    'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
                }
            };

            const req = https.request(options, (res) => {
                console.log(`statusCode: ${res.statusCode}`);
                let data = '';
                res.setEncoding('utf8');
                // 接收响应数据
                res.on('data', (chunk) => {
                    data += chunk;
                    event.sender.send('reply', data)
                });

                res.on('end', () => {
                    this.storage.push({"role": "assistant", "content": data})
                    event.sender.send('reply', data + '\n**end**')

                })
            });

            req.on('error', (error) => {
                console.error(error);
            });

            // 发送请求数据
            req.write(postData);
            req.end();
        },
        testSpeedFn: function (callback) {
            const postData = JSON.stringify({
                messages: messages,
                stream: true,
                model: 'gpt-3.5-turbo',
                temperature: 1,
                presence_penalty: 0,
            });

            const options = {
                hostname: 'localhost',
                path: '/api/chat-stream',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'authority': 'localhost',
                    'accept': '*/*',
                    'accept-language': 'zh-CN,zh;q=0.9',
                    'cache-control': 'no-cache',
                    'origin': 'http://localhost',
                    'path': "v1/chat/completions",
                    'pragma': 'no-cache',
                    'referer': 'http://localhost/',
                    'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
                }
            };
            const start = new Date().getTime();
            const req = https.request(options, (res) => {
                console.log(`statusCode: ${res.statusCode}`);
                let data = '';
                res.setEncoding('utf8');
                // 接收响应数据
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    const end = new Date().getTime();
                    const time = end - start;
                    callback(time, res)
                })
            });

            req.on('error', (error) => {
                console.error(error);
            });

            // 发送请求数据
            req.write(postData);
            req.end();
        },
        clear: function () {

        },
        testSpeed: 1,
    }
};


module.exports = {
    options: options,
};
