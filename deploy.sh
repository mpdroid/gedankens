echo "Deploying Gedankens ..."
echo "-----------------------------------------------"

commit_message="Builds and deploys Gedankens"
if [ ! -z "${1}" ]; then
 commit_message=${1}
fi

git checkout -B release

./build.sh
git add .
git commit -m${commit_message}
echo "committing \"${commit_message}\""
git push
git subtree push --prefix docs origin gh-pages
echo "-----------------------------------------------"
echo "Finished deploying Gedankens "
