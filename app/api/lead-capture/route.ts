import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request from OpenAI
    const body = await request.json();
    
    console.log('[Lead Capture API] Received request:', JSON.stringify(body, null, 2));
    
    // Extract lead data from the function call parameters
    const lead = {
      intent: String(body.intent || ''),
      name: String(body.name || ''),
      email: String(body.email || ''),
      phone: String(body.phone || ''),
      project_location: String(body.project_location || ''),
    };

    console.log('[Lead Capture API] Extracted lead:', lead);

    // Validate required fields
    const required = ['intent', 'name', 'email', 'phone', 'project_location'];
    const missing = required.filter(field => !lead[field as keyof typeof lead]?.trim());
    
    if (missing.length > 0) {
      console.error('[Lead Capture API] Missing fields:', missing);
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missing.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Submit to HubSpot Forms API
    const portalId = '21015693';
    const formGuid = '9745d93e-8095-4a93-9d56-1d79b33225a8';
    const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;

    // Split name into first and last
    const nameParts = lead.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const hubspotPayload = {
      fields: [
        {
          name: 'firstname',
          value: firstName,
        },
        {
          name: 'lastname',
          value: lastName,
        },
        {
          name: 'email',
          value: lead.email,
        },
        {
          name: 'phone',
          value: lead.phone,
        },
        {
          name: 'message',
          value: `Intent: ${lead.intent}\n\nProject Location: ${lead.project_location}\n\nSource: AI Chat Assistant`,
        },
      ],
      context: {
        pageUri: 'https://modernroofs.com.au/chat',
        pageName: 'AI Chat Lead Capture',
      },
    };

    console.log('[Lead Capture API] Submitting to HubSpot:', hubspotUrl);

    const hubspotResponse = await fetch(hubspotUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hubspotPayload),
    });

    const hubspotData = await hubspotResponse.json();

    if (!hubspotResponse.ok) {
      console.error('[Lead Capture API] HubSpot error:', {
        status: hubspotResponse.status,
        data: hubspotData,
      });
      return NextResponse.json(
        { 
          success: false, 
          error: `HubSpot submission failed: ${JSON.stringify(hubspotData)}` 
        },
        { status: 500 }
      );
    }

    console.log('[Lead Capture API] HubSpot success:', hubspotData);

    // Return success to OpenAI
    return NextResponse.json({
      success: true,
      message: `Thank you ${lead.name}! Your information has been submitted. We'll contact you at ${lead.email} soon.`,
      hubspot_contact_id: hubspotData.inlineMessage || 'submitted',
    });

  } catch (error) {
    console.error('[Lead Capture API] Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Allow CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
