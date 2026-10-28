-- 0014: sheets-sync chạy mỗi phút → cron.job_run_details thêm ~1.440 dòng/ngày. Mỗi đêm xóa log cũ hơn 3 ngày.
SELECT cron.schedule('cron-log-cleanup', '17 3 * * *', $job$
    DELETE FROM cron.job_run_details WHERE end_time < now() - interval '3 days'
$job$);
