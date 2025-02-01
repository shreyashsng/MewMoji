const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID as string

export async function sendTelegramNotification(message: string) {
  try {
    // Validate environment variables
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is not configured')
    }
    if (!TELEGRAM_CHAT_ID) {
      throw new Error('TELEGRAM_CHAT_ID is not configured')
    }

    console.log('Sending Telegram notification:', {
      botTokenPrefix: TELEGRAM_BOT_TOKEN.slice(0, 5) + '...',
      chatId: TELEGRAM_CHAT_ID,
      messagePreview: message.slice(0, 50) + '...'
    })

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    console.log('Request URL:', url)

    const body = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    }
    console.log('Request body:', body)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    console.log('Telegram API response:', data)
    
    if (!response.ok) {
      throw new Error(`Telegram API Error: ${data.description || 'Unknown error'}`)
    }

    return true
  } catch (error) {
    console.error('Telegram notification error details:', error)
    return false
  }
} 