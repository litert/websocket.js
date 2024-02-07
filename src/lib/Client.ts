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
        frameReceiveMode?: D.EFrameReceiveMode,
        maxMessageSize?: number,
    ) {

        super(
            socket,
            false,
            socket instanceof TLS.TLSSocket,
            timeout,
            frameReceiveMode,
            maxMessageSize
        );

        this._helper.maskKey = _.createRandomMaskKey();
    }

    public setMasking(mask: boolean | Buffer): void {

        this._helper.maskKey = mask;
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

    /**
     * The timeout for connecting to the server.
     *
     * @see D.DEFAULT_CONNECT_TIMEOUT
     */
    connectTimeout?: number;

    /**
     * The mode of receiving frames.
     *
     * @see D.EFrameReceiveMode.STANDARD
     */
    frameReceiveMode?: D.EFrameReceiveMode;

    /**
     * The maximum size of each message.
     *
     * @see D.DEFAULT_MAX_MESSAGE_SIZE
     */
    maxMessageSize?: number;

    /**
     * The options for the handshake.
     *
     * @default {}
     */
    wsHandshakeOpts?: IClientHandshakeOptions;
}

export interface IWssConnectOptions extends Https.RequestOptions, IWsConnectOptionsBase {}

export interface IWsConnectOptions extends Http.RequestOptions, IWsConnectOptionsBase {}

/**
 * Establish a WebSocket connection to a server via HTTPS.
 *
 * @param opts  The options for the connection.
 *
 * @returns     The promise of the WebSocket client.
 */
export function wssConnect(opts: IWssConnectOptions): Promise<D.IClient> {

    opts.headers = opts.headers ? {
        ...(opts.headers ?? {}),
        ...createClientHandshakeHeaders(opts.wsHandshakeOpts),
    } : createClientHandshakeHeaders(opts.wsHandshakeOpts);

    return connect(
        Https.request(opts),
        opts.timeout ?? D.DEFAULT_TIMEOUT,
        opts.connectTimeout ?? D.DEFAULT_CONNECT_TIMEOUT,
        opts.frameReceiveMode,
        opts.maxMessageSize,
    );
}

/**
 * Establish a WebSocket connection to a server via plain HTTP.
 *
 * @param opts  The options for the connection.
 *
 * @returns     The promise of the WebSocket client.
 */
export function wsConnect(opts: IWsConnectOptions): Promise<D.IClient> {

    opts.headers = opts.headers ? {
        ...(opts.headers ?? {}),
        ...createClientHandshakeHeaders(opts.wsHandshakeOpts),
    } : createClientHandshakeHeaders(opts.wsHandshakeOpts);

    return connect(
        Http.request(opts),
        opts.timeout ?? D.DEFAULT_TIMEOUT,
        opts.connectTimeout ?? D.DEFAULT_CONNECT_TIMEOUT,
        opts.frameReceiveMode,
        opts.maxMessageSize,
    );
}

function connect(
    req: Http.ClientRequest,
    timeout: number,
    connectTimeout: number,
    frameReceiveMode?: D.EFrameReceiveMode,
    maxMessageSize?: number,
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

            const ws = new WsClientConnection(socket, timeout, frameReceiveMode, maxMessageSize);

            ws.setMasking(_.createRandomMaskKey());

            resolve(ws);
        })
            .on('error', (e) => {

                reject(e);
            })
            .end();
    });
}
