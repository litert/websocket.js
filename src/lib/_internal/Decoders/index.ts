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

import * as cL from '../../Constants';
import type * as dL from '../../Decl';
import * as eL from '../../Errors';
import { WsLiteDecoder } from './LiteDecoder';
import { WsSimpleDecoder } from './SimpleDecoder';
import { WsStandardDecoder } from './StandardDecoder';

export function getDecoder(
    mode: cL.EFrameReceiveMode,
    maxMessageSize: number = cL.DEFAULT_MAX_MESSAGE_SIZE,
): dL.IDecoder {

    switch (mode) {

        case cL.EFrameReceiveMode.STANDARD:
            return new WsStandardDecoder(maxMessageSize);
        case cL.EFrameReceiveMode.LITE:
            return new WsLiteDecoder(maxMessageSize);
        case cL.EFrameReceiveMode.SIMPLE:
            return new WsSimpleDecoder(maxMessageSize);
        default:
            throw new eL.E_INVALID_CONFIG({ value: mode, field: 'frameReceiveMode' });
    }
}
