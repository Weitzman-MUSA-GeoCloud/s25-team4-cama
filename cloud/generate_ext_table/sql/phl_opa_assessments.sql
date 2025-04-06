CREATE OR REPLACE EXTERNAL TABLE ${dataset_name}.phl_opa_assessments (
  `parcel_number` STRING,
  `year` STRING,
  `market_value` STRING,
  `taxable_land` STRING,
  `taxable_building` STRING,
  `exempt_land` STRING,
  `exempt_building` STRING,
  `objectid` STRING,
)
OPTIONS (
  format = 'JSON',
  uris = ['gs://${bucket_name}/phl_opa_assessments/*.jsonl']
)
