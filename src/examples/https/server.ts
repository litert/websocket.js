/**
 * Copyright 2025 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as NodeHttps from 'node:https';
import * as NodeFS from 'node:fs';
import * as LibWS from '../../lib';
import { setTimeout } from 'node:timers/promises';

// create the HTTP server
const httpServer = NodeHttps.createServer({

    ca: NodeFS.readFileSync(`${__dirname}/../../temp/ca.pem`),
    cert: NodeFS.readFileSync(`${__dirname}/../../temp/newcerts/server-websocket-demo.litert.org.fullchain.pem`),
    key: NodeFS.readFileSync(`${__dirname}/../../temp/private/server-websocket-demo.litert.org.key.pem`),

}, function(req, resp): void {

    resp.writeHead(400, { 'Content-Type': 'text/plain' });
    resp.end('BAD REQUEST\n');
});

async function socketBody(ws: LibWS.IWebSocket): Promise<void> {

    const clientId = `${ws.remoteAddress!}:${ws.remotePort!}`;

    console.info(`[${new Date().toISOString()}] Client ${clientId} connected!`);

    let count = 0;

    ws.on('error', (e) => {

        console.error(e);
    });

    ws.on('message', (msg) => {

        if (msg.mode !== LibWS.EFrameReceiveMode.STANDARD) {

            // lite frame mode

            switch (msg.opcode) {
                case LibWS.EOpcode.CLOSE:
                    console.log(`[${new Date().toISOString()}] Client ${clientId} frame[${LibWS.EOpcode[msg.opcode]}]: code = ${Buffer.concat(msg.data).readUint16BE()}`);
                    break;
                default:
                    console.log(`[${new Date().toISOString()}] Client ${clientId} frame[${LibWS.EOpcode[msg.opcode]}]: code = ${Buffer.concat(msg.data).toString()}`);
            }
            return;
        }

        switch (msg.opcode) {
            case LibWS.EOpcode.CLOSE:
                msg.toBuffer().then((buf) => {
                    console.log(`[${new Date().toISOString()}] Client ${clientId} frame[${LibWS.EOpcode[msg.opcode]}]: code = ${buf.readUint16BE()}`);
                }, (e) => {
                    console.error(`[${new Date().toISOString()}] Client ${clientId} frame[${LibWS.EOpcode[msg.opcode]}]:`, e);
                });
                break;
            default:
                msg.toString().then((buf) => {
                    console.log(`[${new Date().toISOString()}] Client ${clientId} frame[${LibWS.EOpcode[msg.opcode]}]:`, buf);
                }, (e) => {
                    console.error(`[${new Date().toISOString()}] Client ${clientId} frame[${LibWS.EOpcode[msg.opcode]}]:`, e);
                });
        }
    });

    while (ws.connected) {

        if (count === 50) {

            ws.end();
            break;
        }

        count++;
        if (count % 5 === 0) {

            console.log(`[${new Date().toISOString()}] Server sent PING "HELLO"`);

            ws.ping('HELLO');
        }
        else if (count % 11 === 0) {

            ws.writeText('hello world');
            console.log(`[${new Date().toISOString()}] Server sent TEXT "hello world"`);

        }
        else if (count % 7 === 0) {

            ws.writeBinary(Buffer.from('HELLO world!'));
            console.log(`[${new Date().toISOString()}] Server sent BINARY "HELLO world!"`);
        }
        else {

            ws.writeText(`test count ${count}`);
            console.log(`[${new Date().toISOString()}] Server sent TEXT "test count ${count}"`);
        }

        await setTimeout(100);
    }

    ws.end();
    console.warn(`[${new Date().toISOString()}] Client ${clientId} disconnected!`);
}

const wsServer = LibWS.createServer({
    'timeout': 250,
    'frameReceiveMode': LibWS.EFrameReceiveMode[
        process.argv.find(i => i.startsWith('--frame-receive-mode'))
            ?.slice('--frame-receive-mode='.length)?.toUpperCase() as 'STANDARD' ?? 'STANDARD'
    ] ?? LibWS.EFrameReceiveMode.STANDARD,
});

// listen for incoming connections
httpServer.on('upgrade', (request, socket, head) => {

    console.log(`Received upgrade request: ${request.method} ${request.url}`);

    const ws = wsServer.accept({
        request,
        socket: socket as any,
        headers: {
            'X-My-Header': 'Hello World!'
        },
        clientEarlyDataPayload: head,
    });
    socketBody(ws).catch(console.error);
});

// start the server listening on port 2096
httpServer.listen(2096, '0.0.0.0', () => {
    console.log('WebSocket server listening on 127.0.0.1:2096');
});
