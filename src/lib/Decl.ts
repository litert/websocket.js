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

/* eslint-disable max-lines */

import type * as Tls from 'node:tls';
import type * as Http from 'node:http';
import type * as Net from 'node:net';
import type { Readable, Writable, WritableOptions } from 'node:stream';
import type * as cL from './Constants';

/**
 * The base interface of received websocket message.
 */
export interface IMessage {

    /**
     * The mode of receiving these frames.
     */
    mode: cL.EFrameReceiveMode;

    /**
     * The type of this message.
     */
    opcode: cL.EOpcode;
}

/**
 * The interface of simple websocket message, which contains the full message data.
 */
export interface ISimpleMessage extends IMessage {

    mode: cL.EFrameReceiveMode.LITE | cL.EFrameReceiveMode.SIMPLE;

    /**
     * The full data of this message.
     */
    data: Buffer[];
}

/**
 * The interface of websocket server.
 */
export interface IServer {

    /**
     * The timeout in milliseconds for the new connections.
     *
     * > Set to `0` to disable the timeout.
     *
     * @default 60000
     * @type uint32
     */
    timeout: number;

    /**
     * The maximum size of each message body.
     *
     * > Changing this value will not affect the existing connections.
     *
     * @default 67108864 (64 MiB)
     * @see DEFAULT_MAX_MESSAGE_SIZE
     */
    maxMessageSize: number;

    /**
     * The mode of receiving frames.
     *
     * @default EFrameReceiveMode.STANDARD
     */
    readonly frameReceiveMode: cL.EFrameReceiveMode;

    /**
     * Accept the websocket request.
     */
    accept(opts: IAcceptOptions): IWebSocket;

    /**
     * Reject the websocket request.
     */
    reject(opts: IRejectOptions): void;

    /**
     * Tell if the request is a websocket request.
     */
    isWebSocketRequest(req: Http.IncomingMessage): boolean;
}

/**
 * The interface of websocket client.
 */
export interface IClient extends IWebSocket {

    /**
     * Set the mask key for websocket frames.
     *
     * - Set to `false` to disable masking, which is not recommended for compatibility.
     * - Set to `true` to generate a random mask key for every frame.
     * - Set to a `Buffer` object to use it as mask key for every frame.
     *
     * > The RFC-6455 requires masking all frames from client, but not from server.
     * > This library will mask all frames by default, for compatibility, but not enforced.
     * > The server can still accept unmasked frames from client.
     * > If you want to disable masking, you should make sure the server will not refuse the unmasked frames.
     *
     * > **NOTE: The default behavior is to mask all frames using an initial random key.**
     *
     * @param key   The key for websocket handshake.
     */
    setMasking(key: Buffer | boolean): void;

    /**
     * Connect to the server.
     *
     * > This method can only be called once, and only when the connection is
     * > not established yet.
     * > Considering the early data sent by server during the handshake,
     * > you must set up the `message` event handler before calling this method.
     * > Or you will miss the early data sent by server.
     *
     * @throws `E_HANDSHAKE_FAILED` will be thrown if the connection is failed.
     * @throws `E_TIMEOUT` will be thrown if timeout happened during connecting.
     *
     * @returns The promise for connecting, which will be resolved when connection
     * is established, or rejected if any error happened.
     */
    connect(): Promise<void>;
}

/**
 * The options for `IServer.accept()` method.
 */
export interface IAcceptOptions {

    /**
     * The HTTP request object for the websocket handshake request.
     */
    'request': Http.IncomingMessage;

    /**
     * The TCP socket for the websocket connection.
     *
     * For the `socket` parameter from `upgrade` event of `http.Server` object,
     * you may need to force-cast it to `Net.Socket` type (although it is actually
     * a `Net.Socket` object indeed), because its type is not equitable in TypeScript.
     */
    'socket': Net.Socket;

    /**
     * The extra HTTP header of the response to accept the websocket request.
     */
    'headers'?: Http.OutgoingHttpHeaders;

    /**
     * The timeout for the new websocket connection.
     */
    'timeout'?: number;

    /**
     * The whitelist of sub-protocols, matched by the order in the list.
     */
    'subProtocol'?: string;

    /**
     * The third parameter of the `upgrade` event of `http.Server` object.
     *
     * It's the payload data sent immediately after the websocket handshake
     * request, without waiting for the reply of the handshake response,
     * which could make it feels like 0-RTT.
     */
    'clientEarlyDataPayload'?: Buffer | null;
}

/**
 * The options for `IServer.reject()` method.
 */
export interface IRejectOptions {

    /**
     * The HTTP request object for the websocket handshake request.
     */
    'request': Http.IncomingMessage;

    /**
     * The TCP socket for the websocket connection.
     *
     * For the `socket` parameter from `upgrade` event of `http.Server` object,
     * you may need to force-cast it to `Net.Socket` type (although it is actually
     * a `Net.Socket` object indeed), because its type is not equitable in TypeScript.
     */
    'socket': Net.Socket;

    /**
     * The HTTP status code of the response to reject the websocket request.
     *
     * @default 400
     */
    'statusCode'?: number;

    /**
     * The extra HTTP header of the response to reject the websocket request.
     */
    'headers'?: Http.OutgoingHttpHeaders;

    /**
     * The entity body of the response to reject the websocket request.
     */
    'body'?: string | Buffer;
}

/**
 * The interface of websocket message reader, implements `Readable` stream.
 *
 * @noInheritDoc
 */
export interface IMessageReadStream extends Readable, IMessage {

    /**
     * The mode of receiving frames.
     * Only and always for `EFrameReceiveMode.STANDARD`.
     */
    readonly mode: cL.EFrameReceiveMode.STANDARD;

    /**
     * The opcode of this message.
     */
    readonly opcode: cL.EOpcode;

    /**
     * Read all data in this message as a string.
     */
    toString(): Promise<string>;

    /**
     * Read all data in this message as a single buffer.
     */
    toBuffer(): Promise<Buffer>;

    /**
     * Read all data in this message as an array of buffers, without copying data.
     */
    toBufferArray(): Promise<Buffer[]>;
}

/**
 * The interface of websocket message writer, implements `Writable` stream.
 *
 * @noInheritDoc
 */
export interface IMessageWriter extends Writable {

    /**
     * The type of this message.
     */
    readonly opcode: cL.EOpcode;
}

/**
 * The interface of websocket message decoder.
 */
export interface IDecoder {

    /**
     * The maximum size of a message.
     */
    readonly maxMessageSize: number;

    /**
     * Decode a chunk of data, and return the decoded messages.
     *
     * If tail of the chunk is an incomplete frame, it will be buffered inside
     * the decoder, and used in the next `decode()` call.
     *
     * @param chunk     The chunk of data to decode.
     */
    decode(chunk: Buffer): Array<IMessageReadStream | IMessage>;

    /**
     * Reset the internal state of the decoder, clearing all buffered data.
     */
    reset(): void;
}

/**
 * The callback type for error handling.
 */
export type IErrorCallback = (e?: Error | null) => void;

/**
 * The base interface of websocket connection, implements both readable and writable stream.
 */
export interface IWebSocket {

    /**
     * Tell whether the connection is connected.
     */
    readonly connected: boolean;

    /**
     * The mode of receiving frames.
     *
     * @default EFrameReceiveMode.STANDARD
     */
    readonly frameReceiveMode: cL.EFrameReceiveMode;

    /**
     * Tell whether the connection is writable.
     */
    readonly writable: boolean;

    /**
     * Tell whether the connection is finished writing, and no more data could be written in.
     */
    readonly finished: boolean;

    /**
     * Tell whether the connection is ended reading, and no more data could be read from.
     */
    readonly ended: boolean;

    /**
     * Tell the remote IP address of this socket.
     */
    readonly remoteAddress: string | null;

    /**
     * Tell the remote port of this socket.
     */
    readonly remotePort: number | null;

    /**
     * Tell the local IP address of this socket.
     */
    readonly localAddress: string | null;

    /**
     * Tell the local port of this socket.
     */
    readonly localPort: number | null;

    /**
     * Tell the information of TLS certificate of remote peer.
     */
    readonly peerCertificate: Tls.PeerCertificate | null;

    /**
     * Tell if this socket is a TLS socket.
     */
    readonly tls: boolean;

    /**
     * Tell if this socket is a server-side socket.
     */
    readonly isServer: boolean;

    /**
     * The maximum size of each message body.
     *
     * @default 67108864 (64 MiB)
     */
    readonly maxMessageSize: number;

    /**
     * The timeout in milliseconds for the connections after connection is established.
     *
     * > Timeout means the connection is idle for a long time, and the connection will be closed.
     *
     * > Set to `0` to disable the timeout.
     *
     * @default 60000
     * @type uint32
     */
    timeout: number;

    /* eslint-disable @typescript-eslint/unified-signatures */

    /**
     * Register a callback for event "message", which will be triggered when a new message is received.
     *
     * > The type `msg` parameter in `listener` depends on the `frameReceiveMode` property.
     *
     * @param event     The event name.
     * @param listener  The callback function.
     * @see IWebSocket.frameReceiveMode
     */
    on(event: 'message', listener: (msg: IMessageReadStream | ISimpleMessage) => void): this;

    /**
     * Register a callback for event "error", which will be triggered when an error occurred.
     * @param event     The event name.
     * @param listener  The callback function.
     */
    on(event: 'error', listener: (error: unknown) => void): this;

    /**
     * Register a callback for event "drain", which will be triggered when an all data in buffer flushed out.
     * @param event     The event name.
     * @param listener  The callback function.
     */
    on(event: 'drain', listener: () => void): this;

    /**
     * Register a callback for event "end", which will be triggered when the websocket is closed by remote-side.
     *
     * @param event     The event name.
     * @param listener  The callback function.
     */
    on(event: 'end', listener: () => void): this;

    /**
     * Register a callback for event "finish", which will be triggered when the websocket is closed by local-side.
     *
     * @param event     The event name.
     * @param listener  The callback function.
     */
    on(event: 'finish', listener: () => void): this;

    /**
     * Register a callback for event "timeout", which will be triggered when the websocket is closed by local-side.
     *
     * @param event     The event name.
     * @param listener  The callback function.
     */
    on(event: 'timeout', listener: () => void): this;

    /**
     * Register a callback for event "close", which will be triggered when the websocket is closed by local-side.
     * @param event     The event name.
     * @param listener  The callback function.
     */
    on(event: 'close', listener: (error?: unknown) => void): this;

    /* eslint-enable @typescript-eslint/unified-signatures */

    /**
     * Create a fragment writer for a message.
     *
     * > NOTICES:
     * > - Don't forget to call `end()` method of the writer to send out the last frame of the message.
     * > - Don't send any other messages out of the writer before calling its `end()` method.
     */
    createMessageWriter(opcode: cL.EOpcode, opts?: WritableOptions): IMessageWriter;

    /**
     * Send a text message to remote-side, in a single TEXT message.
     *
     * @throws `E_CONN_LOST` will be thrown if the connection is closed.
     * @throws `E_CONN_READONLY` will be thrown if the connection is not writable (half-closed).
     *
     * @returns true if the data is flushed to kernel buffer completely, otherwise false.
     */
    writeText(data: Buffer | string | Array<Buffer | string>, callback?: IErrorCallback): boolean;

    /**
     * Send a binary message to remote-side, in a single BINARY message.
     *
     * @throws `E_CONN_LOST` will be thrown if the connection is closed.
     * @throws `E_CONN_READONLY` will be thrown if the connection is not writable (half-closed).
     *
     * @returns true if the data is flushed to kernel buffer completely, otherwise false.
     */
    writeBinary(data: Buffer | string | Array<Buffer | string>, callback?: IErrorCallback): boolean;

    /**
     * Send a single PING message to remote-side, with an optional data.
     *
     * @throws `E_CONN_LOST` will be thrown if the connection is closed.
     * @throws `E_CONN_READONLY` will be thrown if the connection is not writable (half-closed).
     *
     * @returns true if the data is flushed to kernel buffer completely, otherwise false.
     */
    ping(data?: Buffer | string | Array<string | Buffer>, callback?: IErrorCallback): boolean;

    /**
     * Send a single PONG message to remote-side, with an optional data.
     *
     * @throws `E_CONN_LOST` will be thrown if the connection is closed.
     * @throws `E_CONN_READONLY` will be thrown if the connection is not writable (half-closed).
     *
     * @returns true if the data is flushed to kernel buffer completely, otherwise false.
     */
    pong(data?: Buffer | string | Array<string | Buffer>, callback?: IErrorCallback): boolean;

    /**
     * Send a single CLOSE message to remote-side, and then close the socket.
     *
     * > If socket is already closed, nothing will happen, and `false` will be returned.
     *
     * @param reason    The reason code for closing. [default: `ECloseReason.BYE`]
     * @returns `true` if the data is flushed to kernel buffer completely, otherwise `false`.
     */
    end(reason?: cL.ECloseReason, callback?: IErrorCallback): boolean;

    /**
     * Close the socket and disable all ops on this socket.
     */
    destroy(): void;
}
