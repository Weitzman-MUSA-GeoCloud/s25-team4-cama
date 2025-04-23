## Deploying


#### Reformats opa property data from csv to jsonl and reprojects geometry from epsg:2272 to epsg:4326
#### Reads from raw data bucket and writes to prepared data bucket
_prepare_phl_opa_properties_:

#### Deploy cloud function: prepare_phl_opa_properties
```shell
gcloud functions deploy generate_tile_info `
--gen2 `
--region=us-east4 `
--runtime=python312 `
--source=. `
--entry-point=generate_tile_info `
--service-account=data-pipeline-user@musa5090s25-team4.iam.gserviceaccount.com `
--memory=8Gi `
--timeout=480s `
--trigger-http `
--no-allow-unauthenticated
```

#### Execute cloud function: generate_tile_info
```shell
gcloud functions call generate_tile_info --region=us-east4
```
