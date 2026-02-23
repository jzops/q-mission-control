import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In production, this would call the calendar tool
    // For now, return sample data
    return NextResponse.json({
      success: true,
      events: [],
      note: 'Calendar OAuth needs refresh',
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch calendar'
    }, { status: 500 });
  }
}
