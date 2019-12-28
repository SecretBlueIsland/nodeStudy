console.log("启动服务器")
var WebSocketServer = require('ws').Server,
	server = new WebSocketServer({port:8010}),
	qs = require('qs'),
	clients = [new Map(), new Map()]

function show() {
	clients.forEach((g,i)=>{
		if (i == 0)
			console.log('微信端：')
		else if (i == 1)
			console.log('网页端：')

		g.forEach((v,k)=>console.log(k))
	})
	console.log('')
}

server.on('connection', (client, request)=>{
	let params = qs.parse(request.url.split('?',2)[1])
	let groupid = params.groupid
	let openid = params.openid
	clients[groupid].set(openid, client)
	show()
	client.on('message', msg=>{
		//console.log('groupid=' + groupid + ',openid' + openid + ',msg=' + msg)
		try {
			clients[~groupid + 2].get(openid).send(msg)
			clients[~groupid + 2].get('debug').send(msg)
		} catch(e) {}
	})
	client.on('close', ()=>{
		clients[groupid].delete(openid)
		show()
	})
	client.on('error', e=>console.log(e))
})

//server.on("headers", data=>console.log(data));

server.on("error", e=>console.log("服务器错误:" + e));