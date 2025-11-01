#!/usr/bin/env bash
SCRIPT_ROOT=$(cd $(dirname $0); pwd)

cd $SCRIPT_ROOT/..

if ! utils/generate-api-docs-md.sh; then
    echo "Error: Failed to generate API docs in Markdown format."
    exit 1
fi

rm -rf docs/website/guides
rm -rf docs/website/api

mkdir -p docs/website/guides

cp -r docs/en-us/api docs/website
cp docs/en-us/*.md docs/website/guides

npm i -D vitepress

DEBUG='*' npx vitepress build docs/website

npm un -D vitepress

cd $SCRIPT_ROOT/../docs/website/.vitepress/dist

tar -zcf ../html-docs.tgz ./*
