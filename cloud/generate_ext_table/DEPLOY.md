## Deploying


#### Creates new external table in bigquery based on the phl_opa_properties.jsonl file in prepared data bucket
_generate_ext_table_phl_opa_properties_:

#### Deploy cloud function: generate_ext_table_phl_opa_properties
```shell
gcloud functions deploy generate_ext_table_phl_opa_properties `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=generate_ext_table_phl_opa_properties `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=8Gi `
--timeout=480s `
--trigger-http `
--no-allow-unauthenticated
```

#### Execute cloud function: generate_ext_table_phl_opa_properties
```shell
gcloud functions call generate_ext_table_phl_opa_properties `
--region=us-east4
```

#### Creates new external table in bigquery based on the phl_pwd_parcels.jsonl file in prepared data bucket
_generate_ext_table_phl_pwd_parcels_:

#### Deploy cloud function: generate_ext_table_phl_pwd_parcels
```shell
gcloud functions deploy generate_ext_table_phl_pwd_parcels `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=generate_ext_table_phl_pwd_parcels `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=8Gi `
--timeout=480s `
--trigger-http `
--no-allow-unauthenticated
```

#### Execute cloud function: generate_ext_table_phl_pwd_parcels
```shell
gcloud functions call generate_ext_table_phl_pwd_parcels `
--region=us-east4
```

#### Creates new external table in bigquery based on the phl_opa_assessments.jsonl file in prepared data bucket
_generate_ext_table_phl_opa_assessments_:

#### Deploy cloud function: generate_ext_table_phl_opa_assessments
```shell
gcloud functions deploy generate_ext_table_phl_opa_assessments `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=generate_ext_table_phl_opa_assessments `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=8Gi `
--timeout=480s `
--trigger-http `
--no-allow-unauthenticated
```

#### Execute cloud function: generate_ext_table_phl_opa_assessments
```shell
gcloud functions call generate_ext_table_phl_opa_assessments `
--region=us-east4
```