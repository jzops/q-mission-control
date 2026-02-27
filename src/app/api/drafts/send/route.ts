import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(request: Request) {
  try {
    const { draftId, to, subject, body, threadId } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: to, subject, body'
      }, { status: 400 });
    }

    // Ensure GOG_KEYRING_PASSWORD is set in environment
    if (!process.env.GOG_KEYRING_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'Email sending not configured - missing GOG_KEYRING_PASSWORD environment variable'
      }, { status: 500 });
    }

    const account = process.env.GMAIL_ACCOUNT;
    if (!account) {
      return NextResponse.json({
        success: false,
        error: 'Email sending not configured - missing GMAIL_ACCOUNT environment variable'
      }, { status: 500 });
    }

    // Build arguments array - execFile handles escaping automatically
    const args = [
      'gmail', 'send',
      '--account', account,
      '--to', to,
      '--subject', subject,
      '--body', body,
    ];

    // Use execFile instead of exec to prevent command injection
    // Arguments are passed as array, not string, so no shell escaping needed
    const { stderr } = await execFileAsync('gog', args, {
      timeout: 30000,
      env: process.env,
    });

    // Only treat as error if stderr contains actual error messages
    if (stderr && !stderr.includes('Successfully') && stderr.includes('error')) {
      throw new Error(stderr);
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      draftId,
    });
  } catch (error) {
    // Extract error message for response
    const errMsg = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({
      success: false,
      error: `Failed to send email: ${errMsg}`
    }, { status: 500 });
  }
}
