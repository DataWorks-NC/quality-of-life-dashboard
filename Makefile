deploy:
	npm run build
	aws s3 cp --recursive ./public/ ${AWS_S3_BUCKET} --exclude "*" --include "*.js" --include "*.json" --include "*.html" --include "*.css" --include "*.png" --include "*.zip"
	aws cloudfront create-invalidation --distribution-id ${AWS_CLOUDFRONT_ID}  --paths "/*"

