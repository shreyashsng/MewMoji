import { NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/lib/telegram'

export async function GET() {
  try {
    const testUser = {
      id: 'test-123',
      email: 'test@example.com',
      user_metadata: {
        full_name: 'Test User'
      }
    }

    const message = `
🆕 <b>Test User Signup</b>

👤 <b>Name:</b> ${testUser.user_metadata.full_name}
📧 <b>Email:</b> ${testUser.email}
🆔 <b>User ID:</b> ${testUser.id}
⏰ <b>Signup Time:</b> ${new Date().toISOString()}
`

    const success = await sendTelegramNotification(message)

    if (!success) {
      throw new Error('Failed to send notification')
    }

    return NextResponse.json({ success: true, message: 'Test signup notification sent!' })
  } catch (error) {
    console.error('Test signup notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send test signup notification' },
      { status: 500 }
    )
  }
} 