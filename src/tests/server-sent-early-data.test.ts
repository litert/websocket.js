import * as NodeTest from 'node:test';
import * as NodeAssert from 'node:assert';
import * as NodeHttp from 'node:http';
import * as NodeNet from 'node:net';
import * as NodeTimers from 'node:timers/promises';
import { once } from 'node:events';
import * as LibWS from '../lib';
import { WsFrameEncoder } from '../lib/Encoder';
import { createAcceptHash } from '../lib/Utils';

async function createHttpServer() {
    const httpServer = NodeHttp.createServer(function (req, resp): void {

        resp.writeHead(400, { 'Content-Type': 'text/plain' });
        resp.end('BAD REQUEST\n');
    });

    httpServer.listen(0, '127.0.0.1');

    await once(httpServer, 'listening');
    return httpServer;
}

NodeTest.describe('Server: Send Early Data', async () => {

    await NodeTest.it('node:http client should be able to receive the early data sent by server.', async () => {

        // create the HTTP server
        const httpServer = await createHttpServer();

        const srvPort = (httpServer.address() as any).port as number;

        let closeConn = () => {};

        const PAYLOAD_1 = 'Hello, World!';
        httpServer.on('upgrade', (request, socket, head) => {
            const encoder = new WsFrameEncoder(1024);

            socket.write(Buffer.concat([
                Buffer.from([
                    'HTTP/1.1 101 Switching Protocols',
                    'Upgrade: websocket',
                    'Connection: Upgrade',
                    'Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=',
                    '\r\n',
                ].join('\r\n')),
                
                encoder.createHeader(LibWS.EOpcode.TEXT, Buffer.byteLength(PAYLOAD_1), true),
                Buffer.from(PAYLOAD_1),
            ]));
            closeConn = () => { socket.end();  };
        });

        const client = NodeHttp.request({
            'method': 'GET',
            'host': '127.0.0.1',
            'port': srvPort,
            'path': '/',
            'headers': {
                'Connection': 'Upgrade',
                'Upgrade': 'websocket',
                'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
            },
        });

        client.end();

        const [res, socket, head] = await once(client, 'upgrade') as [res: NodeHttp.IncomingMessage, socket: NodeNet.Socket, head: Buffer];

        NodeAssert.strictEqual(res.statusCode, 101);
        NodeAssert.ok(head.byteLength > 0)

        socket.end();

        closeConn();

        httpServer.close();
    });

    await NodeTest.it('ws library should process the server sent early data correctly', async () => {

        // create the HTTP server
        const httpServer = await createHttpServer();

        const srvPort = (httpServer.address() as any).port as number;

        const receivedPayloads: string[] = [];

        let closeConn = () => {};

        const PAYLOAD_1 = 'Hello, World!';
        const PAYLOAD_2 = 'Hello';
        const PAYLOAD_3 = 'World';
        httpServer.on('upgrade', (request, socket, head) => {
            const encoder = new WsFrameEncoder(1024);

            socket.write(Buffer.concat([
                Buffer.from([
                    'HTTP/1.1 101 Switching Protocols',
                    'Upgrade: websocket',
                    'Connection: Upgrade',
                    'Sec-WebSocket-Accept: ' + createAcceptHash(request.headers['sec-websocket-key']!),
                    '\r\n',
                ].join('\r\n')),
                
                encoder.createHeader(LibWS.EOpcode.TEXT, Buffer.byteLength(PAYLOAD_1), true),
                Buffer.from(PAYLOAD_1),
                encoder.createHeader(LibWS.EOpcode.BINARY, Buffer.byteLength(PAYLOAD_2), true),
                Buffer.from(PAYLOAD_2),
                encoder.createHeader(LibWS.EOpcode.PING, Buffer.byteLength(PAYLOAD_3), true),
                Buffer.from(PAYLOAD_3),
            ]));

            setTimeout(() => {

                socket.write(Buffer.concat([
                    encoder.createHeader(LibWS.EOpcode.TEXT, Buffer.byteLength(PAYLOAD_1), true),
                    Buffer.from(PAYLOAD_1),
                    encoder.createHeader(LibWS.EOpcode.BINARY, Buffer.byteLength(PAYLOAD_2), true),
                    Buffer.from(PAYLOAD_2),
                    encoder.createHeader(LibWS.EOpcode.PING, Buffer.byteLength(PAYLOAD_3), true),
                    Buffer.from(PAYLOAD_3),
                ]));

            }, 100);

            closeConn = () => { socket.end();  };
        });

        try {
            const conn = LibWS.createClient({
                port: srvPort,
                frameReceiveMode: LibWS.EFrameReceiveMode.LITE,
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

            await conn.connect();

            NodeAssert.deepStrictEqual(receivedPayloads, [
                PAYLOAD_1,
                PAYLOAD_2,
                PAYLOAD_3,
            ]);

            await NodeTimers.setTimeout(100);

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

            httpServer.close();
        }
    });
});
