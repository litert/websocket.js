[Documents for @litert/websocket](../../index.md) / [Constants](../index.md) / EFrameReceiveMode

# Enumeration: EFrameReceiveMode

Defined in: [src/lib/Constants.ts:124](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L124)

The receiving mode of WebSocket messages provided by this library.

## Enumeration Members

### LITE

> **LITE**: `1`

Defined in: [src/lib/Constants.ts:138](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L138)

At this mode, all messages will be received as a `ISimpleMessage` object, without
`CONTINUATION` frames supported and they will be refused.

> **WARNING: Watch out the compatibility to the remote side.**

***

### SIMPLE

> **SIMPLE**: `2`

Defined in: [src/lib/Constants.ts:144](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L144)

At this mode, all messages will be received as a `ISimpleMessage` object, with `CONTINUATION`
frames supported.

***

### STANDARD

> **STANDARD**: `0`

Defined in: [src/lib/Constants.ts:130](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L130)

At this mode, when starts receiving a new message, a `IMessageReadStream` object will be
created, and the `message` events of `IWebSocket` objects will be triggered with it.
