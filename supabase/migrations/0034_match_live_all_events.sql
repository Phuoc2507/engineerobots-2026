-- 0034: get_match_live trả toàn bộ sự kiện của trận (trước đây chỉ 30 sự kiện mới nhất)
-- để bộ đếm từng ô trên bàn thư ký và điểm theo chặng trên màn hình chiếu luôn đúng khi trận có nhiều retry / lỗi
CREATE OR REPLACE FUNCTION public.get_match_live(p_match uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
    SELECT jsonb_build_object(
        'server_now', now(),
        'match', jsonb_build_object(
            'id', m.id, 'match_code', m.match_code, 'stage', m.stage, 'status', m.status, 'start_time', m.start_time,
            'duration_seconds', m.duration_seconds, 'remaining_seconds', m.remaining_seconds,
            'clock_started_at', m.clock_started_at, 'live_remaining', public._live_remaining(m),
            'timeout_until', m.timeout_until, 'timeout_team', m.timeout_team,
            'red_timeout_used', m.red_timeout_used, 'blue_timeout_used', m.blue_timeout_used,
            'red_score', m.red_score, 'blue_score', m.blue_score, 'finished_at', m.finished_at,
            'winner', CASE WHEN m.winner_team_id = m.red_team_id THEN 'RED' WHEN m.winner_team_id = m.blue_team_id THEN 'BLUE' END),
        'red',  (SELECT jsonb_build_object('id', t.id, 'team_name', t.team_name, 'robot_name', t.robot_name, 'logo_url', t.logo_url,
                                           'inspection_passed', t.inspection_passed) FROM teams t WHERE t.id = m.red_team_id),
        'blue', (SELECT jsonb_build_object('id', t.id, 'team_name', t.team_name, 'robot_name', t.robot_name, 'logo_url', t.logo_url,
                                           'inspection_passed', t.inspection_passed) FROM teams t WHERE t.id = m.blue_team_id),
        'points', coalesce((SELECT jsonb_agg(jsonb_build_object('index', p.point_index, 'owner', p.current_owner,
                                                                'golden', p.is_golden_core) ORDER BY p.point_index)
                            FROM arena_control_points p WHERE p.match_id = m.id), '[]'),
        'events', coalesce((SELECT jsonb_agg(e ORDER BY e.created_at DESC) FROM (
                               SELECT ev.id, ev.team_color, ev.event_type, ev.point_value, ev.target_point_index,
                                      ev.match_timestamp_seconds, ev.notes, ev.created_at, r.rule_name
                               FROM match_events ev LEFT JOIN scoring_rules r ON r.rule_key = ev.event_type
                               WHERE ev.match_id = m.id ORDER BY ev.created_at DESC LIMIT 500) e), '[]'),
        'fouls', jsonb_build_object(
            'RED',  (SELECT count(*) FROM match_events WHERE match_id = m.id AND team_color = 'RED'  AND event_type LIKE 'FOUL%'),
            'BLUE', (SELECT count(*) FROM match_events WHERE match_id = m.id AND team_color = 'BLUE' AND event_type LIKE 'FOUL%'))
    )
    FROM matches m WHERE m.id = p_match;
$function$;
