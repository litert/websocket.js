[Documents for @litert/websocket](../../index.md) / [Decl](../index.md) / IServer

# Interface: IServer

Defined in: [src/lib/Decl.ts:57](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L57)

The interface of websocket server.

## Properties

### frameReceiveMode

> `readonly` **frameReceiveMode**: [`EFrameReceiveMode`](../../Constants/enumerations/EFrameReceiveMode.md)

Defined in: [src/lib/Decl.ts:84](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L84)

The mode of receiving frames.

#### Default

```ts
EFrameReceiveMode.STANDARD
```

***

### maxMessageSize

> **maxMessageSize**: `number`

Defined in: [src/lib/Decl.ts:77](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L77)

The maximum size of each message body.

> Changing this value will not affect the existing connections.

#### Default

```ts
67108864 (64 MiB)
```

#### See

DEFAULT_MAX_MESSAGE_SIZE

***

### timeout

> **timeout**: `number`

Defined in: [src/lib/Decl.ts:67](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L67)

The timeout in milliseconds for the new connections.

> Set to `0` to disable the timeout.

#### Default

```ts
60000
```

## Methods

### accept()

> **accept**(`opts`): [`IWebSocket`](IWebSocket.md)

Defined in: [src/lib/Decl.ts:89](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L89)

Accept the websocket request.

#### Parameters

##### opts

[`IAcceptOptions`](IAcceptOptions.md)

#### Returns

[`IWebSocket`](IWebSocket.md)

***

### isWebSocketRequest()

> **isWebSocketRequest**(`req`): `boolean`

Defined in: [src/lib/Decl.ts:99](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L99)

Tell if the request is a websocket request.

#### Parameters

##### req

`IncomingMessage`

#### Returns

`boolean`

***

### reject()

> **reject**(`opts`): `void`

Defined in: [src/lib/Decl.ts:94](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L94)

Reject the websocket request.

#### Parameters

##### opts

[`IRejectOptions`](IRejectOptions.md)

#### Returns

`void`
