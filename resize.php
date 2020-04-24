<?php

$url                 = parse_url( $_SERVER['REQUEST_URI'] );
$file_path           = dirname(__FILE__) . '/art/img/'.basename(urldecode($url['path']));
$thumbnail_file_path = dirname(__FILE__) . '/art/img/t/'.basename($url['path']);

if(!file_exists($file_path)){
    header( "HTTP/1.1 404 Not Found" ) ;
    exit;
}

$type=exif_imagetype($file_path);
if($type != 2) { //IMAGETYPE_JPEG
    header( "HTTP/1.1 404 Not Found" ) ;
    exit;
}

$new_width = 600;
$image = ImageCreateFromJPEG($file_path);
$width = ImageSX($image);

if( $width > $new_width ){
    $height = ImageSY($image);
    $rate = min($new_width / $width, $new_width / $height);
    $new_height = $rate * $height;
    $new_width = $rate * $width;
    $new_image = ImageCreateTrueColor($new_width, $new_height);
    imagecopyresampled($new_image,$image,0,0,0,0,$new_width,$new_height,$width,$height);
    header('Content-type: image/jpeg');

    // 画質設定
    ImageJPEG($new_image, $thumbnail_file_path, 90);
    ImageJPEG($new_image, null, 90);

    imagedestroy ($new_image);
    imagedestroy ($image);
}
else {
    copy($file_path, $thumbnail_file_path);
    header('Content-type: image/jpeg');
    readfile($thumbnail_file_path);
}
