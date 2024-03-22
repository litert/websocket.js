# Changes

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
