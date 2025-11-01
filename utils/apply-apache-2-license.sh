#!/usr/bin/env bash
SCRIPT_ROOT=$(cd $(dirname $0); pwd)
cd $SCRIPT_ROOT/..

for i in $(find src -type f -name "*.ts")
do
    if grep -q "Licensed under the Apache License, Version 2.0" $i; then
        echo "License already applied to $i"
        continue;
    fi

    echo "Applying Apache 2.0 license to $i"

    cat >> tmp.txt <<EOL
/**
 * Copyright 2025 Angus.Fenying <fenying@litert.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
EOL

    echo "" >> tmp.txt

    cat $i >> tmp.txt

    mv tmp.txt $i

done
