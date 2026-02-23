import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In production, this would call gog to fetch from Google Sheet
    // For now, return sample data that can be updated later
    return NextResponse.json({
      success: true,
      data: {
        mrr: '$503K',
        profit: '$127K',
        margin: '25%',
        target: '$150K',
        trending: 'up',
        lastUpdated: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Profit API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profit data'
    }, { status: 500 });
  }
}
