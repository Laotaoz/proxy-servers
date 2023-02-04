const sport=41793;const http=require('http');const net=require('net');const dns = require('dns');dns.setServers(['8.8.8.8','8.8.4.4','114.114.114.114','223.5.5.5']);
function proxy(proxyPort) {
    const server = http.createServer()
    .on('connect', (req, socket, head) => {
        const userInfo = {
            address: req.socket.remoteAddress,
            port: req.socket.remotePort,
            cliAddr: req.socket.remoteAddress+":"+req.socket.remotePort,
            target: {
                address: req.url.substring(
                    0, req.url.lastIndexOf(':')
                ),
                port: Number(req.url.substring(
                    req.url.lastIndexOf(':') + 1
                ))
            }
        };
        userInfo.cliAddr += (
            userInfo.cliAddr.length % 8 !==0 ? '\t' : '\t\t'
        );
        const logger = (style) => console.log(style,userInfo.cliAddr+"-->\t"+String(server.address().port)+"\t-->\t"+userInfo.target.address+":"+String(userInfo.target.port));

        const remote = net.connect({
            lookup: dns.lookup,
            port: userInfo.target.port,
            host: userInfo.target.address,
            timeout: 2000
        }, () => {
            logger('\x1B[32m%s\x1B[39m')
            socket.write('HTTP/1.1 200 Connection Established\r\nProxy-agent: MITM-proxy\r\n\r\n');
            remote.write(head);socket.pipe(remote).pipe(socket);
        });
        remote.on('close', hadError => {})
        .on('end', () => {})
        .on('error', err => logger('\x1B[31m%s\x1B[39m'))
        .on('timeout', () => {})
    })
    .on('error', err => console.error(err))
    .on('clientError', (err, errSocket) => {})
    .on('listening', () => console.log('HTTP Proxy Server on ['+server.address().address+']:'+String(server.address().port)))
    .listen(proxyPort, '0.0.0.0');
}

process.on('uncaughtException',(err)=>{});proxy(sport);
