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
import type * as TLS from 'node:tls';
import * as $Events from 'node:events';
import * as D from './Decl';
import * as E from './Errors';
import { getDecoder } from './Decoders.d';
import { WsFrameWriter, WsMessageWriter } from './MessageWriter';
import { WritableOptions } from 'node:stream';

export interface IQueueItem {

    opcode: D.EOpcode;

    data: any;

    cb: D.IErrorCallback;
}

export abstract class AbstractWsConnection extends $Events.EventEmitter implements D.IWebSocket {

    protected readonly _writer: WsFrameWriter;

    private readonly _decoder: D.IDecoder;

    protected _socket: $Net.Socket | null;

    protected _writeStream: D.IMessageWriter | null = null;

    protected _queue: IQueueItem[] = [];

    public constructor(
        socket: $Net.Socket,
        public readonly isServer: boolean,
        public readonly tls: boolean,
        private _timeout: number,
        public readonly frameReceiveMode: D.EFrameReceiveMode = D.EFrameReceiveMode.STANDARD,
        public readonly maxMessageSize: number = 0x4000000,
    ) {

        super();

        this._socket = socket;

        this._writer = new WsFrameWriter(socket);

        this._decoder = getDecoder(frameReceiveMode, maxMessageSize);

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

    public writeBinary(
        data: Buffer | string | Array<Buffer | string>,
        cb: D.IErrorCallback = this._defaultWriteCallback,
    ): boolean {

        this._assertWritable();

        if (this._writeStream) {

            this._queue.push({ opcode: D.EOpcode.BINARY, data, cb });
            return false;
        }

        return Array.isArray(data) ?
            this._writer.writeArray(D.EOpcode.BINARY, true, data, cb) :
            this._writer.write(D.EOpcode.BINARY, true, data, cb);
    }

    public writeText(
        data: string | string[],
        cb: D.IErrorCallback = this._defaultWriteCallback,
    ): boolean {

        this._assertWritable();

        if (this._writeStream) {

            this._queue.push({ opcode: D.EOpcode.TEXT, data, cb });
            return false;
        }

        return Array.isArray(data) ?
            this._writer.writeArray(D.EOpcode.TEXT, true, data, cb) :
            this._writer.write(D.EOpcode.TEXT, true, data, cb);
    }

    public ping(
        data: Buffer | string | Array<Buffer | string>,
        cb: D.IErrorCallback = this._defaultWriteCallback,
    ): boolean {

        this._assertWritable();

        if (this._writeStream) {

            this._queue.push({ opcode: D.EOpcode.PING, data, cb });
            return false;
        }

        return Array.isArray(data) ?
            this._writer.writeArray(D.EOpcode.PING, true, data, cb) :
            this._writer.write(D.EOpcode.PING, true, data, cb);
    }

    public pong(
        data: Buffer | string | Array<Buffer | string>,
        cb: D.IErrorCallback = this._defaultWriteCallback,
    ): boolean {

        this._assertWritable();

        if (this._writeStream) {

            this._queue.push({ opcode: D.EOpcode.PONG, data, cb });
            return false;
        }

        return Array.isArray(data) ?
            this._writer.writeArray(D.EOpcode.PONG, true, data, cb) :
            this._writer.write(D.EOpcode.PONG, true, data, cb);
    }

    public createMessageWriter(
        opcode: D.EOpcode,
        opts?: WritableOptions
    ): D.IMessageWriter {

        if (this._writeStream) {

            throw new E.E_CONN_BUSY();
        }

        if (this.frameReceiveMode === D.EFrameReceiveMode.LITE) {

            throw new E.E_INVALID_PROTOCOL('Lite frame mode does not support message writer.');
        }

        return this._writeStream = new WsMessageWriter(opcode, this.maxMessageSize, this._writer, opts)
            .on('close', () => {

                this._writeStream = null;

                if (this._queue.length) {

                    this._flushQueue();
                }
            });
    }

    private readonly _defaultWriteCallback = (e?: Error | null): void => {

        if (e) {

            this.emit('error', e);
        }
    };

    private _flushQueue(): void {

        if (!this._socket?.writable) {

            for (const i of this._queue) {

                i.cb(new E.E_CONN_LOST());
            }
            this._queue = [];
            return;
        }

        for (const i of this._queue) {

            try {

                switch (i.opcode) {
                    case D.EOpcode.BINARY:
                        this.writeBinary(i.data, i.cb);
                        break;

                    case D.EOpcode.TEXT:
                        this.writeText(i.data, i.cb);
                        break;

                    case D.EOpcode.PING:
                        this.ping(i.data, i.cb);
                        break;

                    case D.EOpcode.PONG:
                        this.pong(i.data, i.cb);
                        break;

                    case D.EOpcode.CLOSE:
                        this.end(i.data, i.cb);
                        break;
                    default:
                        // do nothing
                }
            }
            catch (e) {

                i.cb(e as Error);
            }
        }

        this._queue = [];
    }

    public end(
        reason: D.ECloseReason = D.ECloseReason.BYE,
        cb: D.IErrorCallback = this._defaultWriteCallback,
    ): boolean {

        if (this._socket?.writableEnded ?? true) {

            return false;
        }

        if (this._writeStream) {

            this._queue.push({ opcode: D.EOpcode.CLOSE, data: reason, cb });
            return false;
        }

        const reasonBuffer = Buffer.allocUnsafe(2);

        reasonBuffer.writeUInt16BE(reason, 0);

        const ret = this._writer.write(D.EOpcode.CLOSE, true, reasonBuffer, cb);

        this._socket?.end();

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
            .on('drain', () => this.emit('drain'))
            .on('data', (d) => {

                try {

                    const result = this._decoder.decode(d);

                    for (const i of result) {

                        this.emit('message', i);

                        if (i.opcode === D.EOpcode.CLOSE) {

                            this.end();
                        }
                    }
                }
                catch (e) {

                    if (e instanceof E.E_INVALID_PROTOCOL) {

                        this.end(D.ECloseReason.PROTOCOL_ERROR);
                    }
                    else if (e instanceof E.E_MESSAGE_TOO_LARGE) {

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
