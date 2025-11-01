[Documents for @litert/websocket](../../index.md) / [Decl](../index.md) / ISimpleMessage

# Interface: ISimpleMessage

Defined in: [src/lib/Decl.ts:44](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L44)

The interface of simple websocket message, which contains the full message data.

## Extends

- [`IMessage`](IMessage.md)

## Properties

### data

> **data**: `Buffer`\<`ArrayBufferLike`\>[]

Defined in: [src/lib/Decl.ts:51](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L51)

The full data of this message.

***

### mode

> **mode**: [`LITE`](../../Constants/enumerations/EFrameReceiveMode.md#lite) \| [`SIMPLE`](../../Constants/enumerations/EFrameReceiveMode.md#simple)

Defined in: [src/lib/Decl.ts:46](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L46)

The mode of receiving these frames.

#### Overrides

[`IMessage`](IMessage.md).[`mode`](IMessage.md#mode)

***

### opcode

> **opcode**: [`EOpcode`](../../Constants/enumerations/EOpcode.md)

Defined in: [src/lib/Decl.ts:38](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L38)

The type of this message.

#### Inherited from

[`IMessage`](IMessage.md).[`opcode`](IMessage.md#opcode)
