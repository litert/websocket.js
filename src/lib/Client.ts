/**
 * Copyright 2023 Angus.Fenying <fenying@litert.org>
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
import * as _ from './Utils';
import * as Http from 'node:http';
import * as Https from 'node:https';
import * as TLS from 'node:tls';
import * as D from './Decl';
import * as E from './Errors';
import { AbstractWsConnection } from './AbstractConnection';

class WsClientConnection extends AbstractWsConnection implements D.IClient {

    public constructor(
        socket: $Net.Socket,
        timeout: number,
        liteFrameMode: boolean
    ) {

        super(socket, false, socket instanceof TLS.TLSSocket, timeout, liteFrameMode);

        this._maskKey = _.createRandomMaskKey();
    }

    public setMasking(mask: boolean | Buffer): void {

        this._maskKey = mask;
    }
}

export interface IClientHandshakeOptions {

    subProtocols?: string[];
}

export function createClientHandshakeHeaders(opts: IClientHandshakeOptions = {}): Http.OutgoingHttpHeaders {

    const key = _.createRandomString(20);

    const headers: Http.OutgoingHttpHeaders = {
        [D.H1_HDR_NAME_WS_KEY]: key,
        [D.H1_HDR_NAME_UPGRADE]: D.H1_HDR_VALUE_UPGRADE,
        [D.H1_HDR_NAME_CONN]: D.H1_HDR_VALUE_CONNECTION,
    };

    if (opts.subProtocols) {

        headers[D.H1_HDR_NAME_WS_PROTOCOL] = opts.subProtocols;
    }

    return headers;
}

interface IWsConnectOptionsBase {

    connectTimeout?: number;

    /**
     * Disable the `CONTINUATION` frames, to boost the performance.
     *
     * > May lead to incompatible with some servers who uses `CONTINUATION` frames.
     *
     * @default false
     */
    liteFrameMode?: boolean;
}

export interface IWssConnectOptions extends Https.RequestOptions, IWsConnectOptionsBase {}

export interface IWsConnectOptions extends Http.RequestOptions, IWsConnectOptionsBase {}

export function wssConnect(opts: IWssConnectOptions): Promise<D.IClient> {

    return connect(
        Https.request(opts),
        opts.timeout ?? D.DEFAULT_TIMEOUT,
        opts.connectTimeout ?? D.DEFAULT_CONNECT_TIMEOUT,
        opts.liteFrameMode,
    );
}

export function wsConnect(opts: IWsConnectOptions): Promise<D.IClient> {

    return connect(
        Http.request(opts),
        opts.timeout ?? D.DEFAULT_TIMEOUT,
        opts.connectTimeout ?? D.DEFAULT_CONNECT_TIMEOUT,
        opts.liteFrameMode,
    );
}

function connect(
    req: Http.ClientRequest,
    timeout: number,
    connectTimeout: number,
    liteFrameMode: boolean = false,
): Promise<D.IClient> {

    return new Promise((resolve, reject) => {

        if (connectTimeout) {

            req.on('socket', function(socket): void {
                socket.setTimeout(connectTimeout, function(): void {

                    socket.destroy(new E.E_TIMEOUT());
                });
            });
        }

        req.on('upgrade', (res: Http.IncomingMessage, socket: $Net.Socket) => {

            if (res.headers[D.H1_HDR_NAME_UPGRADE] !== D.H1_HDR_VALUE_UPGRADE.toLowerCase()) {

                res.destroy();
                reject(new E.E_HANDSHAKE_FAILED('Missing UPGRADE header'));
                return;
            }

            if (res.headers[D.H1_HDR_NAME_CONN]?.toLowerCase() !== D.H1_HDR_VALUE_CONNECTION.toLowerCase()) {

                res.destroy();
                reject(new E.E_HANDSHAKE_FAILED('Missing CONNECTION header'));
                return;
            }

            if (!res.headers[D.H1_HDR_NAME_WS_ACCEPT]) {

                res.destroy();
                reject(new Error('No accept response'));
                reject(new E.E_HANDSHAKE_FAILED('Missing SEC-WEBSOCKET-ACCEPT header'));
                return;
            }

            const wsKey = req.getHeader(D.H1_HDR_NAME_WS_KEY);

            if (typeof wsKey !== 'string') {

                res.destroy();
                reject(new E.E_HANDSHAKE_FAILED('Missing SEC-WEBSOCKET-KEY header in request'));
                return;
            }

            const hash = _.createAcceptHash(wsKey);

            if (hash !== res.headers[D.H1_HDR_NAME_WS_ACCEPT]) {

                res.destroy();
                reject(new E.E_HANDSHAKE_FAILED('SEC-WEBSOCKET-ACCEPT is mismatched with SEC-WEBSOCKET-KEY'));
                return;
            }

            const ws = new WsClientConnection(socket, timeout, liteFrameMode);

            ws.setMasking(_.createRandomMaskKey());

            resolve(ws);
        })
            .on('error', (e) => {

                reject(e);
            })
            .end();
    });
}
