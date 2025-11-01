[Documents for @litert/websocket](../../index.md) / [Decl](../index.md) / IRejectOptions

# Interface: IRejectOptions

Defined in: [src/lib/Decl.ts:190](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L190)

The options for `IServer.reject()` method.

## Properties

### body?

> `optional` **body**: `string` \| `Buffer`\<`ArrayBufferLike`\>

Defined in: [src/lib/Decl.ts:221](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L221)

The entity body of the response to reject the websocket request.

***

### headers?

> `optional` **headers**: `OutgoingHttpHeaders`

Defined in: [src/lib/Decl.ts:216](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L216)

The extra HTTP header of the response to reject the websocket request.

***

### request

> **request**: `IncomingMessage`

Defined in: [src/lib/Decl.ts:195](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L195)

The HTTP request object for the websocket handshake request.

***

### socket

> **socket**: `Socket`

Defined in: [src/lib/Decl.ts:204](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L204)

The TCP socket for the websocket connection.

For the `socket` parameter from `upgrade` event of `http.Server` object,
you may need to force-cast it to `Net.Socket` type (although it is actually
a `Net.Socket` object indeed), because its type is not equitable in TypeScript.

***

### statusCode?

> `optional` **statusCode**: `number`

Defined in: [src/lib/Decl.ts:211](https://github.com/litert/websocket.js/blob/master/src/lib/Decl.ts#L211)

The HTTP status code of the response to reject the websocket request.

#### Default

```ts
400
```
