#!/bin/zsh

in_dir='templates/ static/js/ static/css/'
in_file='robots.txt sitemap.xml'
out_file='release-gs-'`date +%Y%m%d`

cmd_args=$out_file' gs-* *.php '$in_file' '$in_dir

echo 'zip -r '$cmd_args
echo $cmd_args | xargs zip -r
#zip -r $out_file gs-* *.php $in_file $in_dir
