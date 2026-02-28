import { NextResponse } from 'next/server';

// Google Sheet ID from the URL
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1YKLlf9KloataJvh2hgv0ugOBFBV3cnxhx8FoOD3For0';
const SHEET_GID = process.env.GOOGLE_SHEET_GID || '0';

// Cache the data for 5 minutes to avoid hammering Google
let cachedData: { data: ProfitData; fetchedAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface ProfitData {
  mrr: string;
  profit: string;
  margin: string;
  target: string;
  trending: 'up' | 'down' | 'flat';
  lastUpdated: string;
}

async function fetchSheetData(): Promise<ProfitData> {
  // Fetch as CSV (requires sheet to be "Anyone with link can view")
  const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

  const response = await fetch(csvUrl, {
    headers: {
      'Accept': 'text/csv',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status}`);
  }

  const csvText = await response.text();
  const rows = csvText.split('\n').map(row =>
    row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
  );

  // Parse the sheet - adjust based on your actual sheet structure
  // Expected format: First column is label, second column is value
  const dataMap: Record<string, string> = {};
  for (const row of rows) {
    if (row.length >= 2) {
      const key = row[0].toLowerCase().replace(/\s+/g, '_');
      dataMap[key] = row[1];
    }
  }

  // Extract values (adjust field names to match your sheet)
  const mrr = dataMap['mrr'] || dataMap['monthly_recurring_revenue'] || '$0';
  const profit = dataMap['profit'] || dataMap['net_profit'] || dataMap['q1_profit'] || '$0';
  const target = dataMap['target'] || dataMap['profit_target'] || '$150K';
  const prevProfit = dataMap['prev_profit'] || dataMap['previous_profit'];

  // Calculate margin (profit/target as percentage)
  const profitNum = parseFloat(profit.replace(/[$,K]/g, '')) * (profit.includes('K') ? 1000 : 1);
  const targetNum = parseFloat(target.replace(/[$,K]/g, '')) * (target.includes('K') ? 1000 : 1);
  const marginPct = targetNum > 0 ? Math.round((profitNum / targetNum) * 100) : 0;

  // Determine trend
  let trending: 'up' | 'down' | 'flat' = 'flat';
  if (prevProfit) {
    const prevNum = parseFloat(prevProfit.replace(/[$,K]/g, '')) * (prevProfit.includes('K') ? 1000 : 1);
    if (profitNum > prevNum) trending = 'up';
    else if (profitNum < prevNum) trending = 'down';
  }

  return {
    mrr,
    profit,
    margin: `${marginPct}%`,
    target,
    trending,
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    // Check cache
    if (cachedData && (Date.now() - cachedData.fetchedAt) < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        cached: true,
        data: cachedData.data,
      });
    }

    // Fetch fresh data
    const data = await fetchSheetData();

    // Update cache
    cachedData = { data, fetchedAt: Date.now() };

    return NextResponse.json({
      success: true,
      cached: false,
      data,
    });
  } catch (error) {
    // If fetch fails but we have cached data, return it
    if (cachedData) {
      return NextResponse.json({
        success: true,
        cached: true,
        stale: true,
        data: cachedData.data,
      });
    }

    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: `Failed to fetch profit data: ${errMsg}`,
      hint: 'Ensure the Google Sheet is set to "Anyone with the link can view"',
    }, { status: 500 });
  }
}
