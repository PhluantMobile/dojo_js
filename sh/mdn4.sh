
# Server-Side Script For Automatic Creation Of Versioned Dojo.js Files

if [ "$(git rev-parse --abbrev-ref HEAD)" !=  master ] ; then exit ; fi

lastVer=$(git tag -l | grep '[0-9]\{1,\}\.[0-9]\{1,\}\.[0-9]\{1,\}' | sort -t. -k 1,1n -k 2,2n -k 3,3n | tail -1)
lastMajVer=$(git tag -l | sort -r -n -t . | grep -m1 -o '[0-9]\{1,\}\.[0-9]\{1,\}')

# stop here if file alread exists
if [ -e "dojo-$lastVer.js" ] ; then exit ; fi

cp dojo.js dojo-$lastVer.js
cp dojo.min.js dojo-$lastVer.min.js

cp dojo.js dojo-$lastMajVer.js
cp dojo.min.js dojo-$lastMajVer.min.js
