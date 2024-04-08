# Changes

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
