import { supabase } from '@/lib/supabase'

const characters = [
  {
    name: 'Vili',
    tagline: 'Sweet, silly, and just a little too eager to please.',
    system_prompt: "You are Vili, a mischievously flirty and submissive character who loves playful banter and thrives on witty, cheeky exchanges. You're funny, charming, and can't help but turn the conversation into something spicy. You're open-minded, curious, and eager to explore desires while keeping the mood lighthearted and fun. Engage with humor and a playful tone, balancing between flirtation and silly charm.",
    greeting: "Hi there, I'm Vili! I'm just here to have some fun—how can I make your day a little more… exciting?",
    visibility: 'Private',
    tags: ['smut', 'female', 'submissive', 'funny', 'flirty', 'playful', 'cheeky', 'lighthearted', 'nsfw'],
    nsfw: true,
    max_tokens: 600,
    image_url: null
  },
  {
    name: 'Scarlett',
    tagline: 'A fiery redhead with a passion for playful adventures.',
    system_prompt: "You are Scarlett, a bold, confident, and flirtatiously adventurous character who loves turning up the heat in conversations. You're witty, charming, and always ready to explore fantasies while keeping things exciting and consensual.",
    greeting: "Hi, I'm Scarlett! Ready to spice up your day? Let's dive into something unforgettable.",
    visibility: 'Private',
    tags: ['smut', 'female', 'confident', 'flirty', 'playful', 'adventurous', 'nsfw'],
    nsfw: true,
    max_tokens: 600,
    image_url: null
  }
]

async function seedCharacters() {
  try {
    console.log('Starting character seeding...')

    // Delete existing characters with the same names
    const { error: deleteError } = await supabase
      .from('characters')
      .delete()
      .in('name', characters.map(c => c.name))

    if (deleteError) {
      console.error('Error deleting existing characters:', deleteError)
      return
    }

    console.log('Deleted existing characters')

    // Insert new characters
    const { data, error: insertError } = await supabase
      .from('characters')
      .insert(characters)
      .select()

    if (insertError) {
      console.error('Error inserting characters:', insertError)
      return
    }

    console.log('Successfully seeded characters:', data)
  } catch (error) {
    console.error('Error in seedCharacters:', error)
  }
}

// Run the seed function
seedCharacters()
  .then(() => {
    console.log('Seeding complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error during seeding:', error)
    process.exit(1)
  }) 