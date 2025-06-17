/*
  # إنشاء قاعدة البيانات الأولية لنظام إدارة المهام

  1. الجداول الجديدة
    - `profiles` - ملفات تعريف المستخدمين
      - `id` (uuid, primary key, مرتبط بـ auth.users)
      - `full_name` (text)
      - `email` (text, unique)
      - `role` (app_role)
      - `created_at` (timestamp)
    
    - `customers` - العملاء
      - `id` (uuid, primary key)
      - `name` (text)
      - `contract_end_date` (date)
      - `created_at` (timestamp)
    
    - `tasks` - المهام
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `customer_id` (uuid, foreign key)
      - `title` (text)
      - `details` (text)
      - `term` (text)
      - `employee` (text)
      - `is_completed` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - إضافة سياسات للوصول المناسب
    - إنشاء دوال مساعدة للأدوار

  3. الفهارس
    - فهارس للبحث السريع
    - فهارس للعلاقات الخارجية
*/

-- إنشاء نوع البيانات للأدوار
CREATE TYPE app_role AS ENUM ('admin', 'user');

-- إنشاء جدول ملفات التعريف
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text UNIQUE,
  role app_role DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contract_end_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول المهام
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  title text NOT NULL,
  details text NOT NULL,
  term text NOT NULL CHECK (term IN ('قصير', 'طويل')),
  employee text NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- دالة للتحقق من دور المستخدم
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للحصول على دور المستخدم
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS app_role AS $$
BEGIN
  RETURN (
    SELECT role FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- سياسات الأمان للملفات الشخصية
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- سياسات الأمان للعملاء
CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (is_admin());

-- سياسات الأمان للمهام
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create their own tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_customers_contract_end ON customers(contract_end_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_customer_id ON tasks(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة trigger لتحديث updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- إدراج بيانات تجريبية للعملاء
INSERT INTO customers (name, contract_end_date) VALUES
  ('مطعم الرافدين', '2025-07-15'),
  ('شركة النور للتجارة', '2025-05-20'),
  ('مؤسسة الأمل', '2024-12-30'),
  ('مكتب الهندسة المتقدمة', '2025-08-10'),
  ('صيدلية الشفاء', '2024-11-15'),
  ('الشركة العامة للنقل', '2025-09-20'),
  ('مستشفى الحكمة', '2025-06-30'),
  ('معهد التدريب المهني', '2024-10-15')
ON CONFLICT DO NOTHING;