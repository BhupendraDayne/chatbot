import mongoose from 'mongoose';
import db from './configs/db.js';
import FAQ from './models/FAQ.js';
import { seedFAQ } from './utils/faqData.js';

async function runSeed() {
  try {
    await db();
    await seedFAQ(FAQ);
    console.log('FAQ seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

runSeed();
