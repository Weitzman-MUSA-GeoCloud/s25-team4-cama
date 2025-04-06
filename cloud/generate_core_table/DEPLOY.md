## Deploying


#### Creates phl_opa_properties table in core dataset in bigquery and adds property_id column
#### based on external table with phl_opa_properties table in source dataset
_generate_core_table_phl_opa_properties_:

#### Deploy cloud function: generate_core_table_phl_opa_properties
```shell
gcloud functions deploy generate_core_table_phl_opa_properties `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=generate_core_table_phl_opa_properties `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=8Gi `
--timeout=480s `
--trigger-http `
--no-allow-unauthenticated
```

#### Execute cloud function: generate_core_table_phl_opa_properties
```shell
gcloud functions call generate_core_table_phl_opa_properties `
--region=us-east4
```

#### Creates phl_pwd_parcels table in core dataset in bigquery and adds property_id column
#### based on external table with phl_pwd_parcels table in source dataset
_generate_core_table_phl_pwd_parcels_:

#### Deploy cloud function: generate_core_table_phl_pwd_parcels
```shell
gcloud functions deploy generate_core_table_phl_pwd_parcels `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=generate_core_table_phl_pwd_parcels `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=8Gi `
--timeout=480s `
--trigger-http `
--no-allow-unauthenticated
```

#### Execute cloud function: generate_core_table_phl_pwd_parcels
```shell
gcloud functions call generate_core_table_phl_pwd_parcels `
--region=us-east4
```

#### Creates phl_opa_assessments table in core dataset in bigquery and adds property_id column
#### based on external table with phl_opa_assessments table in source dataset
_generate_core_table_phl_opa_assessments_:

#### Deploy cloud function: generate_core_table_phl_opa_assessments
```shell
gcloud functions deploy generate_core_table_phl_opa_assessments `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=generate_core_table_phl_opa_assessments `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=8Gi `
--timeout=480s `
--trigger-http `
--no-allow-unauthenticated
```

#### Execute cloud function: generate_core_table_phl_opa_assessments
```shell
gcloud functions call generate_core_table_phl_opa_assessments `
--region=us-east4
```