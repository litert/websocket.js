[Documents for @litert/websocket](../../index.md) / [Errors](../index.md) / E\_FRAME\_BROKEN

# Class: E\_FRAME\_BROKEN

Defined in: [src/lib/Errors.ts:92](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L92)

The error class for websocket.

## Extends

- [`WsError`](WsError.md)

## Constructors

### Constructor

> **new E\_FRAME\_BROKEN**(`context`, `origin`): `E_FRAME_BROKEN`

Defined in: [src/lib/Errors.ts:94](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L94)

#### Parameters

##### context

`IErrorContext` = `{}`

##### origin

`unknown` = `null`

#### Returns

`E_FRAME_BROKEN`

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
