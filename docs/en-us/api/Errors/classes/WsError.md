[Documents for @litert/websocket](../../index.md) / [Errors](../index.md) / WsError

# Abstract Class: WsError

Defined in: [src/lib/Errors.ts:26](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L26)

The error class for websocket.

## Extends

- `Error`

## Extended by

- [`E_CONN_LOST`](E_CONN_LOST.md)
- [`E_CONN_READONLY`](E_CONN_READONLY.md)
- [`E_CONN_BUSY`](E_CONN_BUSY.md)
- [`E_INTERNAL_ERROR`](E_INTERNAL_ERROR.md)
- [`E_FRAME_ENDED`](E_FRAME_ENDED.md)
- [`E_FRAME_BROKEN`](E_FRAME_BROKEN.md)
- [`E_MESSAGE_TOO_LARGE`](E_MESSAGE_TOO_LARGE.md)
- [`E_INVALID_PROTOCOL`](E_INVALID_PROTOCOL.md)
- [`E_TIMEOUT`](E_TIMEOUT.md)
- [`E_INVALID_CONFIG`](E_INVALID_CONFIG.md)
- [`E_HANDSHAKE_FAILED`](E_HANDSHAKE_FAILED.md)

## Constructors

### Constructor

> **new WsError**(`name`, `message`, `context`, `origin`): `WsError`

Defined in: [src/lib/Errors.ts:38](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L38)

#### Parameters

##### name

`string`

##### message

`string`

##### context

`IErrorContext`

##### origin

`unknown`

#### Returns

`WsError`

#### Overrides

`Error.constructor`

## Properties

### context

> `readonly` **context**: `IErrorContext`

Defined in: [src/lib/Errors.ts:31](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L31)

The context information for the error.

***

### origin

> `readonly` **origin**: `unknown`

Defined in: [src/lib/Errors.ts:36](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L36)

The origin object for the error.
