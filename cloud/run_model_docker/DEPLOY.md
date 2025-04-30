## Deploying

_run_model_:

## Deploy container and create job. 
```shell
gcloud run jobs deploy run-model `
  --service-account data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
  --cpu 4 `
  --memory 4Gi `
  --region us-east4 `
  --source .
```

## Execute job
```shell
gcloud run jobs execute run-model --region us-east4
```

#### OLD:Only needed once when creating new job
```shell
gcloud artifacts repositories create run-model --repository-format=docker `
--location=us-central1
```

#### OLD:Do whenever docker build is changed
```shell
gcloud builds submit `
  --region us-central1 `
  --tag us-central1-docker.pkg.dev/musa5090s25-team4/run-model/model-image:5
```

## OLD:Change to update/create depending on if job already exists
```shell
gcloud run jobs update run-model `
  --image us-central1-docker.pkg.dev/musa5090s25-team4/run-model/model-image:5 `
  --service-account data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
  --cpu 4 `
  --memory 4Gi `
  --region us-central1 `
```