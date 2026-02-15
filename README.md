# Meds Reminder

A medication tracking app where patients can mark their daily medications and caretakers get notified if they miss one.

**Live Demo:** https://meds-reminder-task.vercel.app

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS
- Supabase (Auth + Database + Edge Functions)
- React Query
- React Hook Form + Zod
- Resend (emails)

## Setup

```bash
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

```bash
npm run dev
```

## Database

Run in Supabase SQL Editor:

```sql
CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  reminder_time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  taken BOOLEAN DEFAULT false,
  taken_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(medication_id, date)
);

CREATE TABLE caretaker_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  alerts_enabled BOOLEAN DEFAULT true,
  alert_window_hours INTEGER DEFAULT 2,
  daily_check_time TEXT DEFAULT '20:00',
  patient_name TEXT DEFAULT 'Patient',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE caretaker_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own medications" ON medications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own medication logs" ON medication_logs
  FOR ALL USING (medication_id IN (SELECT id FROM medications WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own caretaker info" ON caretaker_info
  FOR ALL USING (auth.uid() = user_id);
```

## Features

- Sign up / Login
- Patient view: mark medications as taken, view calendar
- Caretaker view: add/edit/delete medications, view stats
- Email alerts when medication is missed

## Folder Structure

```
src/
├── app/           # pages
├── components/    # UI components
├── hooks/         # React Query hooks
├── services/      # Supabase API calls
├── lib/           # validations, utils
└── types/         # TypeScript types
```
