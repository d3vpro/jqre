#!/bin/bash
if ! [ -z "$1" ] && [ $1 = "SIMPLE" ]; then
    google-closure-compiler \
        --language_in UNSTABLE \
        --language_out ECMASCRIPT_NEXT \
        --js ${BASH_SOURCE%/*}/jqre.full.js \
        --js_output_file ${BASH_SOURCE%/*}/jqre.full.min.js \
        -O SIMPLE
elif ! [ -z "$1" ] && [ $1 = "ADVANCED" ] && ! [ -z "$2" ]; then
    ext=""
    for var in "$@"
    do
        if ! [ $var = "ADVANCED" ]; then
            ext="${ext}--externs ${BASH_SOURCE%/*}/externs/jqre.${var}.js "
        fi
    done
    google-closure-compiler \
        --language_in UNSTABLE \
        --language_out ECMASCRIPT_NEXT \
        --js ${BASH_SOURCE%/*}/jqre.full.js \
        --js_output_file ${BASH_SOURCE%/*}/jqre.full.min.js \
        --externs ${BASH_SOURCE%/*}/externs/jqre.js ${ext} \
        --jscomp_off checkTypes \
        -O ADVANCED
    echo -e "\n\nMake sure you have checked modules dependencies. The script does not check.\n"
else
    google-closure-compiler \
        --language_in UNSTABLE \
        --language_out ECMASCRIPT_NEXT \
        --js ${BASH_SOURCE%/*}/jqre.full.js \
        --js_output_file ${BASH_SOURCE%/*}/jqre.full.min.js \
        --externs ${BASH_SOURCE%/*}/externs/jqre.full.js \
        --jscomp_off checkTypes \
        -O ADVANCED
fi
