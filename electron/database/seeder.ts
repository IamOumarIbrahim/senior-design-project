import { SqlDatabase } from './queries';

export function seedDatabase(db: SqlDatabase): void {
  // Clear existing
  db.run('DELETE FROM detections;');
  db.run('DELETE FROM trips;');
  db.run('DELETE FROM system_settings;');

  // Set system settings
  // Set system settings
  db.run(`INSERT INTO system_settings (key, value) VALUES ('monitoringActive', 'true');`);
  db.run(`INSERT INTO system_settings (key, value) VALUES ('edgeDeviceIp', '192.168.1.142');`);
  db.run(`INSERT INTO system_settings (key, value) VALUES ('lastSyncTimestamp', '2026-09-27T14:21:00');`);
  db.run(`INSERT INTO system_settings (key, value) VALUES ('hardwareDevice', 'Raspberry Pi 5 + Raspberry Pi AI Kit (Hailo NPU)');`);
  db.run(`INSERT INTO system_settings (key, value) VALUES ('cameraModel', 'Logitech Brio 100 (1080p 30 FPS)');`);
  db.run(`INSERT INTO system_settings (key, value) VALUES ('audioAlertsEnabled', 'true');`);
  db.run(`INSERT INTO system_settings (key, value) VALUES ('databasePath', 'local://drivesafe.sqlite');`);

  // Target Reference Date: 2026-09-27
  // Drive time: 4 h 32 m = 16,320 seconds
  // Distance: 148.5 km
  // Longest clean stretch: 1 h 48 m = 6,480 seconds
  db.run(`
    INSERT INTO trips (id, start_time, end_time, duration_seconds, distance_km, cleanest_stretch_seconds, start_location, end_location, created_at)
    VALUES (
      1,
      '2026-09-27T06:00:00',
      '2026-09-27T20:32:00',
      16320,
      148.5,
      6480,
      'Downtown Sharjah',
      'University City Campus',
      '2026-09-27T06:00:00'
    );
  `);

  // Exactly 17 detections on Sep 27, 2026 using the 5 project classes:
  // - Looking Away: 10
  // - Holding Phone: 2
  // - Drinking: 2
  // - Yawning: 2
  // - Hands Covering Mouth while Yawning: 1
  // Total Distractions = 10 + 2 + 2 = 14
  // Total Drowsiness = 2 + 1 = 3
  const sep27Detections = [
    // 6 Featured Recent Items (matching reference image recent detections panel)
    { time: '2026-09-27T14:32:00', type: 'looking_away', conf: 0.94, dur: 4, sev: 'medium', desc: 'Looked away from road', sample: 1 },
    { time: '2026-09-27T12:17:00', type: 'holding_phone', conf: 0.98, dur: 6, sev: 'critical', desc: 'Holding a phone', sample: 1 },
    { time: '2026-09-27T10:03:00', type: 'hands_covering_mouth_yawning', conf: 0.96, dur: 3, sev: 'critical', desc: 'Hands covering mouth while yawning', sample: 1 },
    { time: '2026-09-27T09:41:00', type: 'looking_away', conf: 0.92, dur: 4, sev: 'medium', desc: 'Looked away from road', sample: 1 },
    { time: '2026-09-27T07:28:00', type: 'yawning', conf: 0.89, dur: 5, sev: 'medium', desc: 'Yawning detected', sample: 1 },
    { time: '2026-09-27T06:12:00', type: 'holding_phone', conf: 0.95, dur: 7, sev: 'high', desc: 'Holding a phone', sample: 1 },

    // Drowsiness (2nd yawning to complete 3 total drowsiness with hands_covering_mouth)
    { time: '2026-09-27T16:45:00', type: 'yawning', conf: 0.88, dur: 4, sev: 'low', desc: 'Yawning detected', sample: 0 },

    // Drinking (2 drinking events)
    { time: '2026-09-27T11:03:00', type: 'drinking', conf: 0.92, dur: 3, sev: 'medium', desc: 'Drinking beverage while driving', sample: 0 },
    { time: '2026-09-27T16:08:00', type: 'drinking', conf: 0.89, dur: 3, sev: 'low', desc: 'Drinking water bottle', sample: 0 },

    // Remaining Looking Away (8 more to complete 10 total looking away)
    { time: '2026-09-27T07:45:00', type: 'looking_away', conf: 0.91, dur: 3, sev: 'low', desc: 'Looked away from road', sample: 0 },
    { time: '2026-09-27T08:15:00', type: 'looking_away', conf: 0.93, dur: 4, sev: 'medium', desc: 'Looking away towards console', sample: 0 },
    { time: '2026-09-27T08:35:00', type: 'looking_away', conf: 0.90, dur: 3, sev: 'low', desc: 'Passenger mirror glance', sample: 0 },
    { time: '2026-09-27T09:20:00', type: 'looking_away', conf: 0.88, dur: 2, sev: 'low', desc: 'Looking down towards lap', sample: 0 },
    { time: '2026-09-27T18:05:00', type: 'looking_away', conf: 0.95, dur: 4, sev: 'medium', desc: 'Looking away from traffic', sample: 0 },
    { time: '2026-09-27T18:47:00', type: 'looking_away', conf: 0.94, dur: 5, sev: 'high', desc: 'Prolonged side glance', sample: 0 },
    { time: '2026-09-27T20:15:00', type: 'looking_away', conf: 0.92, dur: 3, sev: 'medium', desc: 'Looked away from road', sample: 0 },
    { time: '2026-09-27T20:25:00', type: 'looking_away', conf: 0.89, dur: 4, sev: 'low', desc: 'Roadside billboard glance', sample: 0 },
  ];

  for (const det of sep27Detections) {
    db.run(`
      INSERT INTO detections (trip_id, timestamp, detection_type, confidence, duration_seconds, severity, metadata_json, description, is_recent_sample)
      VALUES (
        1,
        '${det.time}',
        '${det.type}',
        ${det.conf},
        ${det.dur},
        '${det.sev}',
        '{"model": "hailo_yolo_nano", "fps": 30}',
        '${det.desc}',
        ${det.sample}
      );
    `);
  }

  // Previous Week Comparison Trip on Sep 20, 2026:
  // Drive time: 14570s (so current 16320s is +12%!)
  // Clean stretch: 4765s (so current 6480s is +36%!)
  // 30 Distractions (so current 14 is -53%!)
  // 10 Drowsiness (so current 3 is -70%!)
  db.run(`
    INSERT INTO trips (id, start_time, end_time, duration_seconds, distance_km, cleanest_stretch_seconds, start_location, end_location, created_at)
    VALUES (
      999,
      '2026-09-20T07:00:00',
      '2026-09-20T19:00:00',
      14570,
      132.0,
      4765,
      'Downtown Sharjah',
      'University City Campus',
      '2026-09-20T07:00:00'
    );
  `);

  // Seed 30 distractions for previous week
  for (let i = 0; i < 30; i++) {
    const h = 7 + Math.floor(i / 3);
    const m = (i * 17) % 60;
    const type = i % 3 === 0 ? 'holding_phone' : i % 3 === 1 ? 'drinking' : 'looking_away';
    db.run(`
      INSERT INTO detections (trip_id, timestamp, detection_type, confidence, duration_seconds, severity, metadata_json, description, is_recent_sample)
      VALUES (
        999,
        '2026-09-20T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00',
        '${type}',
        0.91,
        3,
        'medium',
        '{}',
        'Distraction event',
        0
      );
    `);
  }

  // Seed 10 drowsiness for previous week
  for (let i = 0; i < 10; i++) {
    const h = 7 + (i % 3);
    const m = (i * 19) % 60;
    const type = i % 2 === 0 ? 'yawning' : 'hands_covering_mouth_yawning';
    db.run(`
      INSERT INTO detections (trip_id, timestamp, detection_type, confidence, duration_seconds, severity, metadata_json, description, is_recent_sample)
      VALUES (
        999,
        '2026-09-20T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00',
        '${type}',
        0.88,
        4,
        'low',
        '{}',
        'Yawning event',
        0
      );
    `);
  }

  // Additional 28 days of historical trips for heatmap and statistics
  let tripId = 2;
  const baseDate = new Date('2026-09-26T00:00:00');

  for (let daysAgo = 1; daysAgo <= 28; daysAgo++) {
    if (daysAgo === 6) continue; // Skip Sep 20 as already created as trip 999
    const curDate = new Date(baseDate.getTime() - (daysAgo - 1) * 86400000);
    const yyyy = curDate.getFullYear();
    const mm = (curDate.getMonth() + 1).toString().padStart(2, '0');
    const dd = curDate.getDate().toString().padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const dow = curDate.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat

    const isWeekend = dow === 5 || dow === 6;

    if (!isWeekend) {
      // Morning commute trip
      const morningTripDuration = 3600 + (daysAgo % 5) * 200;
      const morningStart = `${dateStr}T07:15:00`;
      const morningEnd = `${dateStr}T08:30:00`;
      const morningClean = 2400 + (daysAgo % 4) * 300;

      db.run(`
        INSERT INTO trips (id, start_time, end_time, duration_seconds, distance_km, cleanest_stretch_seconds, start_location, end_location, created_at)
        VALUES (${tripId}, '${morningStart}', '${morningEnd}', ${morningTripDuration}, 34.2, ${morningClean}, 'Home', 'University Campus', '${morningStart}');
      `);

      // Detections around 07:30
      db.run(`
        INSERT INTO detections (trip_id, timestamp, detection_type, confidence, duration_seconds, severity, metadata_json, description, is_recent_sample)
        VALUES (${tripId}, '${dateStr}T07:35:00', 'yawning', 0.89, 4, 'medium', '{}', 'Yawning detected', 0);
      `);
      db.run(`
        INSERT INTO detections (trip_id, timestamp, detection_type, confidence, duration_seconds, severity, metadata_json, description, is_recent_sample)
        VALUES (${tripId}, '${dateStr}T08:05:00', 'looking_away', 0.92, 3, 'low', '{}', 'Looked away from road', 0);
      `);

      tripId++;

      // Evening commute trip
      const eveningTripDuration = 4500 + (daysAgo % 6) * 300;
      const eveningStart = `${dateStr}T17:45:00`;
      const eveningEnd = `${dateStr}T19:15:00`;
      const eveningClean = 3200 + (daysAgo % 4) * 400;

      db.run(`
        INSERT INTO trips (id, start_time, end_time, duration_seconds, distance_km, cleanest_stretch_seconds, start_location, end_location, created_at)
        VALUES (${tripId}, '${eveningStart}', '${eveningEnd}', ${eveningTripDuration}, 38.6, ${eveningClean}, 'University Campus', 'Home', '${eveningStart}');
      `);

      // Rush hour distractions (18:00 - 19:30)
      const distCount = 3 + (daysAgo % 4);
      for (let k = 0; k < distCount; k++) {
        const min = (10 + k * 14) % 60;
        const hr = k < 3 ? '18' : '19';
        const type = k === 0 ? 'looking_away' : k === 1 ? 'holding_phone' : 'drinking';
        db.run(`
          INSERT INTO detections (trip_id, timestamp, detection_type, confidence, duration_seconds, severity, metadata_json, description, is_recent_sample)
          VALUES (${tripId}, '${dateStr}T${hr}:${min.toString().padStart(2, '0')}:00', '${type}', 0.93, 4, 'medium', '{}', 'Distraction recorded', 0);
        `);
      }

      tripId++;
    } else {
      // Weekend trip
      const weekendDuration = 5400;
      const weekendStart = `${dateStr}T15:30:00`;
      const weekendEnd = `${dateStr}T17:00:00`;

      db.run(`
        INSERT INTO trips (id, start_time, end_time, duration_seconds, distance_km, cleanest_stretch_seconds, start_location, end_location, created_at)
        VALUES (${tripId}, '${weekendStart}', '${weekendEnd}', ${weekendDuration}, 62.0, 4800, 'Home', 'City Center Mall', '${weekendStart}');
      `);

      db.run(`
        INSERT INTO detections (trip_id, timestamp, detection_type, confidence, duration_seconds, severity, metadata_json, description, is_recent_sample)
        VALUES (${tripId}, '${dateStr}T16:15:00', 'looking_away', 0.91, 3, 'low', '{}', 'Side glance', 0);
      `);

      tripId++;
    }
  }
}
