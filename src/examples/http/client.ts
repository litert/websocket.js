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

import * as NodeFS from 'node:fs';
import * as $WS from '../../lib';

function writeLog(msg: string): void {

    console.info(`[${new Date().toISOString()}] ${msg}`);
}

(async () => {

    try {

        const cli = await $WS.wsConnect({
            'host': '127.0.0.1',
            'port': 42096,
            'connectTimeout': 50000,
            'frameReceiveMode': $WS.EFrameReceiveMode[
                process.argv.find(i => i.startsWith('--frame-receive-mode='))
                    ?.slice('--frame-receive-mode='.length)?.toUpperCase() as 'STANDARD' ?? 'STANDARD'
            ] ?? $WS.EFrameReceiveMode.STANDARD,
        });

        cli.setMasking(false);
        cli.writeText('hello world');
        cli.writeText(Buffer.from('hello world (buffer)'));
        cli.on('message', (msg) => {

            if (msg.mode !== $WS.EFrameReceiveMode.STANDARD) {

                // lite frame mode

                switch (msg.opcode) {
                    case $WS.EOpcode.CLOSE:
                        writeLog(`Recv [${$WS.EOpcode[msg.opcode]}]: code = ${Buffer.concat(msg.data).readUint16BE()}`);
                        break;
                    case $WS.EOpcode.PING:
                        writeLog(`Recv [${$WS.EOpcode[msg.opcode]}]: ${Buffer.concat(msg.data).toString()}`);
                        cli.pong(Buffer.concat(msg.data));
                        break;
                    default:
                        writeLog(`Recv [${$WS.EOpcode[msg.opcode]}]:` + Buffer.concat(msg.data).toString());
                }
                return;
            }

            switch (msg.opcode) {
                case $WS.EOpcode.CLOSE:
                    msg.toBuffer().then((buf) => {
                        writeLog(`Recv [${$WS.EOpcode[msg.opcode]}]: code = ${buf.readUint16BE()}`);
                    }, (e) => {
                        writeLog(`Recv [${$WS.EOpcode[msg.opcode]}]: ` + e);
                    });
                    break;
                case $WS.EOpcode.PING:
                    msg.toBuffer().then((buf) => {
                        writeLog(`Recv [${$WS.EOpcode[msg.opcode]}]: ${buf.toString()}`);
                        cli.pong(buf);
                    }, (e) => {
                        writeLog(`Recv [${$WS.EOpcode[msg.opcode]}]: ` + e);
                    });
                    break;
                default:
                    msg.toString().then((buf) => {
                        writeLog(`Recv [${$WS.EOpcode[msg.opcode]}]:` + buf);
                    }, (e) => {
                        writeLog(`Recv [${$WS.EOpcode[msg.opcode]}]: ` + e);
                    });
            }
        });

        let i = 0;
        const timer = setInterval(function(): void {

            if (!cli.writable) {

                clearInterval(timer);
                return;
            }

            switch (Math.floor(Math.random() * 7)) {
                case 0:
                    if (cli.frameReceiveMode !== $WS.EFrameReceiveMode.LITE) {

                        writeLog(`Sent fragmented text`);
                        const writer = cli.createMessageWriter($WS.EOpcode.TEXT);

                        writer.write('hello ');
                        writer.write('world ');
                        cli.writeText('hi');
                        writer.write('angus ');
                        writer.write('- end with non-empty frame - ');
                        writer.end((i++).toString());
                        break;
                    }
                case 1:
                    if (cli.frameReceiveMode !== $WS.EFrameReceiveMode.LITE) {

                        writeLog(`Sent fragmented text`);
                        const writer = cli.createMessageWriter($WS.EOpcode.TEXT);

                        writer.write('hello ');
                        writer.write('world ');
                        cli.writeText('hi');
                        writer.write('angus ');
                        writer.write('- end with empty frame - ' + (i++).toString());
                        writer.end();
                        break;
                    }
                    // fall-through
                case 2:
                    writeLog('Sent non-empty text');
                    cli.writeText('biu biu biu~' + (i++));
                    break;
                case 3:
                    writeLog('Sent empty text');
                    i++;
                    cli.writeText('');
                    break;
                case 4:
                    writeLog('Sent binary');
                    cli.writeBinary(Buffer.from('biu biu biu~' + (i++)));
                    break;
                case 5:
                    writeLog('Sent multiple segments of text');
                    cli.writeText(['hey ', 'hey ', 'hey ', 'guy', (i++).toString()]);
                    break;
                case 6:
                    if (cli.frameReceiveMode !== $WS.EFrameReceiveMode.LITE) {
                        writeLog('Sent file');
                        NodeFS.createReadStream(`${__dirname}/../../tsconfig.json`).pipe(cli.createMessageWriter($WS.EOpcode.TEXT));
                    }
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
