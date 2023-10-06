#!/bin/bash
terser ${BASH_SOURCE%/*}/jquery.reactive.js -c -m -o ${BASH_SOURCE%/*}/jquery.reactive.min.js
