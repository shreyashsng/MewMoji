import fs from 'fs'
import https from 'https'
import path from 'path'

const downloadImage = (url: string, filepath: string) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath))
      } else {
        res.resume()
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`))
      }
    })
  })
}

// Download Vili's image
const imageUrl = 'https://cdn.openart.ai/published/sKMCRtocSQKUMopZfK8Q/_1yT1gQD_ghPD_1024.webp'
const outputPath = path.join(process.cwd(), 'public', 'characters', 'vili.webp')

downloadImage(imageUrl, outputPath)
  .then(console.log)
  .catch(console.error) 