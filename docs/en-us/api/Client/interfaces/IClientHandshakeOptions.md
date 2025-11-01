[Documents for @litert/websocket](../../index.md) / [Client](../index.md) / IClientHandshakeOptions

# Interface: IClientHandshakeOptions

Defined in: [src/lib/Client.ts:149](https://github.com/litert/websocket.js/blob/master/src/lib/Client.ts#L149)

The handshake options for WebSocket client.

## Properties

### subProtocols?

> `optional` **subProtocols**: `string`[]

Defined in: [src/lib/Client.ts:158](https://github.com/litert/websocket.js/blob/master/src/lib/Client.ts#L158)

The sub-protocols to be requested.

If not specified, no sub-protocol will be requested.
When the server can not recognize any of the requested sub-protocols,
it might reject the handshake.
