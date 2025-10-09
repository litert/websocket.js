import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeHttp from 'node:http';
import * as NodeNet from 'node:net';
import * as NodeTimers from 'node:timers/promises';
import { once } from 'node:events';
import * as LibWS from '../lib';
import { WsFrameEncoder } from '../lib/Encoder';

async function createHttpServer() {
    const httpServer = NodeHttp.createServer(function (req, resp): void {

        resp.writeHead(400, { 'Content-Type': 'text/plain' });
        resp.end('BAD REQUEST\n');
    });

    httpServer.listen(0, '127.0.0.1');

    await once(httpServer, 'listening');
    return httpServer;
}

async function localConnect(port: number): Promise<NodeNet.Socket> {

    const socket = NodeNet.connect(port, '127.0.0.1');

    await once(socket, 'connect');

    return socket;
}

NodeTest.describe('Client: Send Early Data', async () => {

    await NodeTest.it('node:http server should be able to receive the early data sent by client.', async () => {

        // create the HTTP server
        const httpServer = await createHttpServer();

        const srvPort = (httpServer.address() as any).port as number;

        const conn = await localConnect(srvPort);

        conn.setNoDelay(true);

        let receivedEarlyData = false;

        httpServer.on('upgrade', (request, socket, head) => {
            if (head?.byteLength) {
                receivedEarlyData = head.toString() === 'Hello, World!';
            }
            request.socket.end();
        });

        conn.write([
            'GET /chat HTTP/1.1',
            'Host: localhost',
            'Upgrade: websocket',
            'Connection: Upgrade',
            'Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==',
            'Sec-WebSocket-Protocol: chat, superchat',
            '',
            'Hello, World!' // Early data
        ].join('\r\n'));

        await once(conn, 'end');

        NodeAssert.ok(receivedEarlyData);

        httpServer.close();
    });

    await NodeTest.it('ws library should process the client sent early data correctly', async () => {

        // create the HTTP server
        const httpServer = await createHttpServer();

        const srvPort = (httpServer.address() as any).port as number;

        const receivedPayloads: string[] = [];

        const wsServer = LibWS.createServer({
            frameReceiveMode: LibWS.EFrameReceiveMode.LITE,
        });

        let closeConn = () => {};

        httpServer.on('upgrade', (request, socket, head) => {
            const conn = wsServer.accept({
                request,
                socket: socket as any,
                clientEarlyDataPayload: head,
            });
            conn.on('error', (e) => {
                console.error('Connection error:', e);
            });
            conn.on('message', (msg) => {
                switch (msg.opcode) {
                    case LibWS.EOpcode.TEXT:
                    case LibWS.EOpcode.BINARY:
                    case LibWS.EOpcode.PING:
                        receivedPayloads.push(Buffer.concat((msg as LibWS.ISimpleMessage).data).toString());
                        break;
                }
            });
            // setTimeout(() => { conn.end(); }, 200);
            closeConn = () => { conn.end(); };
        });

        const conn = await localConnect(srvPort);

        conn.setNoDelay(true);

        const encoder = new WsFrameEncoder(1024);

        const PAYLOAD_1 = 'Hello, World!';
        const PAYLOAD_2 = 'Hello';
        const PAYLOAD_3 = 'World';
        conn.write(Buffer.concat([
            Buffer.from([
                'GET /chat HTTP/1.1',
                'Host: localhost',
                'Upgrade: websocket',
                'Connection: Upgrade',
                'Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==',
                'Sec-WebSocket-Protocol: chat, superchat',
                '',
                '',
            ].join('\r\n')),
            encoder.createHeader(LibWS.EOpcode.TEXT, Buffer.byteLength(PAYLOAD_1), true),
            Buffer.from(PAYLOAD_1),
            encoder.createHeader(LibWS.EOpcode.BINARY, Buffer.byteLength(PAYLOAD_2), true),
            Buffer.from(PAYLOAD_2),
            encoder.createHeader(LibWS.EOpcode.PING, Buffer.byteLength(PAYLOAD_3), true),
            Buffer.from(PAYLOAD_3),
        ]));

        await NodeTimers.setTimeout(100);

        conn.write(Buffer.concat([
            encoder.createHeader(LibWS.EOpcode.TEXT, Buffer.byteLength(PAYLOAD_1), true),
            Buffer.from(PAYLOAD_1),
        ]));

        await NodeTimers.setTimeout(100);

        conn.write(Buffer.concat([
            encoder.createHeader(LibWS.EOpcode.BINARY, Buffer.byteLength(PAYLOAD_2), true),
            Buffer.from(PAYLOAD_2),
        ]));

        await NodeTimers.setTimeout(100);

        conn.write(Buffer.concat([
            encoder.createHeader(LibWS.EOpcode.PING, Buffer.byteLength(PAYLOAD_3), true),
            Buffer.from(PAYLOAD_3),
        ]));

        await NodeTimers.setTimeout(100);

        try {
            NodeAssert.deepStrictEqual(receivedPayloads, [
                PAYLOAD_1,
                PAYLOAD_2,
                PAYLOAD_3,
                PAYLOAD_1,
                PAYLOAD_2,
                PAYLOAD_3,
            ]);
        }
        finally {
            closeConn();
            conn.end();

            httpServer.close();
        }
    });
});
