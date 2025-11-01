[Documents for @litert/websocket](../../index.md) / [Decl](../index.md) / IWebSocket

# Interface: IWebSocket

Defined in: [src/lib/Decl.ts:305](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L305)

The base interface of websocket connection, implements both readable and writable stream.

## Extended by

- [`IClient`](IClient.md)

## Properties

### connected

> `readonly` **connected**: `boolean`

Defined in: [src/lib/Decl.ts:310](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L310)

Tell whether the connection is connected.

***

### ended

> `readonly` **ended**: `boolean`

Defined in: [src/lib/Decl.ts:332](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L332)

Tell whether the connection is ended reading, and no more data could be read from.

***

### finished

> `readonly` **finished**: `boolean`

Defined in: [src/lib/Decl.ts:327](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L327)

Tell whether the connection is finished writing, and no more data could be written in.

***

### frameReceiveMode

> `readonly` **frameReceiveMode**: [`EFrameReceiveMode`](../../Constants/enumerations/EFrameReceiveMode.md)

Defined in: [src/lib/Decl.ts:317](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L317)

The mode of receiving frames.

#### Default

```ts
EFrameReceiveMode.STANDARD
```

***

### isServer

> `readonly` **isServer**: `boolean`

Defined in: [src/lib/Decl.ts:367](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L367)

Tell if this socket is a server-side socket.

***

### localAddress

> `readonly` **localAddress**: `string` \| `null`

Defined in: [src/lib/Decl.ts:347](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L347)

Tell the local IP address of this socket.

***

### localPort

> `readonly` **localPort**: `number` \| `null`

Defined in: [src/lib/Decl.ts:352](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L352)

Tell the local port of this socket.

***

### maxMessageSize

> `readonly` **maxMessageSize**: `number`

Defined in: [src/lib/Decl.ts:374](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L374)

The maximum size of each message body.

#### Default

```ts
67108864 (64 MiB)
```

***

### peerCertificate

> `readonly` **peerCertificate**: `PeerCertificate` \| `null`

Defined in: [src/lib/Decl.ts:357](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L357)

Tell the information of TLS certificate of remote peer.

***

### remoteAddress

> `readonly` **remoteAddress**: `string` \| `null`

Defined in: [src/lib/Decl.ts:337](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L337)

Tell the remote IP address of this socket.

***

### remotePort

> `readonly` **remotePort**: `number` \| `null`

Defined in: [src/lib/Decl.ts:342](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L342)

Tell the remote port of this socket.

***

### timeout

> **timeout**: `number`

Defined in: [src/lib/Decl.ts:386](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L386)

The timeout in milliseconds for the connections after connection is established.

> Timeout means the connection is idle for a long time, and the connection will be closed.

> Set to `0` to disable the timeout.

#### Default

```ts
60000
```

***

### tls

> `readonly` **tls**: `boolean`

Defined in: [src/lib/Decl.ts:362](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L362)

Tell if this socket is a TLS socket.

***

### writable

> `readonly` **writable**: `boolean`

Defined in: [src/lib/Decl.ts:322](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L322)

Tell whether the connection is writable.

## Methods

### createMessageWriter()

> **createMessageWriter**(`opcode`, `opts?`): [`IMessageWriter`](IMessageWriter.md)

Defined in: [src/lib/Decl.ts:455](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L455)

Create a fragment writer for a message.

> NOTICES:
> - Don't forget to call `end()` method of the writer to send out the last frame of the message.
> - Don't send any other messages out of the writer before calling its `end()` method.

#### Parameters

##### opcode

[`EOpcode`](../../Constants/enumerations/EOpcode.md)

##### opts?

`WritableOptions`\<`Writable`\>

#### Returns

[`IMessageWriter`](IMessageWriter.md)

***

### destroy()

> **destroy**(): `void`

Defined in: [src/lib/Decl.ts:510](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L510)

Close the socket and disable all ops on this socket.

#### Returns

`void`

***

### end()

> **end**(`reason?`, `callback?`): `boolean`

Defined in: [src/lib/Decl.ts:505](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L505)

Send a single CLOSE message to remote-side, and then close the socket.

> If socket is already closed, nothing will happen, and `false` will be returned.

#### Parameters

##### reason?

[`ECloseReason`](../../Constants/enumerations/ECloseReason.md)

The reason code for closing. [default: `ECloseReason.BYE`]

##### callback?

[`IErrorCallback`](../type-aliases/IErrorCallback.md)

#### Returns

`boolean`

`true` if the data is flushed to kernel buffer completely, otherwise `false`.

***

### on()

#### Call Signature

> **on**(`event`, `listener`): `this`

Defined in: [src/lib/Decl.ts:399](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L399)

Register a callback for event "message", which will be triggered when a new message is received.

> The type `msg` parameter in `listener` depends on the `frameReceiveMode` property.

##### Parameters

###### event

`"message"`

The event name.

###### listener

(`msg`) => `void`

The callback function.

##### Returns

`this`

##### See

IWebSocket.frameReceiveMode

#### Call Signature

> **on**(`event`, `listener`): `this`

Defined in: [src/lib/Decl.ts:406](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L406)

Register a callback for event "error", which will be triggered when an error occurred.

##### Parameters

###### event

`"error"`

The event name.

###### listener

(`error`) => `void`

The callback function.

##### Returns

`this`

#### Call Signature

> **on**(`event`, `listener`): `this`

Defined in: [src/lib/Decl.ts:413](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L413)

Register a callback for event "drain", which will be triggered when an all data in buffer flushed out.

##### Parameters

###### event

`"drain"`

The event name.

###### listener

() => `void`

The callback function.

##### Returns

`this`

#### Call Signature

> **on**(`event`, `listener`): `this`

Defined in: [src/lib/Decl.ts:421](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L421)

Register a callback for event "end", which will be triggered when the websocket is closed by remote-side.

##### Parameters

###### event

`"end"`

The event name.

###### listener

() => `void`

The callback function.

##### Returns

`this`

#### Call Signature

> **on**(`event`, `listener`): `this`

Defined in: [src/lib/Decl.ts:429](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L429)

Register a callback for event "finish", which will be triggered when the websocket is closed by local-side.

##### Parameters

###### event

`"finish"`

The event name.

###### listener

() => `void`

The callback function.

##### Returns

`this`

#### Call Signature

> **on**(`event`, `listener`): `this`

Defined in: [src/lib/Decl.ts:437](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L437)

Register a callback for event "timeout", which will be triggered when the websocket is closed by local-side.

##### Parameters

###### event

`"timeout"`

The event name.

###### listener

() => `void`

The callback function.

##### Returns

`this`

#### Call Signature

> **on**(`event`, `listener`): `this`

Defined in: [src/lib/Decl.ts:444](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L444)

Register a callback for event "close", which will be triggered when the websocket is closed by local-side.

##### Parameters

###### event

`"close"`

The event name.

###### listener

(`error?`) => `void`

The callback function.

##### Returns

`this`

***

### ping()

> **ping**(`data?`, `callback?`): `boolean`

Defined in: [src/lib/Decl.ts:485](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L485)

Send a single PING message to remote-side, with an optional data.

#### Parameters

##### data?

`string` | `Buffer`\<`ArrayBufferLike`\> | (`string` \| `Buffer`\<`ArrayBufferLike`\>)[]

##### callback?

[`IErrorCallback`](../type-aliases/IErrorCallback.md)

#### Returns

`boolean`

true if the data is flushed to kernel buffer completely, otherwise false.

#### Throws

`E_CONN_LOST` will be thrown if the connection is closed.

#### Throws

`E_CONN_READONLY` will be thrown if the connection is not writable (half-closed).

***

### pong()

> **pong**(`data?`, `callback?`): `boolean`

Defined in: [src/lib/Decl.ts:495](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L495)

Send a single PONG message to remote-side, with an optional data.

#### Parameters

##### data?

`string` | `Buffer`\<`ArrayBufferLike`\> | (`string` \| `Buffer`\<`ArrayBufferLike`\>)[]

##### callback?

[`IErrorCallback`](../type-aliases/IErrorCallback.md)

#### Returns

`boolean`

true if the data is flushed to kernel buffer completely, otherwise false.

#### Throws

`E_CONN_LOST` will be thrown if the connection is closed.

#### Throws

`E_CONN_READONLY` will be thrown if the connection is not writable (half-closed).

***

### writeBinary()

> **writeBinary**(`data`, `callback?`): `boolean`

Defined in: [src/lib/Decl.ts:475](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L475)

Send a binary message to remote-side, in a single BINARY message.

#### Parameters

##### data

`string` | `Buffer`\<`ArrayBufferLike`\> | (`string` \| `Buffer`\<`ArrayBufferLike`\>)[]

##### callback?

[`IErrorCallback`](../type-aliases/IErrorCallback.md)

#### Returns

`boolean`

true if the data is flushed to kernel buffer completely, otherwise false.

#### Throws

`E_CONN_LOST` will be thrown if the connection is closed.

#### Throws

`E_CONN_READONLY` will be thrown if the connection is not writable (half-closed).

***

### writeText()

> **writeText**(`data`, `callback?`): `boolean`

Defined in: [src/lib/Decl.ts:465](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L465)

Send a text message to remote-side, in a single TEXT message.

#### Parameters

##### data

`string` | `Buffer`\<`ArrayBufferLike`\> | (`string` \| `Buffer`\<`ArrayBufferLike`\>)[]

##### callback?

[`IErrorCallback`](../type-aliases/IErrorCallback.md)

#### Returns

`boolean`

true if the data is flushed to kernel buffer completely, otherwise false.

#### Throws

`E_CONN_LOST` will be thrown if the connection is closed.

#### Throws

`E_CONN_READONLY` will be thrown if the connection is not writable (half-closed).
