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

    const account = process.env.GMAIL_ACCOUNT || 'joe@leanscale.team';

    // Build arguments array - execFile handles escaping automatically
    const args = [
      'gmail', 'send',
      '--account', account,
      '--to', to,
      '--subject', subject,
      '--body', body,
    ];

    console.log('Sending email via gog...');

    // Use execFile instead of exec to prevent command injection
    // Arguments are passed as array, not string, so no shell escaping needed
    const { stdout, stderr } = await execFileAsync('gog', args, {
      timeout: 30000, // 30 second timeout
      env: process.env, // GOG_KEYRING_PASSWORD already in env
    });

    if (stderr && !stderr.includes('Successfully')) {
      console.error('gog stderr:', stderr);
    }

    console.log('gog stdout:', stdout);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      draftId,
    });
  } catch (error) {
    console.error('Send email error:', error);

    // Check if it's a command execution error
    const errMsg = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({
      success: false,
      error: `Failed to send email: ${errMsg}`
    }, { status: 500 });
  }
}
