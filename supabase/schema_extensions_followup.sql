-- Run after schema_extensions.sql
-- Email nhắc hạn / lưu email người mượn cho cron

alter table public.loans
  add column if not exists borrower_email text;

alter table public.loans
  add column if not exists due_reminder_sent_at timestamptz;

comment on column public.loans.borrower_email is 'Email lúc mượn (để gửi nhắc/trả; không thay auth.users)';
comment on column public.loans.due_reminder_sent_at is 'Đã gửi email nhắc trước hạn (cron)';
