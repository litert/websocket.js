[Documents for @litert/websocket](../../index.md) / [Decl](../index.md) / IDecoder

# Interface: IDecoder

Defined in: [src/lib/Decl.ts:274](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L274)

The interface of websocket message decoder.

## Properties

### maxMessageSize

> `readonly` **maxMessageSize**: `number`

Defined in: [src/lib/Decl.ts:279](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L279)

The maximum size of a message.

## Methods

### decode()

> **decode**(`chunk`): ([`IMessage`](IMessage.md) \| [`IMessageReadStream`](IMessageReadStream.md))[]

Defined in: [src/lib/Decl.ts:289](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L289)

Decode a chunk of data, and return the decoded messages.

If tail of the chunk is an incomplete frame, it will be buffered inside
the decoder, and used in the next `decode()` call.

#### Parameters

##### chunk

`Buffer`

The chunk of data to decode.

#### Returns

([`IMessage`](IMessage.md) \| [`IMessageReadStream`](IMessageReadStream.md))[]

***

### reset()

> **reset**(): `void`

Defined in: [src/lib/Decl.ts:294](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L294)

Reset the internal state of the decoder, clearing all buffered data.

#### Returns

`void`
