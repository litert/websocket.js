import * as _ from './Utils';
import * as D from './Decl';
import { WsFrameEncoder } from './Encoder';
import * as E from './Errors';
import type * as $Net from 'node:net';
import { Writable, WritableOptions } from 'node:stream';

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

            throw new E.E_INTERNAL_ERROR({
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
        opcode: D.EOpcode,
        isFin: boolean,
        payload: Array<Buffer | string>,
        callback: D.IErrorCallback
    ): boolean {

        if (!this._socket?.writable) {

            callback(new E.E_CONN_LOST());
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
        opcode: D.EOpcode,
        isFin: boolean,
        payload: Buffer | string,
        callback: D.IErrorCallback
    ): boolean {

        if (!this._socket?.writable) {

            if (callback) {
                callback(new E.E_CONN_LOST());
            }
            else {
                throw new E.E_CONN_LOST();
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

export class WsMessageWriter extends Writable implements D.IMessageWriter {

    private _sentBytes = 0;

    public constructor(
        public readonly opcode: D.EOpcode,
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
        callback: D.IErrorCallback
    ): void {

        const len = Buffer.byteLength(chunk);

        if (this._sentBytes + len > this.maxMessageSize) {

            callback(new E.E_MESSAGE_TOO_LARGE());
            return;
        }

        this._writer.write(
            this._sentBytes === 0 ? this.opcode : D.EOpcode.CONTINUATION,
            false,
            chunk,
            callback
        );

        this._sentBytes += len;
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public override _final(callback: D.IErrorCallback): void {

        this._writer.write(
            this._sentBytes === 0 ? this.opcode : D.EOpcode.CONTINUATION,
            true,
            EMPTY_BUFFER,
            callback
        );
    }
}
