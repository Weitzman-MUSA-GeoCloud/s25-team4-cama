SELECT
    year AS tax_year,
    POWER(10, FLOOR(LOG(CAST(market_value AS FLOAT64) + 0.1))) AS lower_bound,
    POWER(10, CEIL(LOG(CAST(market_value AS FLOAT64) + 0.1))) AS upper_bound,
    COUNT(*) AS property_count
FROM
    core.phl_opa_assessments
WHERE
    SAFE_CAST(market_value AS FLOAT64) IS NOT NULL
    AND year = SAFE_CAST(${filter_year} AS STRING) -- noqa: 
GROUP BY 
    year, lower_bound, upper_bound
HAVING 
    upper_bound >= 100000
ORDER BY 
    tax_year, lower_bound