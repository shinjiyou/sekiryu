<?php
if (@$_GET['m'] == 'pc') {
    setcookie('pc_sp', 'pc');
} else {
    setcookie('pc_sp', '', time() - 3600);
}

$url = @$_SERVER['HTTP_REFERER'];
if (empty($url)) {
    $url = '/';
}
$url = str_replace(array("\r","\n"), "", $url);
header("Location: $url");
exit;
