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

/* eslint-disable @typescript-eslint/naming-convention */

/**
 * The error class for websocket.
 */
export abstract class WsError extends Error {

    public constructor(
        name: string,
        message: string,
        public readonly origin: unknown = null
    ) {

        super(message);
        this.name = name;
    }
}

export class E_CONN_LOST extends WsError {

    public constructor(origin: unknown = null) {

        super('conn_lost', 'Connection lost.', origin);
    }
}

export class E_CONN_READONLY extends WsError {

    public constructor(origin: unknown = null) {

        super('conn_readonly', 'Connection is readonly currently.', origin);
    }
}

export class E_FRAME_ENDED extends WsError {

    public constructor(origin: unknown = null) {

        super('frame_ended', 'Frame has already ended.', origin);
    }
}

export class E_FRAME_ABORTED extends WsError {

    public constructor(origin: unknown = null) {

        super('frame_aborted', 'Frame has been aborted.', origin);
    }
}

export class E_FRAME_BROKEN extends WsError {

    public constructor(origin: unknown = null) {

        super('frame_broken', 'The frame is spilt into multiple frames, which is not allowed under the lite frame mode.', origin);
    }
}

export class E_FRAME_TOO_LARGE extends WsError {

    public constructor(origin: unknown = null) {

        super('frame_too_large', 'Frame is too large.', origin);
    }
}

export class E_INVALID_PROTOCOL extends WsError {

    public constructor(message: string) {

        super('invalid_protocol', message);
    }
}

export class E_TIMEOUT extends WsError {

    public constructor(origin: unknown = null) {

        super('timeout', 'Connection timeout', origin);
    }
}

export class E_HANDSHAKE_FAILED extends WsError {

    public constructor(message: string) {

        super('handshake_failed', message);
    }
}
