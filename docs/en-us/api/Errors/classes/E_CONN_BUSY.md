[Documents for @litert/websocket](../../index.md) / [Errors](../index.md) / E\_CONN\_BUSY

# Class: E\_CONN\_BUSY

Defined in: [src/lib/Errors.ts:68](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L68)

The error class for websocket.

## Extends

- [`WsError`](WsError.md)

## Constructors

### Constructor

> **new E\_CONN\_BUSY**(`context`, `origin`): `E_CONN_BUSY`

Defined in: [src/lib/Errors.ts:70](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L70)

#### Parameters

##### context

`IErrorContext` = `{}`

##### origin

`unknown` = `null`

#### Returns

`E_CONN_BUSY`

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
