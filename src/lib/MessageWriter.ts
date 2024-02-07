import * as _ from './Utils';
import * as D from './Decl';
import { WsFrameEncoder } from './Encoder';
import * as E from './Errors';
import type * as $Net from 'node:net';

export class WsMessageWriteHelper {

    public readonly encoder = new WsFrameEncoder();

    public maskKey: Buffer | boolean = false;

    public constructor(
        protected _socket: $Net.Socket | null,
    ) {}

    public getMaskKey(): Buffer  | null {

        return this.maskKey === true ? _.createRandomMaskKey() : (this.maskKey || null);
    }

    public writePayload(data: Buffer | string | Array<Buffer | string>, maskKey: Buffer | null): boolean {

        if (data instanceof Buffer) {

            if (maskKey) {

                this.encoder.mask(data, maskKey, 0);
            }

            return this._socket!.write(data);
        }

        if (Array.isArray(data)) {

            if (maskKey) {

                this.encoder.bulkMask(data, maskKey);
            }

            let ret: boolean = true;

            for (const chunk of data) {

                ret = this._socket!.write(chunk);
            }

            return ret;
        }

        if (maskKey) {

            const buf = Buffer.from(data);

            this.encoder.mask(buf, maskKey, 0);

            return this._socket!.write(buf);
        }

        return this._socket!.write(data);
    }
}

interface IBuffer {

    content: string | Buffer;

    maskKey: Buffer | null;

    isFirst: boolean;
}

export class WsMessageWriter implements D.IMessageWriter {

    public constructor(
        public readonly opcode: D.EOpcode,
        protected _socket: $Net.Socket | null,
        protected readonly _helper: WsMessageWriteHelper
    ) {}

    protected _buffer: IBuffer | null = null;

    protected _assertWritable(): void {

        if (this._socket?.closed ?? true) {

            throw new E.E_CONN_LOST();
        }

        if (!this._socket?.writable) {

            throw new E.E_CONN_READONLY();
        }
    }

    public write(frame: Buffer | string): boolean {

        this._assertWritable();

        const prev = this._buffer;

        const maskKey = this._helper.getMaskKey();

        this._buffer = {
            content: frame,
            maskKey,
            isFirst: !prev
        };

        if (prev) {

            const l = Buffer.byteLength(prev.content);

            const ret = this._socket!.write(this._helper.encoder.createHeader(
                this.opcode,
                l,
                maskKey,
                prev.isFirst ? 0 : 1,
                false,
            ));

            if (l) {

                return this._helper.writePayload(prev.content, prev.maskKey) && ret;
            }
        }

        return false;
    }

    public end(frame?: string | Buffer): boolean {

        this._assertWritable();

        if (frame) {

            this.write(frame);
        }

        const prev = this._buffer;

        this._buffer = null;

        if (prev) {

            const l = Buffer.byteLength(prev.content);

            const ret = this._socket!.write(this._helper.encoder.createHeader(
                this.opcode,
                l,
                prev.maskKey,
                prev.isFirst ? 0 : 1,
                true
            ));

            if (l) {

                return this._helper.writePayload(prev.content, prev.maskKey) && ret;
            }
        }

        return false;
    }
}
