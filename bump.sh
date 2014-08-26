#!/bin/bash

# Script For Bumping The Dojo.js Version on The "dev" Branch
# requires nodejs / uglifyjs
#
# Version Bumping Instructions:
# 1. make changes on the 'dev' branch (or a feature branch) & test locally
# 2. once ready to increment the version then:
#  a. make sure this file has execute permissions: "chmod ug+x bump.sh"
#  b. make sure you're still on the 'dev' branch
#  c. execute: "./bump.sh $version" (replace $version with a semantic version (eg. "1.0.12"))
#  d. push your changes & test them out with the url "test1.phluant.com/jslib/dojo/dojo.js"
# 3. once ready to go live with the changes:
#  a. checkout branch 'master'
#  b. execute "git merge dev --no-ff"
#  c. execute "git tag {version}" (replace "{version}" with the version you're merging in) 
#  d. execute "git push origin master && git push origin master --tags"

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