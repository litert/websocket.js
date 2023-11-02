/**
 * Copyright 2023 Angus.Fenying <fenying@litert.org>
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

import * as Http from 'node:http';
import * as $WS from '../../lib';
import { setTimeout } from 'node:timers/promises';

// create the HTTP server
const httpServer = Http.createServer(function(req, resp): void {

    resp.writeHead(400, { 'Content-Type': 'text/plain' });
    resp.end('BAD REQUEST\n');
});

async function socketBody(ws: $WS.IWebSocket): Promise<void> {

    const clientId = `${ws.remoteAddress!}:${ws.remotePort!}`;

    console.info(`[${new Date().toISOString()}] Client ${clientId} connected!`);

    let count = 0;

    ws.on('error', (e) => {
        console.error(e);
    });
    ws.on('frame', (frame) => {

        if ('data' in frame) {

            // lite frame mode

            switch (frame.opcode) {
                case $WS.EOpcode.CLOSE:
                    console.log(`[${new Date().toISOString()}] Client ${clientId} frame[${$WS.EOpcode[frame.opcode]}]: code = ${Buffer.concat(frame.data).readUint16BE()}`);

                    break;
                default:
                    console.log(`[${new Date().toISOString()}] Client ${clientId} frame[${$WS.EOpcode[frame.opcode]}]: code = ${Buffer.concat(frame.data).toString()}`);
            }
            return;
        }

        switch (frame.opcode) {
            case $WS.EOpcode.CLOSE:
                frame.toBuffer().then((buf) => {
                    console.log(`[${new Date().toISOString()}] Client ${clientId} frame[${$WS.EOpcode[frame.opcode]}]: code = ${buf.readUint16BE()}`);
                }, (e) => {
                    console.error(`[${new Date().toISOString()}] Client ${clientId} frame[${$WS.EOpcode[frame.opcode]}]:`, e);
                });
                break;
            default:
                frame.toString().then((buf) => {
                    console.log(`[${new Date().toISOString()}] Client ${clientId} frame[${$WS.EOpcode[frame.opcode]}]:`, buf);
                }, (e) => {
                    console.error(`[${new Date().toISOString()}] Client ${clientId} frame[${$WS.EOpcode[frame.opcode]}]:`, e);
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

            ws.ping('HELLO');
        }
        else if (count % 11 === 0) {

            ws.writeText('hello world');
        }
        else if (count % 7 === 0) {

            ws.writeBinary(Buffer.from('HELLO world!'));
        }
        else {

            ws.writeText(`test count ${count}`);
        }

        await setTimeout(100);
    }

    ws.end();
    console.warn(`[${new Date().toISOString()}] Client ${clientId} disconnected!`);
}

const wsServer = $WS.createServer({
    'timeout': 150,
    'liteFrameMode': process.argv.includes('--enable-lite-frame-mode'),
});

// listen for incoming connections
httpServer.on('upgrade', (request, socket) => {

    const ws = wsServer.accept({
        request,
        socket: socket as any,
        headers: {
            'X-My-Header': 'Hello World!'
        }
    });
    socketBody(ws).catch(console.error);
});

// start the server listening on port 42096
httpServer.listen(42096, '0.0.0.0', () => {
    console.log('WebSocket server listening on 127.0.0.1:42096');
});
