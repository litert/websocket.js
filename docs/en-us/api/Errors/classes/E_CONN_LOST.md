[Documents for @litert/websocket](../../index.md) / [Errors](../index.md) / E\_CONN\_LOST

# Class: E\_CONN\_LOST

Defined in: [src/lib/Errors.ts:52](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L52)

The error class for websocket.

## Extends

- [`WsError`](WsError.md)

## Constructors

### Constructor

> **new E\_CONN\_LOST**(`context`, `origin`): `E_CONN_LOST`

Defined in: [src/lib/Errors.ts:54](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L54)

#### Parameters

##### context

`IErrorContext` = `{}`

##### origin

`unknown` = `null`

#### Returns

`E_CONN_LOST`

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
