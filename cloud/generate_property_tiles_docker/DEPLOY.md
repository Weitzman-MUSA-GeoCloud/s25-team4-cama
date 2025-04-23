## Deploying

_generate_property_tiles_:

## Deploy container and create job. 
```shell
gcloud run jobs deploy generate-property-tiles `
  --service-account data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
  --cpu 4 `
  --memory 4Gi `
  --region us-east4 `
  --source .
```

## Execute job
```shell
gcloud run jobs execute generate-property-tiles --region us-east4
```


#### OLD: Only needed once when creating new job
```shell
gcloud artifacts repositories create generate-property-tiles --repository-format=docker `
--location=us-central1
```

#### OLD: Do whenever docker build is changed
```shell
gcloud builds submit `
  --region us-central1 `
  --tag us-central1-docker.pkg.dev/musa5090s25-team4/generate-property-tiles/tiles-image:1
```

## OLD: Change to update/create depending on if job already exists
```shell
gcloud run jobs update generate-property-tiles `
  --image us-central1-docker.pkg.dev/musa5090s25-team4/run-model/test-image:tag1 `
  --service-account data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
  --cpu 4 `
  --memory 4Gi `
  --region us-central1
```
