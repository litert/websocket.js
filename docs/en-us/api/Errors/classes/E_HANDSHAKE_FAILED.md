[Documents for @litert/websocket](../../index.md) / [Errors](../index.md) / E\_HANDSHAKE\_FAILED

# Class: E\_HANDSHAKE\_FAILED

Defined in: [src/lib/Errors.ts:132](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L132)

The error class for websocket.

## Extends

- [`WsError`](WsError.md)

## Constructors

### Constructor

> **new E\_HANDSHAKE\_FAILED**(`message`, `context`, `origin`): `E_HANDSHAKE_FAILED`

Defined in: [src/lib/Errors.ts:134](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L134)

#### Parameters

##### message

`string`

##### context

`IErrorContext` = `{}`

##### origin

`unknown` = `null`

#### Returns

`E_HANDSHAKE_FAILED`

#### Overrides

[`WsError`](WsError.md).[`constructor`](WsError.md#constructor)

## Properties

### context

> `readonly` **context**: `IErrorContext`

Defined in: [src/lib/Errors.ts:31](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L31)

The context information for the error.

#### Inherited from

[`WsError`](WsError.md).[`context`](WsError.md#context)

***

### origin

> `readonly` **origin**: `unknown`

Defined in: [src/lib/Errors.ts:36](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L36)

The origin object for the error.

#### Inherited from

[`WsError`](WsError.md).[`origin`](WsError.md#origin)
