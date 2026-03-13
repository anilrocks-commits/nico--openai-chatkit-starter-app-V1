import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Authenticates using your Vercel Environment Variable
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, phone, transcript } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'Modern Roofs AI <onboarding@resend.dev>', // Update this once domain is verified
      to: 'sales@modernroofs.com.au',
      subject: `New Lead Qualification: ${name}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5;">
          <h2>New Lead Captured</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <hr />
          <h3>Chat Conversation Transcript:</h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border: 1px solid #eee;">
            <pre style="white-space: pre-wrap;">${transcript}</pre>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Notification Route Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
