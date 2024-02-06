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

import type * as $Net from 'node:net';
import type * as TLS from 'node:tls';
import * as $Events from 'node:events';
import * as D from './Decl';
import * as _ from './Utils';
import * as E from './Errors';
import { WsFrameEncoder } from './Encoder';
import { WsDecoder } from './Decoder';
import { WsLiteDecoder } from './LiteDecoder';

export abstract class AbstractWsConnection extends $Events.EventEmitter implements D.IWebSocket {

    protected _maskKey: Buffer | boolean = false;

    protected readonly _encoder = new WsFrameEncoder();

    private readonly _decoder: WsDecoder | WsLiteDecoder;

    protected _socket: $Net.Socket | null;

    public constructor(
        socket: $Net.Socket,
        public readonly isServer: boolean,
        public readonly tls: boolean,
        private _timeout: number,
        public readonly liteFrameMode: boolean,
    ) {

        super();

        this._socket = socket;

        this._decoder = liteFrameMode ? new WsLiteDecoder() : new WsDecoder();

        this._setup();
    }

    public get timeout(): number {

        return this._timeout;
    }

    public set timeout(v: number) {

        if (!Number.isSafeInteger(v) || v < 0) {

            throw new E.E_TIMEOUT();
        }

        this._timeout = v;
        this._socket?.setTimeout(v);
    }

    public get finished(): boolean {

        return this._socket?.writableFinished ?? true;
    }

    public get ended(): boolean {

        return this._socket?.readableEnded ?? true;
    }

    public get connected(): boolean {

        return this._socket?.closed === false;
    }

    public get writable(): boolean {

        return this._socket?.writable === true;
    }

    public get family(): string {

        return this._socket?.localFamily ?? '';
    }

    public get remoteAddress(): string {

        return this._socket?.remoteAddress ?? '';
    }

    public get localAddress(): string {

        return this._socket?.localAddress ?? '';
    }

    public get remotePort(): number {

        return this._socket?.remotePort ?? 0;
    }

    public get localPort(): number {

        return this._socket?.localPort ?? 0;
    }

    public get peerCertificate(): TLS.PeerCertificate | null {

        return this.tls ? (this._socket as TLS.TLSSocket).getPeerCertificate(true) : null;
    }

    private _assertWritable(): void {

        if (!this.connected) {

            throw new E.E_CONN_LOST();
        }

        if (!this._socket?.writable) {

            throw new E.E_CONN_READONLY();
        }
    }

    public writeBinary(data: Buffer | string | Array<Buffer | string>): boolean {

        this._assertWritable();

        let len = 0;

        if (data instanceof Buffer) {

            len = data.byteLength;
        }
        else {

            for (const i of data) {

                len += Buffer.byteLength(i);
            }
        }

        const maskKey = this._maskKey === true ? _.createRandomMaskKey() : (this._maskKey || null);

        this._socket!.write(this._encoder.createHeader(
            D.EOpcode.BINARY,
            len,
            maskKey
        ));

        return this._writePayload(data, maskKey);
    }

    public writeText(data: string): boolean {

        this._assertWritable();

        const maskKey = this._maskKey === true ? _.createRandomMaskKey() : (this._maskKey || null);

        this._socket!.write(this._encoder.createHeader(
            D.EOpcode.TEXT,
            Buffer.byteLength(data),
            maskKey
        ));

        return this._writePayload(data, maskKey);
    }

    public ping(data?: Buffer | string): boolean {

        this._assertWritable();

        const maskKey = this._maskKey === true ? _.createRandomMaskKey() : (this._maskKey || null);

        const ret = this._socket!.write(this._encoder.createHeader(
            D.EOpcode.PING,
            data ? Buffer.byteLength(data) : 0,
            maskKey
        ));

        if (data) {

            return this._writePayload(data, maskKey);
        }

        return ret;
    }

    private _writePayload(data: Buffer | string | Array<Buffer | string>, maskKey: Buffer | null): boolean {

        if (data instanceof Buffer) {

            if (maskKey) {

                this._encoder.mask(data, maskKey, 0);
            }

            return this._socket!.write(data);
        }

        if (Array.isArray(data)) {

            if (maskKey) {

                this._encoder.bulkMask(data, maskKey);
            }

            let ret: boolean = true;

            for (const chunk of data) {

                ret = this._socket!.write(chunk);
            }

            return ret;
        }

        if (maskKey) {

            const buf = Buffer.from(data);

            this._encoder.mask(buf, maskKey, 0);

            return this._socket!.write(buf);
        }

        return this._socket!.write(data);
    }

    public pong(data?: Buffer | string): boolean {

        this._assertWritable();

        const maskKey = this._maskKey === true ? _.createRandomMaskKey() : (this._maskKey || null);

        const ret = this._socket!.write(this._encoder.createHeader(
            D.EOpcode.PONG,
            data ? Buffer.byteLength(data) : 0,
            maskKey
        ));

        if (data) {

            return this._writePayload(data, maskKey);
        }

        return ret;
    }

    public end(reason: D.ECloseReason = D.ECloseReason.BYE): boolean {

        if (!this._socket?.writable) {

            return false;
        }

        const reasonBuffer = Buffer.allocUnsafe(2);

        reasonBuffer.writeUint16BE(reason, 0);

        const ret = this._socket.write(
            this._encoder.createHeader(
                D.EOpcode.CLOSE,
                2,
                this._maskKey === true ? _.createRandomMaskKey() : (this._maskKey || null)
            )
        );

        this._socket.end(reasonBuffer);

        return ret;
    }

    public destroy(): void {

        if (this._socket) {
            this._socket?.destroy();
            this._socket = null;
        }
    }

    protected _setup(): void {

        if (!this.connected || !this._socket) {

            throw new E.E_CONN_LOST();
        }

        this._socket.setNoDelay(true);

        this._socket
            .removeAllListeners()
            .on('timeout', () => {

                this.emit('timeout');
                this.end(D.ECloseReason.BYE);
                this._socket?.destroy(new E.E_TIMEOUT());
            })
            .on('close', () => {

                this._socket = null;
                this.emit('close');
                this._decoder.reset();
            })
            .on('error', (err) => this.emit('error', err))
            .on('end', () => this.emit('end'))
            .on('finish', () => this.emit('finish'))
            .on('data', (d) => {

                try {

                    const result = this._decoder.decode(d);

                    for (const i of result) {

                        this.emit('frame', i);

                        if (i.opcode === D.EOpcode.CLOSE) {

                            this._socket?.end();
                        }
                    }
                }
                catch (e) {

                    if (e instanceof E.E_INVALID_PROTOCOL) {

                        this.end(D.ECloseReason.PROTOCOL_ERROR);
                    }
                    else if (e instanceof E.E_FRAME_TOO_LARGE) {

                        this.end(D.ECloseReason.MESSAGE_TOO_BIG);
                    }
                    else {

                        this.end(D.ECloseReason.INTERNAL_ERROR);
                    }

                    this.emit('error', e);
                }
            });

        this._socket?.setTimeout(this._timeout);
    }
}
