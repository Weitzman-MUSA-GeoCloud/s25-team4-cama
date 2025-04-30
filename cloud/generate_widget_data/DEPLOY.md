## Deploying


#### Creates phl_opa_properties table in core dataset in bigquery and adds property_id column
#### based on external table with phl_opa_properties table in source dataset
_generate_widget_data_:

#### Deploy cloud function: get_tax_year_assessment_bins
```shell
gcloud functions deploy generate_widget_data `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=generate_widget_data `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=4Gi `
--timeout=480s `
--trigger-http `
--allow-unauthenticated
```
