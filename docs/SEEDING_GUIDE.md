# Database Seeding Guide

## Overview

The database seeding system creates test data for development and testing, including:
- Test users (all 4 roles)
- Sample animals (3 dogs: Luna, Bella, Max)
- Animal profile photos (primary photos with thumbnails)
- Mating records with ratings
- Tasks (6 types)
- Frozen semen batches

## Quick Start

### 1. Start Development Server

```bash
npm run dev
```

### 2. Run Seeder (in another terminal)

```bash
npm run db:seed
```

The seeder will:
1. Create 4 test users via Better Auth API
2. Query database for breeder user ID
3. Create 3 breeds, 3 sample animals, and 3 profile photos
4. Create matings, tasks, and frozen semen records

## Test Data Created

### Animals
- **Luna** - Border Collie (Female, born 2020-06-15)
- **Bella** - Labrador Retriever (Female, born 2019-03-22)
- **Max** - German Shepherd (Male, born 2018-11-10)

### Matings
- Luna × Max (Planned)
- Bella × Max (Confirmed, with ratings)
- Luna × Max (Resulted in litter, excellent ratings)

### Tasks
- Feeding task for Luna (today, high priority)
- Exercise task for Luna (today)
- Grooming task for Bella (tomorrow)
- Weight check for Max (next week)
- Cleaning task (today)
- Vet visit event for Luna (next week)

### Frozen Semen
- 3 batches from Max
- Various quality ratings (excellent/good)
- Different straw counts and availability

## Sign In After Seeding

```
Email:    breeder@test.com
Password: breeder123
```

Visit: http://localhost:3002/auth/signin

## View All Test Credentials

```bash
npm run db:seed:creds
```

## Seeder Files

```
lib/db/seed/
├── index.ts           # Main orchestrator
├── users.ts           # Test users via Better Auth
├── animals.ts         # Sample animals + breeds
├── matings.ts         # Mating records
├── tasks.ts           # 6 task types
└── frozen-semen.ts    # Semen batches
```

## Notes

- Server must be running before seeding
- Existing users will be skipped (not recreated)
- All data is linked to breeder test user
- Safe to run multiple times
