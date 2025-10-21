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

import * as NodeNet from 'node:net';
import * as NodeHttp from 'node:http';
import * as NodeHttps from 'node:https';
import * as NodeTLS from 'node:tls';
import * as _ from './Utils';
import * as D from './Decl';
import * as E from './Errors';
import { AbstractWsConnection } from './AbstractConnection';

type IRequestMaker = () => NodeHttp.ClientRequest;

class WsClientConnection extends AbstractWsConnection implements D.IClient {

    private readonly _mkReq: IRequestMaker;

    private readonly _connectTimeout: number;

    public constructor(
        connectTimeout: number,
        mkReq: IRequestMaker,
        secure: boolean,
        timeout: number,
        frameReceiveMode?: D.EFrameReceiveMode,
        maxMessageSize?: number,
    ) {

        super(
            false,
            secure,
            timeout,
            frameReceiveMode,
            maxMessageSize,
        );

        this._mkReq = mkReq;
        this._connectTimeout = connectTimeout;

        this._writer.maskKey = _.createRandomMaskKey();
    }

    public setMasking(mask: boolean | Buffer): void {

        this._writer.maskKey = mask;
    }

    public connect(): Promise<void> {

        return new Promise((resolve, reject) => {

            const req = this._mkReq();

            if (this._connectTimeout) {

                req.on('socket', (socket): void => {

                    socket.setTimeout(this._connectTimeout, (): void => {

                        socket.destroy(new E.E_TIMEOUT());
                    });

                    socket.once('error', (e) => {

                        reject(e);
                    });
                });
            }

            req.on('upgrade', (res: NodeHttp.IncomingMessage, socket: NodeNet.Socket, head: Buffer) => {

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

                this._setup(socket, head);

                this.setMasking(_.createRandomMaskKey());

                resolve();
            })
                .on('close', () => {

                    reject(new E.E_HANDSHAKE_FAILED('Connection closed'));
                })
                .on('error', (e) => {

                    reject(e);
                })
                .end();
        });
    }
}

export interface IClientHandshakeOptions {

    subProtocols?: string[];
}

/**
 * Generate the headers for client handshake.
 *
 * @param opts The options for the handshake.
 *
 * @returns The headers for the handshake.
 */
function createClientHandshakeHeaders(opts: IClientHandshakeOptions = {}): NodeHttp.OutgoingHttpHeaders {

    const key = _.createRandomString(20);

    const headers: NodeHttp.OutgoingHttpHeaders = {
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

    /**
     * Whether to force a new connection.
     *
     * > In some case, the underlying HTTP/HTTPS agent may reuse an existing
     * > connection in the connection pool. This may cause some issues like
     * > CONN_RESET during the handshake. If you meet such issues, set this
     * > option to `true` to force a new connection.
     *
     * @default true
     */
    forceNewConnection?: boolean;
}

/**
 * The type for the options of secure WebSocket client.
 */
export interface IWssConnectOptions extends NodeHttps.RequestOptions, IWsConnectOptionsBase {}

/**
 * The type for the options of plain WebSocket client.
 */
export interface IWsConnectOptions extends NodeHttp.RequestOptions, IWsConnectOptionsBase {}

/**
 * Establish a WebSocket connection to a server via HTTPS.
 *
 * @param opts  The options for the connection.
 *
 * @returns     The promise of the WebSocket client.
 *
 * @deprecated Use `createSecureClient` method instead, because the client can
 * not process early data sent by server correctly if you use this method. And
 * this method will be removed in the future.
 */
export async function wssConnect(opts: IWssConnectOptions): Promise<D.IClient> {

    const ret = createSecureClient(opts);

    await ret.connect();

    return ret;
}

/**
 * Establish a WebSocket connection to a server via plain HTTP.
 *
 * @param opts  The options for the connection.
 *
 * @returns     The promise of the WebSocket client.
 *
 * @deprecated Use `createClient` method instead, because the client can not
 * process early data sent by server correctly if you use this method. And this
 * method will be removed in the future.
 */
export async function wsConnect(opts: IWsConnectOptions): Promise<D.IClient> {

    const ret = createClient(opts);

    await ret.connect();

    return ret;
}

/**
 * Create a WebSocket client via HTTPS.
 *
 * > The client will not connect to the server automatically. You need to call
 * > the `connect` method to establish the connection.
 * > Before calling `connect`, you must setup the event listeners to handle
 * > the events emitted during the connection.
 *
 * @param opts  The options for the connection.
 *
 * @returns   The secure WebSocket client.
 */
export function createSecureClient(opts: IWssConnectOptions): D.IClient {

    opts.headers = opts.headers ? {
        ...(opts.headers ?? {}),
        ...createClientHandshakeHeaders(opts.wsHandshakeOpts),
    } : createClientHandshakeHeaders(opts.wsHandshakeOpts);

    if (opts.forceNewConnection !== false) {

        opts.agent = undefined;

        opts.createConnection = (opts, onCreated) => {

            const socketOpts: NodeTLS.ConnectionOptions = opts.socketPath ? {

                ...opts,
                path: opts.socketPath,
                port: undefined,
                host: undefined,

            } : {

                ...opts,
                path: undefined,
                port: Number(opts.port ?? 443),
                host: opts.hostname ?? opts.host ?? 'localhost',
            };

            const socket = NodeTLS.connect(socketOpts);

            onCreated(null, socket);

            return socket;
        };
    }

    return new WsClientConnection(
        opts.connectTimeout ?? D.DEFAULT_CONNECT_TIMEOUT,
        () => NodeHttp.request(opts),
        false,
        opts.timeout ?? D.DEFAULT_TIMEOUT,
        opts.frameReceiveMode,
        opts.maxMessageSize,
    );
}

/**
 * Create a WebSocket client via plain HTTP.
 *
 * > The client will not connect to the server automatically. You need to call
 * > the `connect` method to establish the connection.
 * > Before calling `connect`, you must setup the event listeners to handle
 * > the events emitted during the connection.
 *
 * @param opts  The options for the connection.
 *
 * @returns  The plain WebSocket client.
 */
export function createClient(opts: IWsConnectOptions): D.IClient {

    opts.headers = opts.headers ? {
        ...(opts.headers ?? {}),
        ...createClientHandshakeHeaders(opts.wsHandshakeOpts),
    } : createClientHandshakeHeaders(opts.wsHandshakeOpts);

    if (opts.forceNewConnection !== false) {

        opts.agent = undefined;

        opts.createConnection = (connArgs, onCreated) => {

            const socketOpts: NodeNet.NetConnectOpts = opts.socketPath ? {
                'port': undefined,
                'host': undefined,
                'timeout': opts.connectTimeout ?? D.DEFAULT_CONNECT_TIMEOUT,
                'path': opts.socketPath,
            } : {
                'timeout': opts.connectTimeout ?? D.DEFAULT_CONNECT_TIMEOUT,
                'port': Number(connArgs.port ?? 80),
                'host': connArgs.hostname ?? connArgs.host ?? 'localhost',
                'path': undefined,
            };

            const socket = NodeNet.connect(socketOpts);

            onCreated(null, socket);

            return socket;
        };
    }

    return new WsClientConnection(
        opts.connectTimeout ?? D.DEFAULT_CONNECT_TIMEOUT,
        () => NodeHttp.request(opts),
        false,
        opts.timeout ?? D.DEFAULT_TIMEOUT,
        opts.frameReceiveMode,
        opts.maxMessageSize,
    );
}
