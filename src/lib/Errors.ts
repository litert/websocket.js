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

/* eslint-disable @typescript-eslint/naming-convention */

type IErrorContext = Record<string, any>;

/**
 * The error class for websocket.
 */
export abstract class WsError extends Error {

    public constructor(
        name: string,
        message: string,
        public readonly context: IErrorContext,
        public readonly origin: unknown
    ) {

        super(message);
        this.name = name;
    }
}

export class E_CONN_LOST extends WsError {

    public constructor(context: IErrorContext = {}, origin: unknown = null) {

        super('conn_lost', 'Connection lost.', context, origin);
    }
}

export class E_CONN_READONLY extends WsError {

    public constructor(context: IErrorContext = {}, origin: unknown = null) {

        super('conn_readonly', 'Connection is readonly currently.', context, origin);
    }
}

export class E_CONN_BUSY extends WsError {

    public constructor(context: IErrorContext = {}, origin: unknown = null) {

        super('conn_busy', 'There is a writing stream locked on the socket.', context, origin);
    }
}

export class E_FRAME_ENDED extends WsError {

    public constructor(context: IErrorContext = {}, origin: unknown = null) {

        super('frame_ended', 'Frame has already ended.', context, origin);
    }
}

export class E_FRAME_BROKEN extends WsError {

    public constructor(context: IErrorContext = {}, origin: unknown = null) {

        super('frame_broken', 'The frame is spilt into multiple frames, which is not allowed under the lite frame mode.', context, origin);
    }
}

export class E_MESSAGE_TOO_LARGE extends WsError {

    public constructor(context: IErrorContext = {}, origin: unknown = null) {

        super('frame_too_large', 'Frame is too large.', context, origin);
    }
}

export class E_INVALID_PROTOCOL extends WsError {

    public constructor(message: string, context: IErrorContext = {}, origin: unknown = null) {

        super('invalid_protocol', message, context, origin);
    }
}

export class E_TIMEOUT extends WsError {

    public constructor(context: IErrorContext = {}, origin: unknown = null) {

        super('timeout', 'Connection timeout', context, origin);
    }
}

export class E_INVALID_CONFIG extends WsError {

    public constructor(context: IErrorContext = {}, origin: unknown = null) {

        super('invalid_config', 'The new configuration value is invalid', context, origin);
    }
}

export class E_HANDSHAKE_FAILED extends WsError {

    public constructor(message: string, context: IErrorContext = {}, origin: unknown = null) {

        super('handshake_failed', message, context, origin);
    }
}
