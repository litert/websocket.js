[Documents for @litert/websocket](../../index.md) / [Decl](../index.md) / IAcceptOptions

# Interface: IAcceptOptions

Defined in: [src/lib/Decl.ts:146](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L146)

The options for `IServer.accept()` method.

## Properties

### clientEarlyDataPayload?

> `optional` **clientEarlyDataPayload**: `Buffer`\<`ArrayBufferLike`\> \| `null`

Defined in: [src/lib/Decl.ts:184](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L184)

The third parameter of the `upgrade` event of `http.Server` object.

It's the payload data sent immediately after the websocket handshake
request, without waiting for the reply of the handshake response,
which could make it feels like 0-RTT.

***

### headers?

> `optional` **headers**: `OutgoingHttpHeaders`

Defined in: [src/lib/Decl.ts:165](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L165)

The extra HTTP header of the response to accept the websocket request.

***

### request

> **request**: `IncomingMessage`

Defined in: [src/lib/Decl.ts:151](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L151)

The HTTP request object for the websocket handshake request.

***

### socket

> **socket**: `Socket`

Defined in: [src/lib/Decl.ts:160](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L160)

The TCP socket for the websocket connection.

For the `socket` parameter from `upgrade` event of `http.Server` object,
you may need to force-cast it to `Net.Socket` type (although it is actually
a `Net.Socket` object indeed), because its type is not equitable in TypeScript.

***

### subProtocol?

> `optional` **subProtocol**: `string`

Defined in: [src/lib/Decl.ts:175](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L175)

The whitelist of sub-protocols, matched by the order in the list.

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/lib/Decl.ts:170](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L170)

The timeout for the new websocket connection.
