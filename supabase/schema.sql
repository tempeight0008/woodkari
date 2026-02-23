-- ============================================================
-- Woodkari E-Commerce Schema
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/<id>/sql/new
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────
create type user_role as enum ('customer', 'admin');
create type order_status as enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- ─────────────────────────────────────────────────────────────
-- PROFILES
-- Extends Supabase Auth users (auth.users) with app-level data
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text,
  phone       text,
  avatar_url  text,
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────────────────────────
create table public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  image_url   text,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- PRODUCTS
-- ─────────────────────────────────────────────────────────────
create table public.products (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  slug                text not null unique,
  description         text not null,
  long_description    text,
  price               numeric(10,2) not null check (price >= 0),
  category_id         uuid references public.categories(id) on delete set null,
  images              text[] not null default '{}',     -- array of Cloudinary URLs
  hover_image         text,                              -- Cloudinary URL
  materials           text[] not null default '{}',
  care_instructions   text[] not null default '{}',
  dimensions          jsonb not null default '{}',       -- {length, width, height, unit}
  colors              jsonb not null default '[]',       -- [{name, hex, available}]
  customizable        boolean not null default false,
  craftsman           text,
  made_in             text,
  estimated_delivery  text,
  stock               integer not null default 0 check (stock >= 0),
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

create index products_category_id_idx on public.products(category_id);
create index products_slug_idx on public.products(slug);
create index products_is_active_idx on public.products(is_active);

-- ─────────────────────────────────────────────────────────────
-- ADDRESSES
-- ─────────────────────────────────────────────────────────────
create table public.addresses (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  full_name      text not null,
  phone          text,
  address_line1  text not null,
  address_line2  text,
  city           text not null,
  state          text,
  postal_code    text not null,
  country        text not null default 'Italy',
  is_default     boolean not null default false,
  created_at     timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses(user_id);

-- ─────────────────────────────────────────────────────────────
-- CART ITEMS
-- ─────────────────────────────────────────────────────────────
create table public.cart_items (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  product_id      uuid not null references public.products(id) on delete cascade,
  quantity        integer not null default 1 check (quantity > 0),
  selected_color  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, product_id, selected_color)
);

create trigger cart_items_updated_at
  before update on public.cart_items
  for each row execute procedure public.set_updated_at();

create index cart_items_user_id_idx on public.cart_items(user_id);

-- ─────────────────────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────────────────────
create table public.orders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete restrict,
  status           order_status not null default 'pending',
  subtotal         numeric(10,2) not null,
  shipping_cost    numeric(10,2) not null default 0,
  tax              numeric(10,2) not null default 0,
  total            numeric(10,2) not null,
  shipping_address jsonb not null,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger orders_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);

-- ─────────────────────────────────────────────────────────────
-- ORDER ITEMS
-- Snapshot of product details at time of purchase
-- ─────────────────────────────────────────────────────────────
create table public.order_items (
  id              uuid primary key default uuid_generate_v4(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      uuid not null references public.products(id) on delete restrict,
  product_name    text not null,   -- snapshot at purchase time
  product_image   text,            -- snapshot at purchase time
  quantity        integer not null check (quantity > 0),
  unit_price      numeric(10,2) not null,
  selected_color  text
);

create index order_items_order_id_idx on public.order_items(order_id);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────

-- Profiles
alter table public.profiles enable row level security;
create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles"
  on public.profiles for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Categories — public read, admin write
alter table public.categories enable row level security;
create policy "Anyone can view categories"
  on public.categories for select using (true);
create policy "Admins can manage categories"
  on public.categories for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Products — public read (active only), admin write
alter table public.products enable row level security;
create policy "Anyone can view active products"
  on public.products for select using (is_active = true);
create policy "Admins can manage all products"
  on public.products for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Addresses — users manage their own
alter table public.addresses enable row level security;
create policy "Users can manage their own addresses"
  on public.addresses for all using (auth.uid() = user_id);

-- Cart items — users manage their own
alter table public.cart_items enable row level security;
create policy "Users can manage their own cart"
  on public.cart_items for all using (auth.uid() = user_id);

-- Orders — users view their own, admins view all
alter table public.orders enable row level security;
create policy "Users can view their own orders"
  on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert their own orders"
  on public.orders for insert with check (auth.uid() = user_id);
create policy "Admins can manage all orders"
  on public.orders for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Order items
alter table public.order_items enable row level security;
create policy "Users can view items from their own orders"
  on public.order_items for select using (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );
create policy "Users can insert items into their own orders"
  on public.order_items for insert with check (
    exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
  );
create policy "Admins can manage all order items"
  on public.order_items for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────
-- SEED — Initial Categories
-- ─────────────────────────────────────────────────────────────
insert into public.categories (name, slug, description) values
  ('Dining',      'dining',      'Handcrafted dining tables and chairs'),
  ('Bedroom',     'bedroom',     'Beds, wardrobes and bedroom furniture'),
  ('Living Room', 'living-room', 'Sofas, coffee tables and shelving'),
  ('Storage',     'storage',     'Cabinets and storage solutions'),
  ('Office',      'office',      'Desks and office furniture');
