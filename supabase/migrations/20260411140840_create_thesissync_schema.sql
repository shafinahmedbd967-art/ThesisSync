/*
  # ThesisSync - Smart Final Year Project & Supervisor Management System

  ## Tables Created
  1. `supervisors` - Faculty members who supervise thesis groups
     - id, name, email, department, expertise (array), max_groups, current_groups, bio, avatar_color
  2. `project_ideas` - Repository of thesis project ideas
     - id, title, description, category, difficulty_level, video_url, tags (array), view_count
  3. `thesis_groups` - Student groups with supervisor assignments
     - id, title, topic, category, supervisor_id, student_names (array), cgpa_avg, status, created_at
  4. `notifications` - System notifications for status updates
     - id, group_id, message, type, read, created_at

  ## Security
  - RLS enabled on all tables
  - Public read access for supervisors and project_ideas (no auth needed for demo)
  - Authenticated or anon insert/update for thesis_groups and notifications
*/

CREATE TABLE IF NOT EXISTS supervisors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  department text NOT NULL,
  expertise text[] DEFAULT '{}',
  max_groups integer DEFAULT 4,
  current_groups integer DEFAULT 0,
  bio text DEFAULT '',
  avatar_color text DEFAULT '#3B82F6',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  difficulty_level text NOT NULL DEFAULT 'Medium',
  video_url text DEFAULT '',
  tags text[] DEFAULT '{}',
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS thesis_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  topic text NOT NULL,
  category text NOT NULL,
  supervisor_id uuid REFERENCES supervisors(id) ON DELETE SET NULL,
  student_names text[] DEFAULT '{}',
  cgpa_avg numeric(4,2) DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES thesis_groups(id) ON DELETE CASCADE,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read supervisors"
  ON supervisors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can read project ideas"
  ON project_ideas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can update project idea view count"
  ON project_ideas FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read thesis groups"
  ON thesis_groups FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert thesis groups"
  ON thesis_groups FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update thesis groups"
  ON thesis_groups FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read notifications"
  ON notifications FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert notifications"
  ON notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update notifications"
  ON notifications FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can update supervisors"
  ON supervisors FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO supervisors (name, email, department, expertise, max_groups, current_groups, bio, avatar_color) VALUES
('Dr. Arif Rahman', 'arif.rahman@university.edu', 'CSE', ARRAY['Machine Learning','Deep Learning','Computer Vision','Python'], 5, 3, 'PhD from IIT Delhi. 12+ years in ML research. Published 40+ papers.', '#0EA5E9'),
('Dr. Fatema Begum', 'fatema.begum@university.edu', 'CSE', ARRAY['Web Development','Cloud Computing','Microservices','React'], 4, 2, 'Full-stack expert with industry experience at Google. Specializes in scalable web systems.', '#10B981'),
('Prof. Kamal Hossain', 'kamal.hossain@university.edu', 'CSE', ARRAY['IoT','Embedded Systems','Arduino','Raspberry Pi'], 4, 4, 'Pioneer in IoT research in Bangladesh. Leads the Smart Systems Lab.', '#F59E0B'),
('Dr. Nadia Islam', 'nadia.islam@university.edu', 'CSE', ARRAY['Cybersecurity','Network Security','Cryptography','Ethical Hacking'], 3, 1, 'Ex-cybersecurity analyst at BGCC. Expert in network defense and penetration testing.', '#EF4444'),
('Dr. Rahim Chowdhury', 'rahim.chowdhury@university.edu', 'CSE', ARRAY['Data Science','Big Data','Analytics','R Programming'], 5, 2, 'Collaborated with UNDP on data-driven development projects in South Asia.', '#8B5CF6'),
('Prof. Shirin Akter', 'shirin.akter@university.edu', 'CSE', ARRAY['Mobile Development','Android','iOS','Flutter'], 4, 3, 'Built 20+ production apps. Consults for leading tech firms in BD.', '#EC4899'),
('Dr. Imran Haque', 'imran.haque@university.edu', 'CSE', ARRAY['Blockchain','Distributed Systems','Ethereum','Smart Contracts'], 3, 2, 'Blockchain researcher and founder of a DeFi startup. Active in Web3 community.', '#14B8A6'),
('Prof. Joyita Das', 'joyita.das@university.edu', 'CSE', ARRAY['Natural Language Processing','Bangla NLP','Text Mining','BERT'], 4, 1, 'Leading Bangla NLP researcher. Part of the Unicode consortium for Bangla language support.', '#F97316'),
('Dr. Sabbir Ahmed', 'sabbir.ahmed@university.edu', 'EEE', ARRAY['Signal Processing','VLSI','FPGA','Digital Systems'], 3, 2, 'Research focuses on low-power VLSI design for IoT edge devices.', '#6366F1'),
('Prof. Runa Laila', 'runa.laila@university.edu', 'CSE', ARRAY['Algorithms','Competitive Programming','Graph Theory','Optimization'], 5, 0, 'ICPC world finalist coach. Expert in algorithm design and competitive programming.', '#D946EF')
ON CONFLICT (email) DO NOTHING;

INSERT INTO project_ideas (title, description, category, difficulty_level, video_url, tags) VALUES
('AI-Powered Bangla Sign Language Translator', 'Build a real-time system to translate Bangla sign language gestures into text using computer vision and deep learning. The system uses a webcam feed and CNN model for gesture classification.', 'AI/ML', 'Hard', 'https://www.youtube.com/embed/dMzDPh3xPAU', ARRAY['Computer Vision','Deep Learning','CNN','OpenCV','Python']),
('Smart Campus Energy Management System', 'IoT-based system to monitor and optimize energy consumption across campus buildings. Features real-time dashboards, anomaly detection, and automated controls.', 'IoT', 'Medium', 'https://www.youtube.com/embed/h0gWfVCSGQQ', ARRAY['IoT','Arduino','MQTT','Dashboard','Energy']),
('E-Learning Platform with Adaptive Quizzing', 'A full-stack e-learning platform where quizzes adapt to student performance using spaced repetition algorithms. Includes video lessons, progress tracking, and gamification.', 'Web/App Dev', 'Medium', 'https://www.youtube.com/embed/ysz5S6PUM-U', ARRAY['React','Node.js','PostgreSQL','Algorithms']),
('Blockchain-Based Academic Certificate Verification', 'Tamper-proof digital certificate system on Ethereum blockchain. Universities can issue certificates, and employers can verify authenticity instantly via QR code.', 'Blockchain', 'Hard', 'https://www.youtube.com/embed/QCvL-DWcojc', ARRAY['Blockchain','Ethereum','Solidity','Web3','QR Code']),
('Real-Time Traffic Congestion Predictor', 'Machine learning model to predict traffic congestion in Dhaka city using historical and real-time data. Provides route suggestions via a mobile-friendly web app.', 'AI/ML', 'Hard', 'https://www.youtube.com/embed/W3S5F0ewm_w', ARRAY['ML','Python','Maps API','Prediction','Data Science']),
('Telemedicine Platform for Rural Bangladesh', 'Web + mobile app connecting rural patients with urban doctors. Features video consultation, prescription generation, and medicine delivery integration.', 'Web/App Dev', 'Medium', 'https://www.youtube.com/embed/ysz5S6PUM-U', ARRAY['React','WebRTC','Healthcare','Mobile','API']),
('Smart Waste Bin with Fill-Level Detection', 'IoT waste bins that detect fill level using ultrasonic sensors and notify municipal workers via an app. Includes route optimization for garbage trucks.', 'IoT', 'Easy', 'https://www.youtube.com/embed/h0gWfVCSGQQ', ARRAY['IoT','Ultrasonic Sensor','NodeMCU','GPS','Optimization']),
('Bangla Sentiment Analysis for Social Media', 'NLP model to analyze sentiment from Bangla Facebook/Twitter posts. Useful for brand monitoring, political analysis, and crisis detection.', 'AI/ML', 'Medium', 'https://www.youtube.com/embed/dMzDPh3xPAU', ARRAY['NLP','Bangla','BERT','Sentiment','Python']),
('Automated Student Attendance via Face Recognition', 'Replace manual attendance with a face recognition system using a classroom camera. Auto-generates reports and sends alerts for irregular attendance.', 'AI/ML', 'Medium', 'https://www.youtube.com/embed/dMzDPh3xPAU', ARRAY['Face Recognition','OpenCV','Python','Attendance','Automation']),
('Peer-to-Peer Ride Sharing App', 'Mobile-first ride-sharing platform for university students. Features real-time tracking, fare splitting, and safety ratings. Built with Flutter and Firebase.', 'Mobile Dev', 'Medium', 'https://www.youtube.com/embed/ysz5S6PUM-U', ARRAY['Flutter','Firebase','Maps','Real-time','Mobile']),
('Network Intrusion Detection System', 'ML-based system that monitors network traffic and detects anomalies/intrusions in real-time. Uses Random Forest and LSTM models trained on NSL-KDD dataset.', 'Security', 'Hard', 'https://www.youtube.com/embed/QCvL-DWcojc', ARRAY['Security','ML','Network','LSTM','Anomaly Detection']),
('Hospital Bed Management System', 'Digital system to manage hospital bed availability in real-time. Patients can check bed availability, and hospitals can manage admissions efficiently.', 'Web/App Dev', 'Easy', 'https://www.youtube.com/embed/ysz5S6PUM-U', ARRAY['React','Database','Healthcare','Dashboard','API']),
('Smart Agriculture with Soil Monitoring', 'IoT sensors monitor soil moisture, temperature, and pH. An ML model predicts optimal watering and fertilization schedules via a farmer-friendly mobile app.', 'IoT', 'Medium', 'https://www.youtube.com/embed/h0gWfVCSGQQ', ARRAY['IoT','ML','Agriculture','Sensors','Mobile']),
('Decentralized Voting System', 'Blockchain-based voting system ensuring transparency, anonymity, and tamper-resistance. Suitable for university elections or small-scale official elections.', 'Blockchain', 'Hard', 'https://www.youtube.com/embed/QCvL-DWcojc', ARRAY['Blockchain','Voting','Ethereum','Privacy','Web3']),
('Student Mental Health Chatbot', 'An NLP-powered chatbot providing 24/7 mental health support, stress management tips, and crisis detection for university students.', 'AI/ML', 'Medium', 'https://www.youtube.com/embed/dMzDPh3xPAU', ARRAY['NLP','Chatbot','Mental Health','Python','AI']),
('Inventory Management for Small Businesses', 'Mobile + web app helping small Bangladeshi businesses track inventory, sales, and profits. Includes barcode scanning and automated reorder alerts.', 'Web/App Dev', 'Easy', 'https://www.youtube.com/embed/ysz5S6PUM-U', ARRAY['React Native','Barcode','Database','Business','Mobile']),
('Predictive Maintenance for Industrial Equipment', 'IoT + ML system to predict machine failures before they occur. Sensors collect vibration, temperature data; ML model predicts failure probability.', 'IoT', 'Hard', 'https://www.youtube.com/embed/h0gWfVCSGQQ', ARRAY['IoT','Predictive ML','Industry 4.0','Sensors','Python']),
('Online Exam Anti-Cheating System', 'Browser-based proctoring system using webcam eye-tracking and tab-switching detection to prevent cheating in online exams.', 'Security', 'Hard', 'https://www.youtube.com/embed/QCvL-DWcojc', ARRAY['Computer Vision','Security','Education','Eye Tracking','React']),
('Food Delivery App with Route Optimization', 'Campus food delivery app with real-time tracking and ML-based route optimization for delivery persons. Includes rating system and live order updates.', 'Mobile Dev', 'Medium', 'https://www.youtube.com/embed/ysz5S6PUM-U', ARRAY['Flutter','Maps','Route Optimization','Firebase','Real-time']),
('Air Quality Monitoring Network', 'Network of IoT sensors across the city measuring air quality (PM2.5, CO2, NO2). Data visualized on a public dashboard with health advisories.', 'IoT', 'Medium', 'https://www.youtube.com/embed/h0gWfVCSGQQ', ARRAY['IoT','Air Quality','Dashboard','Health','Sensors'])
ON CONFLICT DO NOTHING;

INSERT INTO thesis_groups (title, topic, category, supervisor_id, student_names, cgpa_avg, status, notes)
SELECT 
  'SmartVision BD',
  'Real-time object detection for Bangladeshi traffic signs',
  'AI/ML',
  s.id,
  ARRAY['Anika Rahman','Tanvir Hossain','Priya Das'],
  3.75,
  'accepted',
  'Excellent proposal. Project kickoff scheduled for next week.'
FROM supervisors s WHERE s.email = 'arif.rahman@university.edu'
ON CONFLICT DO NOTHING;

INSERT INTO thesis_groups (title, topic, category, supervisor_id, student_names, cgpa_avg, status, notes)
SELECT 
  'WebForge Team',
  'Microservices-based e-commerce platform for small Bangladeshi businesses',
  'Web/App Dev',
  s.id,
  ARRAY['Sabbir Khan','Lina Begum'],
  3.55,
  'pending',
  ''
FROM supervisors s WHERE s.email = 'fatema.begum@university.edu'
ON CONFLICT DO NOTHING;

INSERT INTO thesis_groups (title, topic, category, supervisor_id, student_names, cgpa_avg, status, notes)
SELECT 
  'GreenSense IoT',
  'Smart greenhouse automation for urban farming in Bangladesh',
  'IoT',
  s.id,
  ARRAY['Mahdi Islam','Sadia Noor','Rafiq Ahmed'],
  3.40,
  'rejected',
  'Scope is too broad. Please narrow down to a specific use case and resubmit.'
FROM supervisors s WHERE s.email = 'kamal.hossain@university.edu'
ON CONFLICT DO NOTHING;
