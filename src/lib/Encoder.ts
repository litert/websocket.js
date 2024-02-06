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

import * as D from './Decl';
import { mask } from './MaskFn';

export class WsFrameEncoder {

    public constructor(
        public maxFrameSize: number = D.DEFAULT_MAX_FRAME_SIZE
    ) {}

    public readonly mask = mask;

    public bulkMask(data: Array<Buffer | string>, maskKey: Buffer): void {

        let offset = 0;

        for (let i = 0; i < data.length; i++) {

            let chunk = data[i];

            if (!(chunk instanceof Buffer)) {
                data[i] = chunk = Buffer.from(chunk);
            }

            this.mask(chunk, maskKey, offset);

            offset += chunk.byteLength;
        }
    }

    public createHeader(
        opcode: D.EOpcode,
        payloadSize: number,
        maskKey?: Buffer | number[] | null,
        chunkIndex: number = 0,
        isLastChunk: boolean = true
    ): Buffer {

        const payloadSizeFieldSize = payloadSize > 65535 ? 8 : payloadSize > 125 ? 2 : 0;
        const header: Buffer = Buffer.allocUnsafe(2 + payloadSizeFieldSize + (maskKey ? 4 : 0));

        let offset: number = 0;

        const FIN_BITS = isLastChunk ? 0b1000_0000 : 0;
        const OPCODE_BITS = chunkIndex === 0 ? opcode : D.EOpcode.CONTINUATION;

        header[offset++] = FIN_BITS | OPCODE_BITS;

        if ((maskKey?.length ?? 4) !== 4) {

            throw new Error('Invalid mask key');
        }

        const MASKED_BITS = maskKey ? 0b1000_0000 : 0;
        switch (payloadSizeFieldSize) {
            case 0:
                header[offset++] = MASKED_BITS | payloadSize;
                break;
            case 2:
                header[offset++] = MASKED_BITS | 126;
                header.writeUInt16BE(payloadSize, offset);
                offset += 2;
                break;
            case 8: {
                header[offset++] = MASKED_BITS | 127;
                const lowDWORD = payloadSize % 0x1_0000_0000;
                const highDWORD = (payloadSize - lowDWORD) / 0x1_0000_0000;
                header.writeUInt32BE(highDWORD, offset);
                offset += 4;
                header.writeUInt32BE(lowDWORD, offset);
                offset += 4;
                break;
            }
            default:
                throw new Error('Invalid payload size');
        }

        if (maskKey) {

            header[offset++] = maskKey[0];
            header[offset++] = maskKey[1];
            header[offset++] = maskKey[2];
            header[offset++] = maskKey[3];
        }

        return header;
    }
}
