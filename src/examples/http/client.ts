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

import * as $WS from '../../lib';

(async () => {

    try {

        const cli = await $WS.wsConnect({
            'host': '127.0.0.1',
            'port': 42096,
            'headers': {
                ...$WS.createClientHandshakeHeaders()
            },
            'connectTimeout': 500,
            'liteFrameMode': process.argv.includes('--enable-lite-frame-mode'),
        });

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
