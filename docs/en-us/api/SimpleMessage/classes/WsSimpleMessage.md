[Documents for @litert/websocket](../../index.md) / [SimpleMessage](../index.md) / WsSimpleMessage

# Class: WsSimpleMessage

Defined in: [src/lib/SimpleMessage.ts:23](https://github.com/litert/websocket.js/blob/master/src/lib/SimpleMessage.ts#L23)

The simple message implementation.

## Implements

- [`ISimpleMessage`](../../Decl/interfaces/ISimpleMessage.md)

## Constructors

### Constructor

> **new WsSimpleMessage**(`mode`, `opcode`, `data`): `WsSimpleMessage`

Defined in: [src/lib/SimpleMessage.ts:25](https://github.com/litert/websocket.js/blob/master/src/lib/SimpleMessage.ts#L25)

#### Parameters

##### mode

[`LITE`](../../Constants/enumerations/EFrameReceiveMode.md#lite) | [`SIMPLE`](../../Constants/enumerations/EFrameReceiveMode.md#simple)

##### opcode

[`EOpcode`](../../Constants/enumerations/EOpcode.md)

##### data

`Buffer`\<`ArrayBufferLike`\>[]

#### Returns

`WsSimpleMessage`

## Properties

### data

> `readonly` **data**: `Buffer`\<`ArrayBufferLike`\>[]

Defined in: [src/lib/SimpleMessage.ts:28](https://github.com/litert/websocket.js/blob/master/src/lib/SimpleMessage.ts#L28)

The full data of this message.

#### Implementation of

[`ISimpleMessage`](../../Decl/interfaces/ISimpleMessage.md).[`data`](../../Decl/interfaces/ISimpleMessage.md#data)

***

### mode

> `readonly` **mode**: [`LITE`](../../Constants/enumerations/EFrameReceiveMode.md#lite) \| [`SIMPLE`](../../Constants/enumerations/EFrameReceiveMode.md#simple)

Defined in: [src/lib/SimpleMessage.ts:26](https://github.com/litert/websocket.js/blob/master/src/lib/SimpleMessage.ts#L26)

The mode of receiving these frames.

#### Implementation of

[`ISimpleMessage`](../../Decl/interfaces/ISimpleMessage.md).[`mode`](../../Decl/interfaces/ISimpleMessage.md#mode)

***

### opcode

> `readonly` **opcode**: [`EOpcode`](../../Constants/enumerations/EOpcode.md)

Defined in: [src/lib/SimpleMessage.ts:27](https://github.com/litert/websocket.js/blob/master/src/lib/SimpleMessage.ts#L27)

The type of this message.

#### Implementation of

[`ISimpleMessage`](../../Decl/interfaces/ISimpleMessage.md).[`opcode`](../../Decl/interfaces/ISimpleMessage.md#opcode)
