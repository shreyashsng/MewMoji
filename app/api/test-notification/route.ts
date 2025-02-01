import { NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/lib/telegram'

export async function GET() {
  try {
    // Log the environment variables
    console.log('Environment check:', {
      botTokenExists: !!process.env.TELEGRAM_BOT_TOKEN,
      chatIdExists: !!process.env.TELEGRAM_CHAT_ID,
    })

    const testMessage = `
🧪 <b>Test Notification</b>

This is a test message to verify the Telegram notification system is working correctly.

⏰ <b>Time:</b> ${new Date().toISOString()}
`

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    })

    const notificationPromise = sendTelegramNotification(testMessage)
    
    const success = await Promise.race([
      notificationPromise,
      timeoutPromise
    ])

    if (!success) {
      throw new Error('Failed to send notification')
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test notification sent!',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test notification error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test notification',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 