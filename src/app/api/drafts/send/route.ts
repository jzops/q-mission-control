import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { draftId, to, subject, body, threadId } = await request.json();
    
    if (!to || !subject || !body) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: to, subject, body' 
      }, { status: 400 });
    }

    // Build the gog command
    // Note: In production, ensure gog is properly configured with OAuth
    const account = process.env.GMAIL_ACCOUNT || 'joe@leanscale.team';
    
    // Escape the body for shell
    const escapedBody = body.replace(/'/g, "'\\''");
    const escapedSubject = subject.replace(/'/g, "'\\''");
    
    // If this is a reply (has threadId), use reply-to option
    let command: string;
    if (threadId) {
      // For replies, we'd need the message ID to reply to
      // This is a simplified version - in production, you'd look up the thread
      command = `GOG_KEYRING_PASSWORD=openclaw gog gmail send --account ${account} --to '${to}' --subject '${escapedSubject}' --body '${escapedBody}'`;
    } else {
      command = `GOG_KEYRING_PASSWORD=openclaw gog gmail send --account ${account} --to '${to}' --subject '${escapedSubject}' --body '${escapedBody}'`;
    }
    
    console.log('Sending email via gog...');
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
      env: { ...process.env, GOG_KEYRING_PASSWORD: 'openclaw' }
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
