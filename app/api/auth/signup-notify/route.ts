import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { user, event } = await request.json()
    
    // Only proceed if this is a new signup
    if (!user || event !== 'SIGNED_UP') {
      return NextResponse.json({ success: true }) // Silent success for non-signup events
    }

    const message = `
🆕 <b>New User Signup</b>

👤 <b>Name:</b> ${user.user_metadata?.full_name || 'N/A'}
📧 <b>Email:</b> ${user.email}
🆔 <b>User ID:</b> <code>${user.id}</code>
⏰ <b>Signup Time:</b> ${new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})}
`

    await sendTelegramNotification(message)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Signup notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
} 