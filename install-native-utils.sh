#!/usr/bin/env bash
SCRIPT_ROOT=$(cd $(dirname $0); pwd)

THE_TMP_PATH=$SCRIPT_ROOT/../tmp-$(date +%s)
LITERT_NPM_DIR=$SCRIPT_ROOT/node_modules/@litert/

mkdir -p $THE_TMP_PATH && \
    cp .npmrc $THE_TMP_PATH/ && \
    mkdir $LITERT_NPM_DIR -p && \
    cd $THE_TMP_PATH && \
    npm i @litert/ws-utils && \
    rm -rf $THE_TMP_PATH/node_modules/@litert/ws-utils/node_modules && \
    mv $THE_TMP_PATH/node_modules/@litert/ws-utils $LITERT_NPM_DIR/ws-utils

rm -rf $THE_TMP_PATH
