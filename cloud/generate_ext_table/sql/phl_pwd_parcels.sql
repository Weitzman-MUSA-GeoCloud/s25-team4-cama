CREATE OR REPLACE EXTERNAL TABLE ${dataset_name}.phl_pwd_parcels (
  `geometry` GEOGRAPHY,
  `id` STRING,
  `owner1` STRING,
  `owner2` STRING,
  `bldg_desc` STRING,
  `pin` STRING,
  `parcelid` STRING,
  `bldg_code` STRING,
  `parcel_id` STRING,
  `tencode` STRING,
  `num_brt` STRING,
  `num_accoun` STRING,
  `brt_id` STRING,
  `address` STRING,
  `gross_area` STRING,
)
OPTIONS (
  format="NEWLINE_DELIMITED_JSON",
  json_extension = 'GEOJSON',
  uris = ['gs://${bucket_name}/phl_pwd_parcels/*.jsonl']
)
