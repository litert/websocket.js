[Documents for @litert/websocket](../../index.md) / [Decl](../index.md) / IMessageReadStream

# Interface: IMessageReadStream

Defined in: [src/lib/Decl.ts:229](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L229)

The interface of websocket message reader, implements `Readable` stream.

## Extends

- `Readable`.[`IMessage`](IMessage.md)

## Properties

### mode

> `readonly` **mode**: [`STANDARD`](../../Constants/enumerations/EFrameReceiveMode.md#standard)

Defined in: [src/lib/Decl.ts:235](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L235)

The mode of receiving frames.
Only and always for `EFrameReceiveMode.STANDARD`.

#### Overrides

[`IMessage`](IMessage.md).[`mode`](IMessage.md#mode)

***

### opcode

> `readonly` **opcode**: [`EOpcode`](../../Constants/enumerations/EOpcode.md)

Defined in: [src/lib/Decl.ts:240](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L240)

The opcode of this message.

#### Overrides

[`IMessage`](IMessage.md).[`opcode`](IMessage.md#opcode)

## Methods

### toBuffer()

> **toBuffer**(): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: [src/lib/Decl.ts:250](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L250)

Read all data in this message as a single buffer.

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

***

### toBufferArray()

> **toBufferArray**(): `Promise`\<`Buffer`\<`ArrayBufferLike`\>[]\>

Defined in: [src/lib/Decl.ts:255](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L255)

Read all data in this message as an array of buffers, without copying data.

#### Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>[]\>

***

### toString()

> **toString**(): `Promise`\<`string`\>

Defined in: [src/lib/Decl.ts:245](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L245)

Read all data in this message as a string.

#### Returns

`Promise`\<`string`\>
