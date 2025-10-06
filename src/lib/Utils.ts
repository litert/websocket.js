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

import * as Crypto from 'node:crypto';

const WS_ACCEPT_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

export function createAcceptHash(key: string): string {

    return Crypto.createHash('sha1')
        .update(`${key}${WS_ACCEPT_GUID}`)
        .digest('base64');
}

export function createRandomMaskKey(): Buffer {

    return Crypto.randomBytes(4);
}

export function createRandomString(length: number): string {

    return Crypto.randomBytes(length).toString('base64');
}
