## Deploying


#### Downloads opa property data into gcloud storage bucket (raw_data)
_extract_phl_opa_properties_:

#### Deploy cloud function: extract_phl_opa_properties
```shell
gcloud functions deploy extract_phl_opa_properties `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=extract_phl_opa_properties `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=4Gi `
--timeout=240s `
--set-env-vars=DATA_LAKE_BUCKET=musa5090s25-team4-raw_data `
--trigger-http `
--no-allow-unauthenticated
```

#### Execute cloud function: extract_phl_opa_properties
```shell
gcloud functions call extract_phl_opa_properties --region=us-east4
```

#### Downloads pwd parcel data into gcloud storage bucket (raw_data)
_extract_phl_pwd_parcels_:

#### Deploy cloud function: extract_phl_pwd_parcels
```shell
gcloud functions deploy extract_phl_pwd_parcels `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=extract_phl_pwd_parcels `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=4Gi `
--timeout=240s `
--set-env-vars=DATA_LAKE_BUCKET=musa5090s25-team4-raw_data `
--trigger-http `
--no-allow-unauthenticated
```

#### Execute cloud function: extract_phl_pwd_parcels
```shell
gcloud functions call extract_phl_pwd_parcels --region=us-east4
```

#### Downloads opa assessment history data into gcloud storage bucket (raw_data)
_extract_phl_opa_assessments_:

#### Deploy cloud function: extract_phl_opa_assessments
```shell
gcloud functions deploy extract_phl_opa_assessments `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=extract_phl_opa_assessments `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=4Gi `
--timeout=240s `
--set-env-vars=DATA_LAKE_BUCKET=musa5090s25-team4-raw_data `
--trigger-http `
--no-allow-unauthenticated
```
#### Execute cloud function: extract_phl_opa_assessments
```shell
gcloud functions call extract_phl_opa_assessments --region=us-east4
```