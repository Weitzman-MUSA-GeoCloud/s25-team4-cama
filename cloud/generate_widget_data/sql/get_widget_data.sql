SELECT
  a.property_id,
  p.address,
  ARRAY_AGG(
    STRUCT(
      SAFE_CAST(a.year AS int64) AS year,
      SAFE_CAST(a.market_value AS FLOAT64) AS market_value,
      SAFE_CAST(a.taxable_land AS FLOAT64) AS land_taxable,
      SAFE_CAST(a.taxable_building AS FLOAT64) AS improvement_taxable
    )
    ORDER BY SAFE_CAST(a.year AS FLOAT64)
  ) AS assessment_history
FROM
  core.phl_opa_assessments a
JOIN
  core.phl_pwd_parcels p
ON
  a.property_id = ${property_id}
WHERE
  a.property_id IS NOT NULL
GROUP BY
  a.property_id, p.address