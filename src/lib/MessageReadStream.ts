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

import { Readable } from 'node:stream';
import * as cL from './Constants';
import type * as dL from './Decl';
import * as eL from './Errors';

export class WsMessageReadStream extends Readable implements dL.IMessageReadStream {

    public readonly mode = cL.EFrameReceiveMode.STANDARD;

    public constructor(
        public readonly opcode: cL.EOpcode,
    ) {

        super();
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public _read(): void {

        return;
    }

    public toString(): Promise<string> {

        if (this.readableEnded) {

            throw new eL.E_FRAME_ENDED();
        }

        return new Promise<string>((resolve, reject) => {

            const decoder = new TextDecoder('utf-8');

            let buf = '';

            this.on('data', (chunk: Buffer) => {
                buf += decoder.decode(chunk, { stream: true });
            })
                .on('error', (e: unknown) => { reject(e); })
                .on('end', () => { resolve(buf); });
        });
    }

    public toBuffer(): Promise<Buffer> {

        if (this.readableEnded) {

            throw new eL.E_FRAME_ENDED();
        }

        return new Promise<Buffer>((resolve, reject) => {

            const buf: Buffer[] = [];

            this.on('data', (chunk: Buffer) => {
                buf.push(chunk);
            })
                .on('error', (e: unknown) => { reject(e); })
                .on('end', () => { resolve(Buffer.concat(buf)); });
        });
    }

    public toBufferArray(): Promise<Buffer[]> {

        if (this.readableEnded) {

            throw new eL.E_FRAME_ENDED();
        }

        const buf: Buffer[] = [];

        return new Promise<Buffer[]>((resolve, reject) => {

            this.on('data', (chunk: Buffer) => {
                buf.push(chunk);
            })
                .on('error', (e: unknown) => { reject(e); })
                .on('end', () => { resolve(buf); });
        });
    }
}
