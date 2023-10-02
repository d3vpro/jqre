#!/bin/bash
terser ${BASH_SOURCE%/*}/modules/jqre.js -c -m -o ${BASH_SOURCE%/*}/modules.min/jqre.js
terser ${BASH_SOURCE%/*}/modules/jqre.dom.js -c -m -o ${BASH_SOURCE%/*}/modules.min/jqre.dom.js
terser ${BASH_SOURCE%/*}/modules/jqre.node.js -c -m -o ${BASH_SOURCE%/*}/modules.min/jqre.node.js
terser ${BASH_SOURCE%/*}/modules/jqre.navigation.js -c -m -o ${BASH_SOURCE%/*}/modules.min/jqre.navigation.js
terser ${BASH_SOURCE%/*}/modules/jqre.event.js -c -m -o ${BASH_SOURCE%/*}/modules.min/jqre.event.js
terser ${BASH_SOURCE%/*}/modules/jqre.shortevent.js -c -m -o ${BASH_SOURCE%/*}/modules.min/jqre.shortevent.js
terser ${BASH_SOURCE%/*}/modules/jqre.ajax.js -c -m -o ${BASH_SOURCE%/*}/modules.min/jqre.ajax.js
terser ${BASH_SOURCE%/*}/modules/jqre.misc.js -c -m -o ${BASH_SOURCE%/*}/modules.min/jqre.misc.js
terser ${BASH_SOURCE%/*}/modules/jqre.reactive.js -c -m -o ${BASH_SOURCE%/*}/modules.min/jqre.reactive.js
terser ${BASH_SOURCE%/*}/modules/jqre.autocomplete.js -c -m -o ${BASH_SOURCE%/*}/modules.min/jqre.autocomplete.js
terser ${BASH_SOURCE%/*}/modules/jqre.dialog.js -c -m -o ${BASH_SOURCE%/*}/modules.min/jqre.dialog.js
