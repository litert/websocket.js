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

import type * as $Net from 'node:net';
import { Writable, WritableOptions } from 'node:stream';
import * as _ from './Utils';
import type * as dL from '../Decl';
import * as cL from '../Constants';
import * as eL from '../Errors';
import { WsFrameEncoder } from './Encoder';

const EMPTY_BUFFER = Buffer.allocUnsafe(0);

export class WsFrameWriter {

    private readonly _encoder = new WsFrameEncoder();

    public maskKey: Buffer | boolean = false;

    protected _socket: $Net.Socket | null = null;

    public constructor(socket: $Net.Socket | null = null) {

        if (socket) {

            this.setSocket(socket);
        }
    }

    public setSocket(socket: $Net.Socket): void {

        if (this._socket) {

            throw new eL.E_INTERNAL_ERROR({
                reason: 'The socket has been set already.',
            });
        }

        this._socket = socket.on('close', () => {

            this._socket = null;
        });
    }

    /**
     * Build and write a WebSocket frame
     *
     * @param opcode    The opcode of the frame
     * @param isFin     Is this the final frame?
     * @param payload   The payload of the frame
     * @param callback  A callback to be called when the frame is written
     *
     * @returns Return false if the socket buffer is full, needs to wait for draining.
     */
    public writeArray(
        opcode: cL.EOpcode,
        isFin: boolean,
        payload: Array<Buffer | string>,
        callback: dL.IErrorCallback
    ): boolean {

        if (!this._socket?.writable) {

            callback(new eL.E_CONN_LOST());
            return false;
        }

        let payloadLength = 0;

        for (const i of payload) {

            payloadLength += Buffer.byteLength(i);
        }

        const maskKey = this.maskKey === true ? _.createRandomMaskKey() : (this.maskKey || null);

        if (maskKey) {

            this._encoder.bulkMask(payload, maskKey);
        }

        const header = this._encoder.createHeader(opcode, payloadLength, isFin, maskKey);

        if (!payloadLength) {

            return this._socket.write(header, callback);
        }

        let needDrain = this._socket.write(header);

        for (let i = 0; i < payload.length; ++i) {

            if (i === payload.length - 1) {

                needDrain = this._socket.write(payload[i], callback);
            }
            else {

                this._socket.write(payload[i]);
            }
        }

        return needDrain;
    }

    /**
     * Build and write a WebSocket frame
     *
     * @param opcode    The opcode of the frame
     * @param isFin     Is this the final frame?
     * @param payload   The payload of the frame
     * @param callback  A callback to be called when the frame is written
     *
     * @returns Return false if the socket buffer is full, needs to wait for draining.
     */
    public write(
        opcode: cL.EOpcode,
        isFin: boolean,
        payload: Buffer | string,
        callback: dL.IErrorCallback
    ): boolean {

        if (!this._socket?.writable) {

            if (callback) {
                callback(new eL.E_CONN_LOST());
            }
            else {
                throw new eL.E_CONN_LOST();
            }

            return false;
        }

        const payloadLength = Buffer.byteLength(payload);

        const maskKey = this.maskKey === true ? _.createRandomMaskKey() : (this.maskKey || null);

        if (maskKey) {

            if (!(payload instanceof Buffer)) {

                payload = Buffer.from(payload);
            }

            this._encoder.mask(payload, maskKey, 0);
        }

        const header = this._encoder.createHeader(opcode, payloadLength, isFin, maskKey);

        if (!payloadLength) {

            return this._socket.write(header, callback);
        }

        this._socket.write(header);

        return this._socket.write(payload, callback);
    }
}

export class WsMessageWriter extends Writable implements dL.IMessageWriter {

    private _sentBytes = 0;

    public constructor(
        public readonly opcode: cL.EOpcode,
        public readonly maxMessageSize: number,
        protected readonly _writer: WsFrameWriter,
        opts?: WritableOptions,
    ) {

        super(opts);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public override _write(
        chunk: Buffer | string,
        _encoding: BufferEncoding,
        callback: dL.IErrorCallback
    ): void {

        const len = Buffer.byteLength(chunk);

        if (this._sentBytes + len > this.maxMessageSize) {

            callback(new eL.E_MESSAGE_TOO_LARGE());
            return;
        }

        this._writer.write(
            this._sentBytes === 0 ? this.opcode : cL.EOpcode.CONTINUATION,
            false,
            chunk,
            callback
        );

        this._sentBytes += len;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public override _final(callback: dL.IErrorCallback): void {

        this._writer.write(
            this._sentBytes === 0 ? this.opcode : cL.EOpcode.CONTINUATION,
            true,
            EMPTY_BUFFER,
            callback
        );
    }
}
