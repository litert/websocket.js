[Documents for @litert/websocket](../../index.md) / [Client](../index.md) / wssConnect

# ~~Function: wssConnect()~~

> **wssConnect**(`opts`): `Promise`\<[`IClient`](../../Decl/interfaces/IClient.md)\>

Defined in: [src/lib/Client.ts:265](https://github.com/litert/websocket.js/blob/master/src/lib/Client.ts#L265)

Establish a WebSocket connection to a server via HTTPS.

## Parameters

### opts

[`IWssConnectOptions`](../interfaces/IWssConnectOptions.md)

The options for the connection.

## Returns

`Promise`\<[`IClient`](../../Decl/interfaces/IClient.md)\>

The promise of the WebSocket client.

## Deprecated

Use `createSecureClient` method instead, because the client can
not process early data sent by server correctly if you use this method. And
this method will be removed in the future.
