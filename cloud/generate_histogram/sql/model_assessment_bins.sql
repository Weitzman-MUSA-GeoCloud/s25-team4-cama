SELECT
    2025 AS tax_year,
    POWER(10, FLOOR(LOG(CAST(price AS FLOAT64) + 0.1))) AS lower_bound,
    POWER(10, CEIL(LOG(CAST(price AS FLOAT64) + 0.1))) AS upper_bound,
    COUNT(*) AS property_count
FROM
    derived.model_assessment_output
WHERE
    SAFE_CAST(price AS FLOAT64) IS NOT NULL
    AND price > 0
GROUP BY
    lower_bound, upper_bound
HAVING
    upper_bound >= 100000
ORDER BY
    lower_bound
