echo "Deploying Gedankens ..."
echo "-----------------------------------------------"

./build.sh
git add .
git commit -m"optimizing mobile load"
git push
git subtree push --prefix docs origin gh-pages
echo "-----------------------------------------------"
echo "Finished deploying Gedankens"
