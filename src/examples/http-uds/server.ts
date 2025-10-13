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

import * as NodeHttp from 'node:http';
import * as NodeFS from 'node:fs';
import * as LibWS from '../../lib';
import { setTimeout } from 'node:timers/promises';

// create the HTTP server
const httpServer = NodeHttp.createServer(function(req, resp): void {

    resp.writeHead(400, { 'Content-Type': 'text/plain' });
    resp.end('BAD REQUEST\n');
});

function writeLog(msg: string): void {

    console.info(`[${new Date().toISOString()}] ${msg}`);
}

async function socketBody(ws: LibWS.IWebSocket): Promise<void> {

    const clientId = `${ws.remoteAddress!}:${ws.remotePort!}`;

    writeLog(`Client ${clientId} connected!`);

    let count = 0;

    ws.on('close', () => {

        writeLog(`Client ${clientId} closed`);
    });
    ws.on('error', (e) => {
        writeLog((e as any).toString());
    });
    ws.on('message', (msg) => {

        if (msg.mode !== LibWS.EFrameReceiveMode.STANDARD) {

            // lite frame mode

            switch (msg.opcode) {
                case LibWS.EOpcode.CLOSE:
                    writeLog(`Client ${clientId} frame[${LibWS.EOpcode[msg.opcode]}]: code = ${msg.data.length > 0 ? Buffer.concat(msg.data).readUint16BE() : 'none'}`);

                    break;
                default:
                    writeLog(`Client ${clientId} frame[${LibWS.EOpcode[msg.opcode]}]: code = ${Buffer.concat(msg.data).toString()}`);
            }
            return;
        }

        switch (msg.opcode) {
            case LibWS.EOpcode.CLOSE:
                msg.toBuffer().then((buf) => {
                    writeLog(`Client ${clientId} frame[${LibWS.EOpcode[msg.opcode]}]: code = ${buf.length ? buf.readUint16BE()  : 'none' }`);
                }, (e) => {
                    writeLog(`Client ${clientId} frame[${LibWS.EOpcode[msg.opcode]}]: ` + e);
                });
                break;
            default:
                msg.toString().then((buf) => {
                    writeLog(`Client ${clientId} frame[${LibWS.EOpcode[msg.opcode]}] = ${buf}`);
                }, (e) => {
                    writeLog(`Client ${clientId} frame[${LibWS.EOpcode[msg.opcode]}]: ` + e);
                });
        }
    });

    while (ws.connected) {

        if (count === 50) {

            writeLog(`Bye`);
            ws.end();
            break;
        }

        count++;
        if (count % 5 === 0) {

            writeLog(`Sent ping`);
            ws.ping('HELLO');
        }
        else if (count % 11 === 0) {

            writeLog(`Sent text`);
            ws.writeText('hello world');
        }
        else if (count % 7 === 0) {

            writeLog(`Sent binary`);
            ws.writeBinary(Buffer.from('HELLO world!'));
        }
        else if (count % 13 === 0 && ws.frameReceiveMode !== LibWS.EFrameReceiveMode.LITE) {

            writeLog(`Sent fragmented text`);
            const writer = ws.createMessageWriter(LibWS.EOpcode.TEXT);

            writer.write('hi ');
            writer.end();
        }
        else {

            writeLog(`Sent count text`);
            ws.writeText(`test count ${count}`);
        }

        await setTimeout(100);
    }

    ws.end();
    writeLog(`Client ${clientId} disconnected!`);
}

const wsServer = LibWS.createServer({
    'timeout': 15000,
    'frameReceiveMode': LibWS.EFrameReceiveMode[
        process.argv.find(i => i.startsWith('--frame-receive-mode='))
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
    socketBody(ws).catch((e) => { writeLog(e.toString()); });
});

const UDS_PATH = '/tmp/ws-server.sock';

try {

    NodeFS.unlinkSync(UDS_PATH);
}
catch {

    // Ignore
}

// start the server listening on /tmp/ws-server.sock
httpServer.listen(UDS_PATH, () => {
    writeLog(`WebSocket server listening on ${UDS_PATH}`);
});
