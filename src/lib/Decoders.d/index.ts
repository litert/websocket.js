import * as D from '../Decl';
import * as E from '../Errors';
import { WsLiteDecoder } from './LiteDecoder';
import { WsSimpleDecoder } from './SimpleDecoder';
import { WsStandardDecoder } from './StandardDecoder';

export function getDecoder(
    mode: D.EFrameReceiveMode,
    maxMessageSize: number = D.DEFAULT_MAX_MESSAGE_SIZE,
): D.IDecoder {

    switch (mode) {

        case D.EFrameReceiveMode.STANDARD:
            return new WsStandardDecoder(maxMessageSize);
        case D.EFrameReceiveMode.LITE:
            return new WsLiteDecoder(maxMessageSize);
        case D.EFrameReceiveMode.SIMPLE:
            return new WsSimpleDecoder(maxMessageSize);
        default:
            throw new E.E_INVALID_CONFIG({ value: mode, field: 'frameReceiveMode' });
    }
}
