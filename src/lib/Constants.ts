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

/**
 * The reason codes for closing WebSocket connections.
 */
export enum ECloseReason {

    /**
     * Normally close.
     */
    BYE = 1000,

    /**
     * The endpoint is going away.
     */
    GOING_AWAY = 1001,

    /**
     * Protocol error.
     */
    PROTOCOL_ERROR = 1002,

    /**
     * Unsupported data.
     */
    UNSUPPORTED_DATA = 1003,

    /**
     * Reserved, do not use.
     * @deprecated
     */
    RESERVED = 1004,

    /**
     * No status code was present.
     */
    NO_STATUS = 1005,

    /**
     * Abnormal closure, no further detail available.
     */
    ABNORMAL = 1006,

    /**
     * Invalid frame payload data.
     */
    INVALID_PAYLOAD = 1007,

    /**
     * Policy violation.
     */
    POLICY_VIOLATION = 1008,

    /**
     * Message too big.
     */
    MESSAGE_TOO_BIG = 1009,

    /**
     * Missing required protocol extension.
     */
    MISSING_EXTENSION = 1010,

    /**
     * Internal server error.
     */
    INTERNAL_ERROR = 1011,
}

/**
 * The opcodes for WebSocket frames, aka frame types.
 */
export enum EOpcode {

    /**
     * Continuation frame, which is used to continue a fragmented message,
     * keeping the same type as the first frame of the message.
     */
    CONTINUATION = 0x0,

    /**
     * Text frame. The payload data is UTF-8 encoded text data.
     */
    TEXT = 0x1,

    /**
     * Binary frame. The payload data is binary data.
     */
    BINARY = 0x2,

    /**
     * Close frame. Indicates that the sender is closing the connection.
     */
    CLOSE = 0x8,

    /**
     * Ping frame. Used to check the connection status.
     */
    PING = 0x9,

    /**
     * Pong frame. Used to respond to a ping frame.
     */
    PONG = 0xA,
}

/**
 * The receiving mode of WebSocket messages provided by this library.
 */
export enum EFrameReceiveMode {

    /**
     * At this mode, when starts receiving a new message, a `IMessageReadStream` object will be
     * created, and the `message` events of `IWebSocket` objects will be triggered with it.
     */
    STANDARD,

    /**
     * At this mode, all messages will be received as a `ISimpleMessage` object, without
     * `CONTINUATION` frames supported and they will be refused.
     *
     * > **WARNING: Watch out the compatibility to the remote side.**
     */
    LITE,

    /**
     * At this mode, all messages will be received as a `ISimpleMessage` object, with `CONTINUATION`
     * frames supported.
     */
    SIMPLE,
}

/**
 * The maximum size of each message body.
 */
export const DEFAULT_MAX_MESSAGE_SIZE = 0x400_0000; // 64 MiB

/**
 * The default timeout for established connections.
 */
export const DEFAULT_TIMEOUT = 60_000;

/**
 * The default timeout for establishing connections.
 */
export const DEFAULT_CONNECT_TIMEOUT = 30_000;

/**
 * The HTTP header name for `Sec-WebSocket-Key`.
 */
export const H1_HDR_NAME_WS_KEY = 'sec-websocket-key';

/**
 * The HTTP header name for `Sec-WebSocket-Protocol`.
 */
export const H1_HDR_NAME_WS_PROTOCOL = 'sec-websocket-protocol';

/**
 * The HTTP header name for `Sec-WebSocket-Accept`.
 */
export const H1_HDR_NAME_WS_ACCEPT = 'sec-websocket-accept';

/**
 * The HTTP header name for `Connection`.
 */
export const H1_HDR_NAME_CONN = 'connection';

/**
 * The HTTP header value for `Connection` to indicate upgrade.
 */
export const H1_HDR_VALUE_CONNECTION = 'Upgrade';

/**
 * The HTTP header name for `Upgrade`.
 */
export const H1_HDR_NAME_UPGRADE = 'upgrade';

/**
 * The HTTP header value for `Upgrade` to indicate websocket.
 */
export const H1_HDR_VALUE_UPGRADE = 'websocket';

/**
 * The HTTP status code for accepted websocket handshake.
 */
export const H1_STATUS_ACCEPTED = 101;
