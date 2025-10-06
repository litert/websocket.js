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

import * as D from './Decl';
import * as E from './Errors';
import { mask } from './MaskFn';

export class WsFrameEncoder {

    public constructor(
        public maxMessageSize: number = D.DEFAULT_MAX_MESSAGE_SIZE
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
        isFin: boolean,
        maskKey?: Buffer | number[] | null,
    ): Buffer {

        const payloadSizeFieldSize = payloadSize > 65535 ? 8 : payloadSize > 125 ? 2 : 0;
        const header: Buffer = Buffer.allocUnsafe(2 + payloadSizeFieldSize + (maskKey ? 4 : 0));

        let offset: number = 0;

        header[offset++] = isFin ? 0b1000_0000 | opcode : opcode;

        if ((maskKey?.length ?? 4) !== 4) {

            throw new E.E_INVALID_CONFIG({ value: maskKey, field: 'maskKey' });
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
                throw new E.E_INVALID_PROTOCOL('Invalid size for payload', { payloadSize });
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
