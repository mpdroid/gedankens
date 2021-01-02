echo "Started packaging Gedankens ..."
echo "-----------------------------------------------"



declare -a folders=(".")

for folder in "${folders[@]}"; do
  rm docs/${folder}/*.js
  rm docs/${folder}/*.html
  rm docs/${folder}/*.css
  for filename in ${folder}/*.js; do
    nm=`basename $filename .js`
    cp ${folder}/${nm}.js docs/${folder}/${nm}.js
  done

  #mkdir dist/node_modules

  for filename in ${folder}/*.css; do
    nm=`basename $filename .css`
    cp ${folder}/${nm}.css docs/${folder}/${nm}.css
  done

  for filename in ${folder}/*.html; do
    nm=`basename $filename .html`
    cp ${folder}/${nm}.html docs/${folder}/${nm}.html
  done

done

rsync -av node_modules/three/ docs/node_modules/three/

rsync -av assets/ docs/assets/

echo "-----------------------------------------------"
echo "Finished building Gedankens"
#git subtree push --prefix docs origin gh-pages