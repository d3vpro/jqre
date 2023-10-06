<?php
$code = file_get_contents('./modules/jqre.reactive.js');
$code = str_replace([
"import { JNode, JMain } from './jqre.js';",
"find(data.el, true);",
"el = new JNode().add(data.el, true);",
"for (const [i, el] of els.entries()) {",
"JMain.r = {",
], [
"jQuery.extend({
    r: (function () {",
"find(data.el).first();",
"el = jQuery(data.el).first();",
"for (const [i, el] of els.toArray().entries()) {",
"const JMain = {};
JMain.r = {",
], $code);
$code .= "
        return JMain.r;
    })(),
});
";
file_put_contents('./jquery.reactive.js', $code);
