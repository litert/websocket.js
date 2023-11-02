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
            'headers': {
                ...$WS.createClientHandshakeHeaders()
            },
            'liteFrameMode': process.argv.includes('--enable-lite-frame-mode'),
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
        cli.on('frame', (frame) => {

            if ('data' in frame) {

                // lite frame mode

                switch (frame.opcode) {
                    case $WS.EOpcode.CLOSE:
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[frame.opcode]}]: code = ${Buffer.concat(frame.data).readUint16BE()}`);
                        break;
                    case $WS.EOpcode.PING:
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[frame.opcode]}]: ${Buffer.concat(frame.data).toString()}`);
                        cli.pong(Buffer.concat(frame.data));
                        break;
                    default:
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[frame.opcode]}]:`, Buffer.concat(frame.data));
                }
                return;
            }

            switch (frame.opcode) {
                case $WS.EOpcode.CLOSE:
                    frame.toBuffer().then((buf) => {
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[frame.opcode]}]: code = ${buf.readUint16BE()}`);
                    }, (e) => {
                        console.error(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[frame.opcode]}]:`, e);
                    });
                    break;
                case $WS.EOpcode.PING:
                    frame.toBuffer().then((buf) => {
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[frame.opcode]}]: ${buf.toString()}`);
                        cli.pong(buf);
                    }, (e) => {
                        console.error(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[frame.opcode]}]:`, e);
                    });
                    break;
                default:
                    frame.toString().then((buf) => {
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[frame.opcode]}]:`, buf);
                    }, (e) => {
                        console.error(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[frame.opcode]}]:`, e);
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
