select APPROX_QUANTILES(CAST(market_value AS NUMERIC), SAFECAST(${quantiles} AS INTEGER)) AS breaks
FROM
    core.phl_opa_assessments
WHERE
    SAFE_CAST(market_value AS FLOAT64) IS NOT NULL
    AND year = SAFE_CAST(2024 AS STRING)
    AND SAFE_CAST(market_value AS FLOAT64) >= 10000 
    AND SAFE_CAST(market_value AS FLOAT64) <= 10000000