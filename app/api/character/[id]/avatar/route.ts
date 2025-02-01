import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Get character's image URL from database
    const { data: character, error } = await supabase
      .from('characters')
      .select('id, image_url')
      .eq('id', params.id)
      .single()

    if (error || !character?.image_url) {
      throw new Error('Character or image not found')
    }

    // Get the public URL for the image from the avatars bucket
    const { data: publicUrl } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(character.image_url)

    if (!publicUrl?.publicUrl) {
      throw new Error('Failed to get public URL')
    }

    // Redirect to the public URL
    return new Response(null, {
      status: 307,
      headers: { 
        'Location': publicUrl.publicUrl,
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error('Error fetching avatar:', error)
    // You should create a default.png in your public folder
    return NextResponse.redirect(new URL('/default.png', request.url))
  }
} 