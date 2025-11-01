[Documents for @litert/websocket](../../index.md) / [Errors](../index.md) / E\_INVALID\_CONFIG

# Class: E\_INVALID\_CONFIG

Defined in: [src/lib/Errors.ts:124](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L124)

The error class for websocket.

## Extends

- [`WsError`](WsError.md)

## Constructors

### Constructor

> **new E\_INVALID\_CONFIG**(`context`, `origin`): `E_INVALID_CONFIG`

Defined in: [src/lib/Errors.ts:126](https://github.com/litert/websocket.js/blob/master/src/lib/Errors.ts#L126)

#### Parameters

##### context

`IErrorContext` = `{}`

##### origin

`unknown` = `null`

#### Returns

`E_INVALID_CONFIG`

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
