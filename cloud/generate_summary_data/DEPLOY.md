## Deploying


#### Creates phl_opa_properties table in core dataset in bigquery and adds property_id column
#### based on external table with phl_opa_properties table in source dataset
_get_summary_statistic_:

#### Deploy cloud function: get_summary_statistic
```shell
gcloud functions deploy get_summary_statistic `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=get_summary_statistic `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=4Gi `
--timeout=480s `
--trigger-http `
--allow-unauthenticated
```

