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

import * as fs from 'node:fs';
import * as $WS from '../../lib';

(async () => {

    try {

        const cli = await $WS.wssConnect({
            'host': '127.0.0.1',
            'ca': fs.readFileSync(`${__dirname}/../../temp/ca.pem`),
            'servername': 'websocket-demo.litert.org',
            'port': 2096,
            'connectTimeout': 500,
            'frameReceiveMode': $WS.EFrameReceiveMode[
                process.argv.find(i => i.startsWith('--frame-receive-mode'))
                    ?.slice('--frame-receive-mode='.length)?.toUpperCase() as 'STANDARD' ?? 'STANDARD'
            ] ?? $WS.EFrameReceiveMode.STANDARD,
        });
        console.log(cli.peerCertificate?.subject);

        switch (Math.floor(Math.random() * 4)) {
            case 0:
                cli.setMasking(false);
                console.log('No masking.');
                break;
            case 1:
                cli.setMasking(true);
                console.log('Use random masking key for each frame.');
                break;
            case 2:
                cli.setMasking(Buffer.from(new Array(4).fill(0).map(() => Math.floor(Math.random() * 256))));
                console.log('Use a new fixed masking key for each frame.');
                break;
            default:
                break; // keep default behavior.
        }
        cli.setMasking(false);
        cli.writeText('hello world');
        cli.on('message', (msg) => {

            if (msg.mode !== $WS.EFrameReceiveMode.STANDARD) {

                // lite frame mode

                switch (msg.opcode) {
                    case $WS.EOpcode.CLOSE:
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[msg.opcode]}]: code = ${Buffer.concat(msg.data).readUint16BE()}`);
                        break;
                    case $WS.EOpcode.PING:
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[msg.opcode]}]: ${Buffer.concat(msg.data).toString()}`);
                        cli.pong(Buffer.concat(msg.data));
                        break;
                    default:
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[msg.opcode]}]:`, Buffer.concat(msg.data));
                }
                return;
            }

            switch (msg.opcode) {
                case $WS.EOpcode.CLOSE:
                    msg.toBuffer().then((buf) => {
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[msg.opcode]}]: code = ${buf.readUint16BE()}`);
                    }, (e) => {
                        console.error(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[msg.opcode]}]:`, e);
                    });
                    break;
                case $WS.EOpcode.PING:
                    msg.toBuffer().then((buf) => {
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[msg.opcode]}]: ${buf.toString()}`);
                        cli.pong(buf);
                    }, (e) => {
                        console.error(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[msg.opcode]}]:`, e);
                    });
                    break;
                default:
                    msg.toString().then((buf) => {
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[msg.opcode]}]:`, buf);
                    }, (e) => {
                        console.error(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[msg.opcode]}]:`, e);
                    });
            }
        });

        const timer = setInterval(function(): void {

            if (Math.random() > 0.5) {
                cli.writeText('biu biu biu~');
            }
            else {
                cli.writeBinary(Buffer.from('biu biu biu~'));
            }
        }, 100);

        await new Promise<void>((resolve, reject) => {

            cli.on('error', reject).on('end', resolve);
        });

        clearInterval(timer);

        cli.end();
    }
    catch (e) {

        console.error(e);
    }

})().catch(console.error);
