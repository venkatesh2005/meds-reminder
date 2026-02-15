# Medication Reminder App

A web application to help patients track their medications and notify caretakers when medications are missed.

## Features

- **User Authentication**: Sign up and login with Supabase Auth
- **Role-based Dashboard**: 
  - **Patient View**: View medications, mark as taken, see adherence calendar
  - **Caretaker View**: Add medications, monitor adherence, configure email alerts
- **Email Notifications**: Automated alerts to caretakers when medications are missed
- **Adherence Tracking**: Daily streak, monthly adherence rate, calendar visualization

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Email**: Resend API
- **Form Validation**: React Hook Form + Zod
- **State Management**: TanStack React Query

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Resend account (for email notifications)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Database Setup

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Users table is handled by Supabase Auth

-- Medications table
CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  reminder_time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medication logs table
CREATE TABLE medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  taken BOOLEAN DEFAULT false,
  taken_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(medication_id, date)
);

-- Caretaker info table
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

-- Enable RLS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE caretaker_info ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own medications" ON medications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own medication logs" ON medication_logs
  FOR ALL USING (medication_id IN (SELECT id FROM medications WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own caretaker info" ON caretaker_info
  FOR ALL USING (auth.uid() = user_id);
```

## Edge Function Setup

1. Set Resend API key in Supabase:
   - Go to Supabase Dashboard → Edge Functions → Secrets
   - Add `RESEND_API_KEY` with your Resend API key

2. Deploy the edge function:
```bash
supabase functions deploy send-reminder
```

3. Set up a cron job to trigger the function (Supabase Dashboard → Database → Extensions → pg_cron):
```sql
SELECT cron.schedule(
  'check-missed-medications',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT net.http_post(
    url := 'https://your-project-ref.supabase.co/functions/v1/send-reminder',
    headers := '{"Authorization": "Bearer your-anon-key", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

## Email Notification Testing

This app uses Resend for email notifications.

### For Evaluators/Testers:

Due to Resend free tier limitations, emails can only be sent to verified addresses. To test:

**Option 1: Use Supabase Edge Function Logs**
1. Go to Supabase Dashboard → Edge Functions → send-reminder → Logs
2. Invoke the function manually or wait for scheduled trigger
3. Check logs to verify the function executes correctly

**Option 2: Update Caretaker Email**
1. Sign up/login to the app
2. Switch to Caretaker view
3. Click Settings → Update email to your Resend account email
4. Save settings
5. Add a medication with a past reminder time
6. Invoke the edge function:
```bash
curl -X POST 'https://cbbzysvxtrknhdglyvtk.supabase.co/functions/v1/send-reminder' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

**Option 3: Check Resend Dashboard**
- View sent emails at https://resend.com/emails
- Check delivery status and email content

### Email Alert Logic:
- Emails are sent when medication is NOT marked as taken AND:
  - Current time > reminder_time + alert_window_hours, OR
  - Current time >= daily_check_time

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main dashboard page
│   ├── login/              # Login page
│   └── signup/             # Signup page
├── components/
│   ├── caretaker/          # Caretaker dashboard components
│   ├── patient/            # Patient dashboard components
│   ├── medication/         # Shared medication components
│   └── ui/                 # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configurations
├── providers/              # React context providers
├── services/               # API service functions
└── types/                  # TypeScript type definitions
supabase/
└── functions/
    └── send-reminder/      # Edge function for email notifications
```

## Usage Flow

1. **User signs up** → Creates account with email/password
2. **Caretaker adds medications** → Name, dosage, reminder time
3. **Patient marks medications** → Click "Take" button when medication is taken
4. **System monitors adherence** → Tracks daily/monthly stats
5. **Email alerts sent** → If medication not taken within configured window

## License

MIT
