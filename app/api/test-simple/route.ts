import { NextResponse } from 'next/server'
import { sendTelegramNotification } from '@/lib/telegram'

export async function GET() {
  try {
    const success = await sendTelegramNotification('Simple test message')
    
    return NextResponse.json({ 
      success, 
      botToken: !!process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID
    })
  } catch (error) {
    // Type guard for Error objects
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    return NextResponse.json(
      { 
        error: 'Failed', 
        details: errorMessage 
      },
      { status: 500 }
    )
  }
} 