# Path: scripts\srun.sh
echo "The script you are running has:"
echo "basename: [$(basename "$0")]"
echo "dirname : [$(dirname "$0")]"
echo "pwd     : [$(pwd)]"

echo "Setting NG Analytics OFF :"
ng analytics off

echo "Building IONIC Project :"
ionic build --prod

rm www/manifest.webmanifest

echo "Publishing updates to public folder :"
# create  varible for public directory path
public_dir=$(pwd)/$(dirname "$0")/../public

# #create  folder public if not exists
if [ ! -d "$public_dir" ]; then
    mkdir "$public_dir"
fi


# #copy files from dist to public
cp -r ./www/* "$public_dir"

# copy web folder to public
cp -r ./web "$public_dir"

# # copy .htaccess to public
cp ./scripts/.htaccess "$public_dir"

 if [ -f public/index.html ]; then
 mv public/index.php public/index_old.php
 mv public/index.html public/index.php  
 sed -i 's/<!--?php/<?php/g' public/index.php
 sed -i 's/;?-->/;?>/g' public/index.php

# replace string index.html with index.php in public/ngsw.json
sed -i 's/index.html/index.php/g' public/ngsw.json

 else
     echo "index.html does not exist" 
 fi

