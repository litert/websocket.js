# Changes

## v0.2.6

- fix(client): the UNIX domain socket path should work as expected.

    The UDS path was mistakenly ignored when `forceNewConnection` is set to
    `true` on HTTPS connections.

- fix(client): should not crash if timeout during connecting to server.

    A missed error event on the socket will cause an uncaught exception.

## v0.2.5

- feat(connection): added supports for early data.

    The early data is appended to the handshake request or response
    when the connection is created. Both the client and server can meet
    the early data during the handshake phase.

    For the server, there is no change to the existing API. And for the client,
    a pair of new APIs are introduced:

    - `createClient()`: create a client instance without connecting to the server.
    - `createSecureClient()`: create a secure client instance without connecting to the server.

    After creating the client instance, you can use `connect()` method to
    connect to the server later. And before calling `connect()`, you must setup
    the `message` event handler to receive the early data from the server.

    The existing `wsConnect()` and `wssConnect()` methods are kept for backward
    compatibility, but they are now implemented using the new APIs internally.
    BTW, they are marked as deprecated, and will be removed in future releases.

## v0.2.4

- feat(connection): added option `forceNewConnection` for connection creation.
- feat(connection): allow sending `Buffer` in `writeText` method.

## v0.2.3

- fix(connection): added default write-callback in case of missing uncaught exception.

## v0.2.2

- feat(connection): added `drain` event supports.
- feat(connection): added `maxMessageSize` readonly property on connections.
- feat(connection): now `createMessageWriter` method returns a `Writable` stream.
- feat(connection): all `write` method supports `callback` parameter for draining.
- feat(connection): refactored the writing logic.
- fix(connection): close the connection correctly on received CLOSE opcode.
- fix(encoding): simplified the code of encoder.
- fix(encoding): failed to decode an empty FIN frame under SIMPLE mode.
- fix(encoding): failed to decode an empty FIN frame under STANDARD mode.
- fix(encoding): a message will be consume multiple times under STANDARD mode.

## v0.2.1

- fix(client): connection close during handshaking should not throw an error.

## v0.2.0

- build(project): use term `message` instead of `frame`.
- feat(connection): added `MessageWriter` for writing fragmented messages.
- feat(encoding): added simple mode for decoding with CONTINUATION frames.
- fix(client): add websocket handshake headers to the request automatically.
- fix(encoding): finish decoding empty frame immediately when full header is received.
- fix(connection): renamed `frame` event to `message`.

## v0.1.2

- fix(connection): should send TEXT frame with writeText method.

## v0.1.1

- fix(connection): did not reset timeout if it is zero.
