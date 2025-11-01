#!/usr/bin/env bash
SCRIPT_ROOT=$(cd $(dirname $0); pwd)

cd $SCRIPT_ROOT/..

API_DOC_OUTPUT_DIR=docs/en-us/api
SRC_DIR=src/lib

rm -rf $API_DOC_OUTPUT_DIR

npx typedoc \
    --out api \
    --readme none \
    --name "Documents for @litert/websocket" \
    --hostedBaseUrl "https://litert.org/projects/websocket.js" \
    --plugin typedoc-plugin-markdown \
    --plugin typedoc-vitepress-theme \
    --plugin typedoc-plugin-no-inherit \
    --sourceLinkTemplate "https://github.com/litert/websocket.js/blob/master/{path}#L{line}" \
    $SRC_DIR/Decl.ts \
    $SRC_DIR/Errors.ts \
    $SRC_DIR/Constants.ts \
    $SRC_DIR/MessageReadStream.ts \
    $SRC_DIR/SimpleMessage.ts \
    $SRC_DIR/Client.ts \
    $SRC_DIR/Server.ts

mkdir -p $(dirname $API_DOC_OUTPUT_DIR)
mv api $API_DOC_OUTPUT_DIR
