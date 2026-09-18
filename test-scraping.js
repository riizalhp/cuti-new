// Test script untuk scraping comprehensive
const { runScrape } = require('./apps/dashboard/lib/job-scraper.ts');
const { syncJobsToDb } = require('./apps/dashboard/lib/job-sync.ts');

async function comprehensiveScraping() {
  console.log('🌐 Starting comprehensive job scraping...\n');

  // Multiple keywords untuk coverage lebih luas
  const keywords = [
    'Staff',
    'Admin',
    'Marketing',
    'Sales',
    'Customer Service',
    'IT',
    'Programmer',
    'Designer',
    'Accounting'
  ];

  let totalScraped = 0;
  let totalCreated = 0;
  let totalUpdated = 0;

  for (const keyword of keywords) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📋 Scraping keyword: "${keyword}"`);
    console.log('='.repeat(60));

    try {
      const startTime = Date.now();

      // Scrape dari semua portal (tanpa specify portals = scrape all default)
      const result = await runScrape({
        keyword,
        location: 'Indonesia'
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`\n✅ Scraped ${result.jobs.length} jobs in ${duration}s`);

      // Show portal breakdown
      console.log('\n📊 Portal breakdown:');
      const portalStats = Object.entries(result.stats)
        .filter(([_, stat]) => stat.count > 0)
        .sort((a, b) => b[1].count - a[1].count);

      for (const [portal, stat] of portalStats) {
        console.log(`  ✓ ${portal}: ${stat.count} jobs`);
      }

      if (result.jobs.length === 0) {
        console.log('  ⚠️  No jobs found for this keyword');
        continue;
      }

      // Sync ke database
      console.log('\n💾 Syncing to database...');
      const sync = await syncJobsToDb(result.jobs);

      console.log(`  ✓ Created: ${sync.created}`);
      console.log(`  ✓ Updated: ${sync.updated}`);
      console.log(`  ✓ Deactivated: ${sync.deactivated}`);

      totalScraped += result.jobs.length;
      totalCreated += sync.created;
      totalUpdated += sync.updated;

      // Delay antar keyword untuk avoid overload
      if (keywords.indexOf(keyword) < keywords.length - 1) {
        console.log('\n⏳ Waiting 3s before next keyword...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error(`\n❌ Error scraping "${keyword}":`, error.message);
      console.error('Stack:', error.stack);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 SCRAPING COMPLETED');
  console.log('='.repeat(60));
  console.log(`📊 Final Summary:`);
  console.log(`  - Total scraped: ${totalScraped} jobs`);
  console.log(`  - Created in DB: ${totalCreated} new jobs`);
  console.log(`  - Updated in DB: ${totalUpdated} existing jobs`);
  console.log(`  - Unique companies: ${totalCreated > 0 ? 'Check DB' : '0'}`);
  console.log('='.repeat(60));
}

// Run the scraping
comprehensiveScraping()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
