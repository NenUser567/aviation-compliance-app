create table if not exists upload_batches (
  id uuid primary key default gen_random_uuid(),
  uploaded_by text,
  total_files integer not null default 0,
  processed_files integer not null default 0,
  failed_files integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  upload_batch_id uuid references upload_batches(id) on delete cascade,
  original_filename text not null,
  mime_type text not null,
  storage_path text not null,
  processing_status text not null default 'uploaded',
  ocr_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists extracted_records (
  id uuid primary key default gen_random_uuid(),
  document_id uuid unique references documents(id) on delete cascade,
  full_name text,
  license_type text,
  license_number text,
  issue_date date,
  expiry_date date,
  medical_expiry_date date,
  nationality text,
  date_of_birth date,
  issuing_authority text,
  document_type text,
  confidence_notes text,
  extraction_status text not null default 'pending',
  reviewer_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists compliance_results (
  id uuid primary key default gen_random_uuid(),
  extracted_record_id uuid unique references extracted_records(id) on delete cascade,
  status text not null,
  reasons jsonb not null default '[]'::jsonb,
  days_to_expiry integer,
  last_evaluated_at timestamptz not null default now()
);