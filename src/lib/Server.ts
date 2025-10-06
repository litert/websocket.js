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
import * as _ from './Utils';
import type * as Http from 'node:http';
import { WsServerConnection } from './ServerConnection';
import { TLSSocket } from 'node:tls';
import * as E from './Errors';

const DEFAULT_REJECT_RESPONSE = Buffer.from('BAD REQUEST');

class WsServer implements D.IServer {

    public constructor(
        private _timeout: number,
        private _maxMessageSize: number,
        public readonly frameReceiveMode: D.EFrameReceiveMode,
    ) {}

    public get timeout(): number {

        return this._timeout;
    }

    public set timeout(v: number) {

        if (!Number.isSafeInteger(v) || v < 0) {

            throw new E.E_INVALID_CONFIG({ value: v, field: 'timeout' });
        }

        this._timeout = v;
    }

    public get maxMessageSize(): number {

        return this._maxMessageSize;
    }

    public set maxMessageSize(v: number) {

        if (!Number.isSafeInteger(v) || v < 0) {

            throw new E.E_INVALID_CONFIG({ value: v, field: 'maxMessageSize' });
        }

        this._maxMessageSize = v;
    }

    public isWebSocketRequest(req: Http.IncomingMessage): boolean {

        return typeof req.headers[D.H1_HDR_NAME_WS_KEY] === 'string'
            && req.headers[D.H1_HDR_NAME_CONN]?.toLowerCase() === D.H1_HDR_VALUE_CONNECTION.toLowerCase()
            && req.headers[D.H1_HDR_NAME_UPGRADE]?.toLowerCase() === D.H1_HDR_VALUE_UPGRADE.toLowerCase();
    }

    public extractSubProtocolFromRequest(req: Http.IncomingMessage): string[] {

        const sp = req.headers[D.H1_HDR_NAME_WS_PROTOCOL];

        if (typeof sp === 'string') {

            return [sp];
        }
        else if (Array.isArray(sp)) {

            return sp;
        }

        return [];
    }

    public accept(opts: D.IAcceptOptions): D.IWebSocket {

        const acceptHash = _.createAcceptHash(opts.request.headers[D.H1_HDR_NAME_WS_KEY]!);

        const header: Http.OutgoingHttpHeaders = {
            ...(opts.headers ?? {}),
            [D.H1_HDR_NAME_UPGRADE]: D.H1_HDR_VALUE_UPGRADE,
            [D.H1_HDR_NAME_CONN]: D.H1_HDR_VALUE_CONNECTION,
            [D.H1_HDR_NAME_WS_ACCEPT]: acceptHash,
        };

        if (opts.subProtocol) {

            header[D.H1_HDR_NAME_WS_PROTOCOL] = opts.subProtocol;
        }

        opts.socket.write([
            `HTTP/1.1 ${D.H1_STATUS_ACCEPTED}`,
            ...Object.entries(header).map(([k, v]) => `${k}: ${v as string}`),
            '\r\n'
        ].join('\r\n'));

        return new WsServerConnection(
            opts.socket,
            opts.socket instanceof TLSSocket,
            opts.timeout ?? this._timeout,
            this.frameReceiveMode,
            this.maxMessageSize,
        );
    }

    public reject(opts: D.IRejectOptions): void {

        const header: Http.OutgoingHttpHeaders = {
            ...(opts.headers ?? {}),
        };

        const RESP_BODY = opts.body ?? DEFAULT_REJECT_RESPONSE;

        header['Content-Length'] = Buffer.byteLength(RESP_BODY);

        opts.socket.write([
            `HTTP/1.1 ${opts.statusCode!}`,
            ...Object.entries(header).map(([k, v]) => `${k}: ${v as string}`),
            ''
        ].join('\r\n'));

        opts.socket.write(RESP_BODY);

        opts.socket.write('\r\n');

        opts.socket.end();
    }
}

export type IWsServerOptions = Partial<Pick<D.IServer, 'timeout' | 'frameReceiveMode' | 'maxMessageSize'>>;

export function createServer(opts: IWsServerOptions = {}): D.IServer {

    return new WsServer(
        opts.timeout ?? D.DEFAULT_TIMEOUT,
        opts.maxMessageSize ?? D.DEFAULT_MAX_MESSAGE_SIZE,
        opts.frameReceiveMode ?? D.EFrameReceiveMode.STANDARD,
    );
}
