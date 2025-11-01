[Documents for @litert/websocket](../../index.md) / [Constants](../index.md) / ECloseReason

# Enumeration: ECloseReason

Defined in: [src/lib/Constants.ts:20](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L20)

The reason codes for closing WebSocket connections.

## Enumeration Members

### ABNORMAL

> **ABNORMAL**: `1006`

Defined in: [src/lib/Constants.ts:56](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L56)

Abnormal closure, no further detail available.

***

### BYE

> **BYE**: `1000`

Defined in: [src/lib/Constants.ts:25](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L25)

Normally close.

***

### GOING\_AWAY

> **GOING\_AWAY**: `1001`

Defined in: [src/lib/Constants.ts:30](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L30)

The endpoint is going away.

***

### INTERNAL\_ERROR

> **INTERNAL\_ERROR**: `1011`

Defined in: [src/lib/Constants.ts:81](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L81)

Internal server error.

***

### INVALID\_PAYLOAD

> **INVALID\_PAYLOAD**: `1007`

Defined in: [src/lib/Constants.ts:61](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L61)

Invalid frame payload data.

***

### MESSAGE\_TOO\_BIG

> **MESSAGE\_TOO\_BIG**: `1009`

Defined in: [src/lib/Constants.ts:71](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L71)

Message too big.

***

### MISSING\_EXTENSION

> **MISSING\_EXTENSION**: `1010`

Defined in: [src/lib/Constants.ts:76](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L76)

Missing required protocol extension.

***

### NO\_STATUS

> **NO\_STATUS**: `1005`

Defined in: [src/lib/Constants.ts:51](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L51)

No status code was present.

***

### POLICY\_VIOLATION

> **POLICY\_VIOLATION**: `1008`

Defined in: [src/lib/Constants.ts:66](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L66)

Policy violation.

***

### PROTOCOL\_ERROR

> **PROTOCOL\_ERROR**: `1002`

Defined in: [src/lib/Constants.ts:35](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L35)

Protocol error.

***

### ~~RESERVED~~

> **RESERVED**: `1004`

Defined in: [src/lib/Constants.ts:46](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L46)

Reserved, do not use.

#### Deprecated

***

### UNSUPPORTED\_DATA

> **UNSUPPORTED\_DATA**: `1003`

Defined in: [src/lib/Constants.ts:40](https://github.com/litert/websocket.js/blob/master/src/lib/Constants.ts#L40)

Unsupported data.
