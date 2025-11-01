import * as NodeHttp from 'node:http';
import * as NodeTimers from 'node:timers/promises';
import * as LibWS from '../lib';

// create the HTTP server
const httpServer = NodeHttp.createServer(function(req, resp): void {

    resp.writeHead(400, { 'Content-Type': 'text/plain' });
    resp.end('BAD REQUEST\n');
});

// create the WebSocket server
const wsServer = LibWS.createServer({
    'frameReceiveMode': LibWS.EFrameReceiveMode.LITE,
});

// setup the connection event handler
httpServer.on('upgrade', (request, socket, head) => {

    console.log(`Received upgrade request: ${request.method} ${request.url}`);

    const ws = wsServer.accept({
        request,
        socket: socket as any,
        clientEarlyDataPayload: head,
    });

    // setup message event handler
    ws.on('message', (msg) => {
        console.log(`Server: Received message: ${Buffer.concat((msg as LibWS.ISimpleMessage).data).toString()}`);
        ws.writeText(`Echo: ${Buffer.concat((msg as LibWS.ISimpleMessage).data).toString()}`);
    });
});

async function main(): Promise<void> {

    await new Promise<void>((resolve) => {
        
        httpServer.listen(8080, () => {
            console.log('HTTP server is listening on port 8080');
            resolve();
        });
    });

    const client = LibWS.createClient({
        port: 8080,
        hostname: 'localhost',
        frameReceiveMode: LibWS.EFrameReceiveMode.LITE,
    });

    client.on('message', (msg) => {
        console.log(`Client: Received message from server: ${Buffer.concat((msg as LibWS.ISimpleMessage).data).toString()}`);
    });

    await client.connect();

    while (true) {

        client.writeText(`[${new Date().toISOString()}] Hello, WebSocket server!`);

        await NodeTimers.setTimeout(500);
    }

}

main().catch((e) => { console.error(e); });
