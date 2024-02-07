import type * as D from './Decl';

export class WsSimpleMessage implements D.ISimpleMessage {

    public constructor(
        public readonly mode: D.EFrameReceiveMode.SIMPLE | D.EFrameReceiveMode.LITE,
        public readonly opcode: D.EOpcode,
        public readonly data: Buffer[],
    ) {}
}
