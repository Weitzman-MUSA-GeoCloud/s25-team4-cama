SELECT
    year AS tax_year,
    FLOOR(CAST(market_value AS FLOAT64) / 10000) * 10000 AS lower_bound,
    CEIL(CAST(market_value AS FLOAT64) / 10000) * 10000 AS upper_bound,
    COUNT(*) AS property_count
FROM
    core.phl_opa_assessments
WHERE
    SAFE_CAST(market_value AS FLOAT64) IS NOT NULL
    AND year = SAFE_CAST(${year} AS STRING) -- noqa: 
GROUP BY 
    year, lower_bound, upper_bound
HAVING 
    upper_bound >= 100000 AND upper_bound <= 10000000
ORDER BY 
    tax_year, lower_bound