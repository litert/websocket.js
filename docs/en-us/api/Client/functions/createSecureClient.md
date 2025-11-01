[Documents for @litert/websocket](../../index.md) / [Client](../index.md) / createSecureClient

# Function: createSecureClient()

> **createSecureClient**(`opts`): [`IClient`](../../Decl/interfaces/IClient.md)

Defined in: [src/lib/Client.ts:306](https://github.com/litert/websocket.js/blob/master/src/lib/Client.ts#L306)

Create a WebSocket client via HTTPS.

> The client will not connect to the server automatically. You need to call
> the `connect` method to establish the connection.
> Before calling `connect`, you must setup the event listeners to handle
> the events emitted during the connection.

## Parameters

### opts

[`IWssConnectOptions`](../interfaces/IWssConnectOptions.md)

The options for the connection.

## Returns

[`IClient`](../../Decl/interfaces/IClient.md)

The secure WebSocket client.
