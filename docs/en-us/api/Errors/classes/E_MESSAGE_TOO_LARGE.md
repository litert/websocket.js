[Documents for @litert/websocket](../../index.md) / [Errors](../index.md) / E\_MESSAGE\_TOO\_LARGE

# Class: E\_MESSAGE\_TOO\_LARGE

Defined in: [src/lib/Errors.ts:100](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L100)

The error class for websocket.

## Extends

- [`WsError`](WsError.md)

## Constructors

### Constructor

> **new E\_MESSAGE\_TOO\_LARGE**(`context`, `origin`): `E_MESSAGE_TOO_LARGE`

Defined in: [src/lib/Errors.ts:102](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L102)

#### Parameters

##### context

`IErrorContext` = `{}`

##### origin

`unknown` = `null`

#### Returns

`E_MESSAGE_TOO_LARGE`

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
