#!/usr/bin/env bash
SCRIPT_ROOT=$(cd $(dirname $0); pwd)

LITERT_NPM_DIR=$SCRIPT_ROOT/node_modules/@litert/

rm -rf $LITERT_NPM_DIR/ws-utils
