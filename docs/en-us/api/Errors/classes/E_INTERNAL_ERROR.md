[Documents for @litert/websocket](../../index.md) / [Errors](../index.md) / E\_INTERNAL\_ERROR

# Class: E\_INTERNAL\_ERROR

Defined in: [src/lib/Errors.ts:76](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L76)

The error class for websocket.

## Extends

- [`WsError`](WsError.md)

## Constructors

### Constructor

> **new E\_INTERNAL\_ERROR**(`context`, `origin`): `E_INTERNAL_ERROR`

Defined in: [src/lib/Errors.ts:78](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L78)

#### Parameters

##### context

`IErrorContext` = `{}`

##### origin

`unknown` = `null`

#### Returns

`E_INTERNAL_ERROR`

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
