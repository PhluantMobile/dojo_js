
# Server-Side Script For Automatic Creation Of Versioned Dojo.js Files

if [ "$(git rev-parse --abbrev-ref HEAD)" !=  master ] ; then exit ; fi

lastVer=$(git tag -l | grep '[0-9]\{1,\}\.[0-9]\{1,\}\.[0-9]\{1,\}' | sort -n -t . | tail -1)

# stop here if file alread exists
if [ -e "dojo-$lastVer.js" ] ; then exit ; fi

cp dojo.js dojo-$lastVer.js
cp dojo.js dojo-$lastVer.min.js