[Documents for @litert/websocket](../../index.md) / [Constants](../index.md) / EOpcode

# Enumeration: EOpcode

Defined in: [src/lib/Constants.ts:87](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L87)

The opcodes for WebSocket frames, aka frame types.

## Enumeration Members

### BINARY

> **BINARY**: `2`

Defined in: [src/lib/Constants.ts:103](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L103)

Binary frame. The payload data is binary data.

***

### CLOSE

> **CLOSE**: `8`

Defined in: [src/lib/Constants.ts:108](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L108)

Close frame. Indicates that the sender is closing the connection.

***

### CONTINUATION

> **CONTINUATION**: `0`

Defined in: [src/lib/Constants.ts:93](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L93)

Continuation frame, which is used to continue a fragmented message,
keeping the same type as the first frame of the message.

***

### PING

> **PING**: `9`

Defined in: [src/lib/Constants.ts:113](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L113)

Ping frame. Used to check the connection status.

***

### PONG

> **PONG**: `10`

Defined in: [src/lib/Constants.ts:118](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L118)

Pong frame. Used to respond to a ping frame.

***

### TEXT

> **TEXT**: `1`

Defined in: [src/lib/Constants.ts:98](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L98)

Text frame. The payload data is UTF-8 encoded text data.
