console.log("启动服务器")
var WebSocketServer = require('ws').Server,
	server = new WebSocketServer({port:8010}),
	qs = require('qs'),
	clients = [new Array, new Array]
var Client = (function () {
    function Client(client, openid) {
        this.client = client;
        this.openid = openid;
    }
    return Client;
}());
console.log(clients)
server.on('connection', (client, request)=>{
	let params = qs.parse(request.url.split('?',2)[1])
	let groupid = params.groupid
	let openid = params.openid
	clients[groupid].push(new Client(client, openid))		
	console.log(clients)
	client.on('message', msg=>{
		let s = clients[~groupid + 2]
		for (let i in s) {
			if (s[i].openid == openid) {
				s[i].client.send(msg)
				break
			}
		}
	})
	client.on('close', ()=>{
		let s = clients[groupid]
		for (let i in s) {
			if (s[i].openid == openid) {
				s.splice(i, 1)
				break
			}
		}	
		console.log(clients)
	})
	client.on('error', e=>console.log(e))
})

//server.on("headers", data=>console.log(data));

server.on("error", e=>console.log("服务器错误:" + e));