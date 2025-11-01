# FAQ

## What is Frame Receive Mode?

In this library, we provide 3 different modes for you to receive the messages from the other
side. Before understanding these modes, you need to know how WebSocket messages are transmitted.

When a message is sent from one side, it might be split into multiple frames,
for example, a `TEXT` message could be composed of a `TEXT` frame followed by multiple `CONTINUATION` frames.

This message splitting will increase the complexity of receiving messages, because the user
must consider how to receive these frames with these questions:

- Memory overflow: If the message is too large, it might cause memory overflow if we try to load
  the whole message into memory.
- Asynchronous receiving: When receiving a large message, it might take a long time to receive all frames,
  and streaming the message is preferred. So the user must handle the asynchronous receiving of frames.

To help you handle these complexities, we provide 3 different Frame Receive Modes:

- **STANDARD**:

    In this mode, when a new message starts to be received, a `IMessageReadStream` object
    will be created to stream the message. The `message` event handler will receive this stream object
    as the first parameter, and you can read each chunk of message data from it as it arrives.

    This mode is the most flexible one, as it allows you to handle large messages without
    worrying about memory overflow (if you process the stream correctly).

    The con is that you must use the stream API to read the message data, which might be
    a bit complex for simple data receiving scenarios.

- **SIMPLE**:

    In this mode, the websocket connection receives every message frame (and its `CONTINUATION` frames, if any)
    and combines them into one single buffer array before delivering it to the `message` event handler.
    This mode is facing the memory overflow issue when receiving large messages, so it's recommended
    to set the `maxMessageSize` option to limit the maximum size of messages.

- **LITE**:

    This mode is almost the same as the `SIMPLE` mode, but it refuses any `CONTINUATION` frames.
    So if the remote side sends a message with `CONTINUATION` frames, the connection will be closed
    with a protocol error. This mode is not recommended unless you are sure that the remote side
    will never send messages with `CONTINUATION` frames. And if so, you can use this mode to
    slightly improve the performance of message receiving.

## What's early data?

In WebSocket, both client and server must perform a handshake process before the
actual data transmission. However, the client actually can send the websocket
messages immediately after sending the handshake request, without waiting for the
handshake response from the server, if the client ensures that the server will
accept the handshake request. In this case, the data sent immediately after the
handshake request is called "early data".

Similarly, the server can also send early data immediately after sending the
handshake response.

With the early data, the client could achieve lower latency for the first
messages sent to the server, just like some kind of 0-RTT.

However, using early data comes with risks. If the server or client does not
support early data, the early data will be discarded, leading to data loss.

Therefore, when using early data, both the client and server must ensure that
the other side supports early data, otherwise it may lead to unexpected results.

## How `IClient.setMasking` method works?

The `IClient.setMasking` method is used to enable or disable the masking of
WebSocket frames sent from the client to the server. By default, the client
would follow the WebSocket protocol specification and mask all frames sent to
the server.

For general usage, it is recommended to keep the masking enabled to ensure
compliance. But in some special scenarios, such as testing or debugging, or private
scenarios where both client and server are under your control, you may want to disable
the masking to simplify the data analysis or for performance reasons.

## How to improve performance of masking/unmasking?

This library use the mask/unmask function written in pure TypeScript/JavaScript by default. However, for better performance, you can use a native addon `@litert/ws-utils` to accelerate the masking/unmasking process.

```bash
npm i @litert/ws-utils
```

## How to use Websocket over unix domain socket?

To establish WebSocket connection, except for the normal TCP connection, you can
also use unix domain socket (UDS) as the transport layer.

You can just simply specify the `socketPath` option in the connection options
when creating a client or server. For example:

```ts
import * as LibWS from '@litert/websocket';

const client = LibWS.createClient({ // or use createSecureClient()
    socketPath: '/path/to/unix.sock', // The path of the unix domain socket
    path: '/ws', // The request path for websocket handshake
});

client.on('message', (msg) => {
    console.log('Received message:', msg);
});

await client.connect();
```
