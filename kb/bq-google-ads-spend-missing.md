# Troubleshooting Missing Google Ads Spend Data in BigQuery

## Overview
This document provides steps to diagnose and resolve issues when Google Ads spend data is missing for specific clients or date ranges in the BigQuery table `juan-lozano-dev.test_jdl.test_data`. This guide assumes a typical marketing data pipeline using Airflow, Cloud Run, and Google Cloud Storage.

---

## Spot-Check Query
To verify data presence for a client and date range, run:

```sql
SELECT
  DATE(date) AS date,
  client_id,
  SUM(spend) AS total_spend
FROM
  `juan-lozano-dev.test_jdl.test_data`
WHERE
  client_id = 'XYZ' -- Replace with client of interest
  AND DATE(date) BETWEEN '2025-10-08' AND '2025-10-17'
GROUP BY
  date, client_id
ORDER BY
  date;
```

---

## Common Causes
- **Airflow DAG Failure:** The daily ETL job (e.g., `etl_google_ads_spend`) failed or was skipped for affected dates.
- **Cloud Run Job Error:** The Cloud Run service responsible for data ingestion encountered an error (e.g., API quota, auth failure).
- **Source Data Delay:** Google Ads API did not return data for the requested date (delayed or incomplete data).
- **Credential Expiry:** Service account or OAuth credentials expired or were revoked.
- **Manual Data Correction:** Data was deleted or overwritten by a manual process.

---

## Recommended Steps
1. **Run the Spot-Check Query** above to confirm which dates/clients are missing.
2. **Check Airflow DAG Runs:**
   - Go to Airflow UI and review the `etl_google_ads_spend` DAG for failures/skips on missing dates.
3. **Review Cloud Run Logs:**
   - In Google Cloud Console, check Cloud Run logs for errors or timeouts on the relevant dates.
4. **Inspect Source Data:**
   - Query Google Ads API directly or check raw files in GCS bucket (e.g., `gs://company-marketing-data/google_ads/`).
5. **Validate Credentials:**
   - Ensure service accounts and OAuth tokens are valid and have not expired.
6. **Re-Run ETL:**
   - If a failure is found, re-run the ETL for the missing dates/clients.
7. **Document Findings:**
   - Record root cause and resolution in the incident tracker or this KB.

---

## References
- [Airflow Monitoring Best Practices](https://airflow.apache.org/docs/apache-airflow/stable/monitoring/index.html)
- [Cloud Run Logging](https://cloud.google.com/run/docs/logging)
- [Google Ads API Troubleshooting](https://developers.google.com/google-ads/api/docs/best-practices/troubleshooting)
- Internal: [Data Engineering Runbook](https://company-internal-docs/runbook)
