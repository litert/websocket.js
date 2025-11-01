[Documents for @litert/websocket](../../index.md) / [Client](../index.md) / IWsConnectOptionsBase

# Interface: IWsConnectOptionsBase

Defined in: [src/lib/Client.ts:189](https://github.com/litert/websocket.js/blob/master/src/lib/Client.ts#L189)

The connection options for WebSocket client.

## Extended by

- [`IWssConnectOptions`](IWssConnectOptions.md)
- [`IWsConnectOptions`](IWsConnectOptions.md)

## Properties

### connectTimeout?

> `optional` **connectTimeout**: `number`

Defined in: [src/lib/Client.ts:196](https://github.com/litert/websocket.js/blob/master/src/lib/Client.ts#L196)

The timeout for connecting to the server.

#### See

cL.DEFAULT_CONNECT_TIMEOUT

***

### forceNewConnection?

> `optional` **forceNewConnection**: `boolean`

Defined in: [src/lib/Client.ts:229](https://github.com/litert/websocket.js/blob/master/src/lib/Client.ts#L229)

Whether to force a new connection.

> In some case, the underlying HTTP/HTTPS agent may reuse an existing
> connection in the connection pool. This may cause some issues like
> CONN_RESET during the handshake. If you meet such issues, set this
> option to `true` to force a new connection.

#### Default

```ts
true
```

***

### frameReceiveMode?

> `optional` **frameReceiveMode**: [`EFrameReceiveMode`](../../Constants/enumerations/EFrameReceiveMode.md)

Defined in: [src/lib/Client.ts:203](https://github.com/litert/websocket.js/blob/master/src/lib/Client.ts#L203)

The mode of receiving frames.

#### See

cL.EFrameReceiveMode.STANDARD

***

### maxMessageSize?

> `optional` **maxMessageSize**: `number`

Defined in: [src/lib/Client.ts:210](https://github.com/litert/websocket.js/blob/master/src/lib/Client.ts#L210)

The maximum size of each message.

#### See

cL.DEFAULT_MAX_MESSAGE_SIZE

***

### wsHandshakeOpts?

> `optional` **wsHandshakeOpts**: [`IClientHandshakeOptions`](IClientHandshakeOptions.md)

Defined in: [src/lib/Client.ts:217](https://github.com/litert/websocket.js/blob/master/src/lib/Client.ts#L217)

The options for the handshake.

#### Default

```ts
{}
```
