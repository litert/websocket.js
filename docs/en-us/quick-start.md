# Quick Start

This guide will help you get started with `@litert/websocket` quickly.
We will cover the installation, basic usage, and a simple example of creating a
WebSocket server and client.

## Installation

It's recommended to use `npm` to install the library:

```sh
npm install @litert/websocket
```

## Creating a WebSocket Server

This library relies on the built-in `node:http` or `node:https` module to create
the underlying HTTP/HTTPS server. Here's a simple example of creating a WebSocket
server using `node:http`:

```ts
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
```

Run this example, and you should see the server and client exchanging messages
every half second.

Click here to view the [example code](https://github.com/litert/websocket.js/blob/master/src/examples/quick-start.ts).
