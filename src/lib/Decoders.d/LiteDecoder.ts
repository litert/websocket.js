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

import * as D from '../Decl';
import * as E from '../Errors';
import { mask } from '../MaskFn';
import { WsSimpleMessage } from '../SimpleMessage';

interface IChunkHeader {

    /**
     * The payload of each chunk.
     */
    opcode: D.EOpcode;

    /**
     * The payload of each chunk.
     */
    length: number;

    /**
     * The mask key for unmasking the payload.
     */
    maskKey?: Buffer;
}

enum EState {
    READING_HEADER_FIRST_2_BYTES,
    READING_HEADER,
    READING_PAYLOAD,
}

export class WsLiteDecoder implements D.IDecoder {

    /**
     * The current state of the decoder.
     */
    private _state: EState = EState.READING_HEADER_FIRST_2_BYTES;

    /**
     * The buffer for reading header of each chunk.
     */
    private readonly _bdrBuf: Buffer = Buffer.allocUnsafe(14);

    /**
     * How many bytes have been read into `_bdrBuf`.
     */
    private _hdrBufFilled: number = 0;

    /**
     * The expected size of header of each chunk.
     */
    private _hdrSize: number = 0;

    /**
     * The header of each chunk
     */
    private _chunkHeader: IChunkHeader | null = null;

    /**
     * How many bytes have been read from current chunk.
     */
    private _chunkFilled: number = 0;

    private _chunks: Buffer[] = [];

    public constructor(
        public readonly maxMessageSize: number,
    ) {}

    public reset(): void {

        this._state = EState.READING_HEADER_FIRST_2_BYTES;
        this._hdrBufFilled = 0;
        this._hdrSize = 0;
        this._chunkHeader = null;
        this._chunkFilled = 0;
        this._chunks = [];
    }

    private _calcFrameHeaderSize(headerByte1: number, headerByte2: number): number {

        if (headerByte1 & 0b0111_0000) {

            throw new E.E_INVALID_PROTOCOL('RSV1, RSV2, RSV3 must be 0');
        }

        const isMasked: boolean = !!(headerByte2 & 0b1000_0000);
        const payloadLength: number = headerByte2 & 0b0111_1111;

        if (payloadLength === 0x7E) {

            return 4 + (isMasked ? 4 : 0);
        }
        else if (payloadLength === 0x7F) {

            return 10 + (isMasked ? 4 : 0);
        }
        else {

            return isMasked ? 6 : 2;
        }
    }

    private _setupChunk(bytes: Buffer): void {

        const headerByte1 = bytes[0];
        const headerByte2 = bytes[1];

        const fin = (headerByte1 & 0b1000_0000) === 0b1000_0000;

        if (!fin) {

            throw new E.E_FRAME_BROKEN();
        }

        const opcode = headerByte1 & 0b0000_1111;
        const masked = (headerByte2 & 0b1000_0000) === 0b1000_0000;
        const chunkSize = headerByte2 & 0b0111_1111;

        if (D.EOpcode[opcode] === undefined) {

            throw new E.E_INVALID_PROTOCOL('Unknown opcode');
        }

        this._chunkHeader = {
            opcode,
            length: chunkSize,
        };

        let offset = 2;

        if (chunkSize === 0x7E) { // read the next 2 bytes as uint16be

            this._chunkHeader.length = bytes.readUInt16BE(offset);
            offset += 2;
        }
        else if (chunkSize === 0x7F) { // read the next 8 bytes as uint64be

            if (bytes.readUInt16BE(offset) & 0b1111_1111_1110_0000) { // check if it's safe for javascript integer.

                throw new E.E_MESSAGE_TOO_LARGE();
            }

            this._chunkHeader.length = bytes.readUInt32BE(offset) * 0x1_0000_0000 + bytes.readUInt32BE(offset + 4);
            offset += 8;
        }

        if (this.maxMessageSize < this._chunkHeader.length) {

            throw new E.E_MESSAGE_TOO_LARGE();
        }

        this._chunks = [];

        if (masked) {

            this._chunkHeader.maskKey = bytes.subarray(offset, offset + 4);
        }
    }

    public decode(buf: Buffer): D.ISimpleMessage[] {

        let offset = 0;

        const ret: D.ISimpleMessage[] = [];

        while (offset < buf.byteLength) {

            const bufRest = buf.byteLength - offset;

            switch (this._state) {
                case EState.READING_HEADER_FIRST_2_BYTES:

                    this._bdrBuf[this._hdrBufFilled++] = buf[offset++];

                    if (this._hdrBufFilled === 1) {

                        if (bufRest === 1) {

                            break;
                        }

                        // if (restSize >= 2) {
                        this._bdrBuf[this._hdrBufFilled++] = buf[offset++];
                        // }
                    }

                    this._hdrSize = this._calcFrameHeaderSize(this._bdrBuf[0], this._bdrBuf[1]);

                    if (this._hdrSize > 2) {

                        this._state = EState.READING_HEADER;
                    }
                    else {

                        this._setupChunk(this._bdrBuf);

                        this._state = EState.READING_PAYLOAD;
                    }

                    break;
                case EState.READING_HEADER:

                    if (bufRest >= this._hdrSize - this._hdrBufFilled) {

                        while (this._hdrBufFilled < this._hdrSize) {

                            this._bdrBuf[this._hdrBufFilled++] = buf[offset++];
                        }

                        this._setupChunk(this._bdrBuf);

                        this._state = EState.READING_PAYLOAD;
                    }
                    else {

                        while (offset < buf.byteLength) {

                            this._bdrBuf[this._hdrBufFilled++] = buf[offset++];
                        }
                    }
                    break;

                case EState.READING_PAYLOAD: {

                    const chunkRest = this._chunkHeader!.length - this._chunkFilled;

                    if (bufRest >= chunkRest) { // is chunk finished?

                        const chunk = buf.subarray(offset, offset + chunkRest);

                        if (this._chunkHeader!.maskKey) {

                            mask(chunk, this._chunkHeader!.maskKey, this._chunkFilled);
                        }

                        this._chunks.push(chunk);

                        offset += chunkRest;

                        ret.push(new WsSimpleMessage(
                            D.EFrameReceiveMode.LITE,
                            this._chunkHeader!.opcode,
                            this._chunks,
                        ));

                        this.reset();
                    }
                    else {

                        const chunk = buf.subarray(offset);

                        if (this._chunkHeader!.maskKey) {

                            mask(chunk, this._chunkHeader!.maskKey, this._chunkFilled);
                        }

                        this._chunks.push(chunk);

                        this._chunkFilled += bufRest;

                        offset += bufRest;
                    }
                }
            }
        }

        return ret;
    }
}
