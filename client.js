var ws = require('ws')
var sock = new ws("wss://hostname?groupid=0&openid=null")
sock.on("open", function () {
	console.log("connect success !!!!");
	sock.send('发给网页')
	//sock.send(Buffer.alloc(10));
});
sock.on("error", e=>console.log("error: ", e))
sock.on("close", ()=>console.log("close"))
sock.on("message", data=>console.log(data))
