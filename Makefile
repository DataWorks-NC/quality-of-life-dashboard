deploy:
	rm -r ./public
	npm run build
	aws s3 rm --recursive ${AWS_S3_BUCKET}
	aws s3 cp --recursive ./public/ ${AWS_S3_BUCKET} --exclude "*" --include "*.js" --include "*.json" --include "*.geojson" --include "*.html" --include "*.css" --include "*.png" --include "*.zip" --acl public-read --cache-control "max-age=86400"
	aws cloudfront create-invalidation --distribution-id ${AWS_CLOUDFRONT_ID}  --paths "/*"

