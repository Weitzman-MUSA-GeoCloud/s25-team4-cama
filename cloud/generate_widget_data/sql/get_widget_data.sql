SELECT
  a.property_id,
  p.address,
  SAFE_CAST(a.year AS INT64) AS year,
  SAFE_CAST(NULLIF(a.market_value, '') AS FLOAT64) AS market_value,
  SAFE_CAST(NULLIF(a.taxable_land, '') AS FLOAT64) AS land_taxable,
  SAFE_CAST(NULLIF(a.taxable_building, '') AS FLOAT64) AS improvement_taxable,
  SAFE_CAST(NULLIF(a.exempt_land, '') AS FLOAT64) AS land_exempt,
  SAFE_CAST(NULLIF(a.exempt_building, '') AS FLOAT64) AS improvement_exempt,
FROM
  core.phl_opa_assessments a
JOIN
  core.phl_pwd_parcels p
ON
  a.property_id = p.property_id
WHERE
  a.property_id IS NOT NULL
  AND a.property_id = '${property_id}'
ORDER BY
  a.property_id,
  SAFE_CAST(a.year AS INT64)