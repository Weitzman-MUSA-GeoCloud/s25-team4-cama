## Deploying


#### Creates new external table in bigquery based on the phl_opa_properties.jsonl file in prepared data bucket
_generate_current_assessments_model_training_data_:

#### Deploy cloud function: generate_current_assessments_model_training_data
```shell
gcloud functions deploy generate_current_assessments_model_training_data `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=generate_current_assessments_model_training_data `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=2Gi `
--timeout=480s `
--trigger-http `
--no-allow-unauthenticated
```

#### Execute cloud function: generate_current_assessments_model_training_data
```shell
gcloud functions call generate_current_assessments_model_training_data `
--region=us-east4
```
