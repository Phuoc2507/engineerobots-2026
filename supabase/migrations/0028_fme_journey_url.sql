-- 0028: web đổi sang https://fme-journey-2026.vercel.app — job đồng bộ Sheets gọi URL mới
SELECT cron.alter_job(jobid, command := replace(command, 'https://engineerobots-2026.vercel.app', 'https://fme-journey-2026.vercel.app'))
  FROM cron.job
 WHERE command LIKE '%https://engineerobots-2026.vercel.app%';
