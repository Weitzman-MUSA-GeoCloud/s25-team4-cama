## Deploying


#### Reformats opa property data from csv to jsonl and reprojects geometry from epsg:2272 to epsg:4326
#### Reads from raw data bucket and writes to prepared data bucket
_prepare_phl_opa_properties_:

#### Deploy cloud function: prepare_phl_opa_properties
```shell
gcloud functions deploy prepare_phl_opa_properties `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=prepare_phl_opa_properties `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=8Gi `
--timeout=480s `
--set-env-vars=DATA_LAKE_BUCKET=musa5090s25-team4-raw_data `
--trigger-http `
--no-allow-unauthenticated
```

#### Execute cloud function: prepare_phl_opa_properties
```shell
gcloud functions call prepare_phl_opa_properties --region=us-east4
```

#### Reformats pwd parcel data from geojson to jsonl
#### Reads from raw data bucket and writes to prepared data bucket
_prepare_phl_pwd_parcels_:

#### Deploy cloud function: prepare_phl_pwd_parcels
```shell
gcloud functions deploy prepare_phl_pwd_parcels `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=prepare_phl_pwd_parcels `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=8Gi `
--timeout=480s `
--set-env-vars=DATA_LAKE_BUCKET=musa5090s25-team4-raw_data `
--trigger-http `
--no-allow-unauthenticated
```

#### Executes cloud function: prepare_phl_pwd_parcels
```shell
gcloud functions call prepare_phl_pwd_parcels --region=us-east4
```

#### Reformats opa assessment history data from csv to jsonl and reprojects geometry from epsg:2272 to epsg:4326
#### Reads from raw data bucket and writes to prepared data bucket
_prepare_phl_opa_assessments_:

#### Deploy cloud function: prepare_phl_opa_assessments
```shell
gcloud functions deploy prepare_phl_opa_assessments `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=prepare_phl_opa_assessments `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=8Gi `
--timeout=480s `
--set-env-vars=DATA_LAKE_BUCKET=musa5090s25-team4-raw_data `
--trigger-http `
--no-allow-unauthenticated
```

#### Execute cloud function: prepare_phl_opa_assessments
```shell
gcloud functions call prepare_phl_opa_assessments --region=us-east4
```