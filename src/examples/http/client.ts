/**
 * Copyright 2024 Angus.Fenying <fenying@litert.org>
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
            'connectTimeout': 500,
            'frameReceiveMode': $WS.EFrameReceiveMode[
                process.argv.find(i => i.startsWith('--frame-receive-mode'))
                    ?.slice('--frame-receive-mode='.length)?.toUpperCase() as 'STANDARD' ?? 'STANDARD'
            ] ?? $WS.EFrameReceiveMode.STANDARD,
        });

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
                        console.log(`[${new Date().toISOString()}] Recv [${$WS.EOpcode[msg.opcode]}]:`, Buffer.concat(msg.data).toString());
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

            switch (Math.floor(Math.random() * 3)) {
                case 2:
                    if (cli.frameReceiveMode !== $WS.EFrameReceiveMode.LITE) {

                        const writer = cli.createMessageWriter($WS.EOpcode.TEXT);

                        writer.write('hello ');
                        writer.write('world ');
                        writer.write('angus ');
                        writer.end();
                        break;
                    }
                    // fall-through
                case 0:
                    cli.writeText('biu biu biu~');
                    break;
                case 1:
                    cli.writeBinary(Buffer.from('biu biu biu~'));
                    break;

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
