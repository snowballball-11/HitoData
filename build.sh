rm -rf dist
cnpm run build:prod
rm -rf erd.tar.gz
rm -rf ci/erd.tar.gz
cd dist
tar -cvzf erd.tar.gz *
cp erd.tar.gz ..
cp erd.tar.gz ../ci/
