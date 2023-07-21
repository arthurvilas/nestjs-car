import { rm } from 'fs/promises';
import { join } from 'path';

// Delete the test db before each test
global.beforeEach(async () => {
  try {
    await rm(join(__dirname, '..', 'test.sqlite'));
  } catch (error) {
    console.log('Test DB already deleted, skipping...');
  }
});
