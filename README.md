# Inventory Projects

Internal inventory management application built with Next.js App Router, Better Auth, Drizzle ORM, and Postgres.

## Project Setup

Use `pnpm` for this repository.

1. Install dependencies.

```bash
pnpm install
```

2. Create your local environment file.

```bash
cp .env.example .env
```

3. Update `.env` with real values.

```env
BETTER_AUTH_SECRET=replace-with-a-secure-random-string
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB_NAME
```

4. Make sure your Postgres database exists and that `DATABASE_URL` can connect to it.

5. Push the Drizzle schema to the database.

```bash
pnpm db:push
```

6. Seed the database.

```bash
pnpm db:seed
```

7. Start the development server.

```bash
pnpm dev
```

8. Open `http://localhost:3000` in your browser.

## Daily Workflow

1. Pull the latest changes.
2. Run `pnpm install` if `package.json` or `pnpm-lock.yaml` changed.
3. Run `pnpm dev` for normal development.
4. If you changed database tables, run `pnpm db:push` again.
5. If you need fresh sample data, run `pnpm db:seed`.

## Before Commit

Run these checks before opening a PR or committing significant changes.

1. Check formatting and type errors.

```bash
pnpm check
```

If you only want TypeScript errors:

```bash
pnpm typecheck
```

2. Run a production build.

```bash
pnpm build
```

3. Start the production server to smoke-test runtime behavior.

```bash
pnpm start
```

Then open `http://localhost:3000` and verify there are no runtime errors in the browser or terminal.

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm start
pnpm check
pnpm typecheck
pnpm lint
pnpm format
pnpm db:push
pnpm db:seed
```

## Notes

- Auth uses Better Auth with email/password.
- The app expects a working Postgres connection before auth and seed flows will work.
- `pnpm start` must be run after `pnpm build`.

---

# เวอร์ชันภาษาไทย

โปรเจกต์นี้เป็นระบบจัดการสต๊อกภายใน พัฒนาด้วย Next.js App Router, Better Auth, Drizzle ORM และ Postgres

## การเริ่มต้นโปรเจกต์

โปรเจกต์นี้ใช้ `pnpm` เป็นหลัก

1. ติดตั้ง dependencies

```bash
pnpm install
```

2. สร้างไฟล์ environment สำหรับเครื่องตัวเอง

```bash
cp .env.example .env
```

3. แก้ค่าใน `.env` ให้เป็นค่าจริง

```env
BETTER_AUTH_SECRET=replace-with-a-secure-random-string
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB_NAME
```

4. ตรวจสอบว่า Postgres พร้อมใช้งาน และ `DATABASE_URL` สามารถเชื่อมต่อได้จริง

5. Push schema ของ Drizzle เข้า database

```bash
pnpm db:push
```

6. Seed ข้อมูลเริ่มต้นลง database

```bash
pnpm db:seed
```

7. รัน development server

```bash
pnpm dev
```

8. เปิด `http://localhost:3000` ใน browser

## ขั้นตอนการทำงานประจำวัน

1. ดึง code ล่าสุดจาก repository
2. รัน `pnpm install` ถ้า `package.json` หรือ `pnpm-lock.yaml` มีการเปลี่ยนแปลง
3. รัน `pnpm dev` สำหรับพัฒนาแบบปกติ
4. ถ้ามีการแก้ schema ของ database ให้รัน `pnpm db:push` อีกครั้ง
5. ถ้าต้องการข้อมูลตัวอย่างใหม่ ให้รัน `pnpm db:seed`

## ก่อน Commit

ก่อน commit หรือเปิด PR ควรรันขั้นตอนต่อไปนี้

1. ตรวจ format และ type errors

```bash
pnpm check
```

ถ้าต้องการเช็กเฉพาะ TypeScript errors:

```bash
pnpm typecheck
```

2. รัน production build

```bash
pnpm build
```

3. รัน production server เพื่อตรวจ runtime behavior

```bash
pnpm start
```

จากนั้นเปิด `http://localhost:3000` และตรวจสอบว่าไม่มี error ทั้งใน browser และ terminal

## คำสั่งที่ใช้บ่อย

```bash
pnpm dev
pnpm build
pnpm start
pnpm check
pnpm typecheck
pnpm lint
pnpm format
pnpm db:push
pnpm db:seed
```

## หมายเหตุ

- ระบบ auth ใช้ Better Auth แบบ email/password
- แอปนี้ต้องมีการเชื่อมต่อ Postgres ที่ใช้งานได้จริง ไม่เช่นนั้น auth และ seed จะทำงานไม่ได้
- ต้องรัน `pnpm build` ก่อน `pnpm start`
