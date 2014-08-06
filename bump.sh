#!/bin/bash

# Script For Bumping The Dojo.js Version on The "dev" Branch
# requires nodejs / uglifyjs
#
# To Run This Script:
# 1. make sure this file has execute permissions: "chmod ug+x bump.sh"
# 2. checkout the 'dev' branch
# 2. execute: "./bump.sh $version" (replace $version with a semantic version (eg. "1.0.12"))

if [ -z "$1" ] ; then
	echo "you must pass in a semantic version" & exit
fi

BREscape (){ printf '%s\n' "$1" | sed 's/[[\.*^$/]/\\&/g'; }

newVer=$1
lastVer=$(git tag -l | grep '[0-9]\{1,\}\.[0-9]\{1,\}\.[0-9]\{1,\}' | sort -n -t . | tail -1)
safeVer=$(BREscape $lastVer)
[ "$(git stash)" = "No local changes to save" ] || isStashed=true

sed -i '' -e "s/$safeVer/$newVer/g" dojo.js
uglifyjs -o dojo.min.js dojo.js
git add -u
git commit -q -m "bumped version to $1"
if [ "$isStashed" = true ] ; then git stash pop -q ; fi

echo $lastVer bumped to $newVer