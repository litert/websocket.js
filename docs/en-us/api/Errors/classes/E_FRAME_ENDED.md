[Documents for @litert/websocket](../../index.md) / [Errors](../index.md) / E\_FRAME\_ENDED

# Class: E\_FRAME\_ENDED

Defined in: [src/lib/Errors.ts:84](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L84)

The error class for websocket.

## Extends

- [`WsError`](WsError.md)

## Constructors

### Constructor

> **new E\_FRAME\_ENDED**(`context`, `origin`): `E_FRAME_ENDED`

Defined in: [src/lib/Errors.ts:86](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L86)

#### Parameters

##### context

`IErrorContext` = `{}`

##### origin

`unknown` = `null`

#### Returns

`E_FRAME_ENDED`

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
