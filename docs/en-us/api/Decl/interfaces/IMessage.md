[Documents for @litert/websocket](../../index.md) / [Decl](../index.md) / IMessage

# Interface: IMessage

Defined in: [src/lib/Decl.ts:28](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L28)

The base interface of received websocket message.

## Extended by

- [`ISimpleMessage`](ISimpleMessage.md)
- [`IMessageReadStream`](IMessageReadStream.md)

## Properties

### mode

> **mode**: [`EFrameReceiveMode`](../../Constants/enumerations/EFrameReceiveMode.md)

Defined in: [src/lib/Decl.ts:33](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L33)

The mode of receiving these frames.

***

### opcode

> **opcode**: [`EOpcode`](../../Constants/enumerations/EOpcode.md)

Defined in: [src/lib/Decl.ts:38](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L38)

The type of this message.
