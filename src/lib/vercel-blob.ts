import { put, del } from '@vercel/blob'

const BLOB_FOLDER = 'pfp-stripe-link'

export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  try {
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExtension}`
    const filePath = `${BLOB_FOLDER}/${fileName}`
    
    // Upload to Vercel Blob
    const blob = await put(filePath, file, {
      access: 'public',
    })
    
    return blob.url
  } catch (error) {
    console.error('Error uploading profile image:', error)
    throw new Error('Failed to upload profile image')
  }
}

export async function deleteProfileImage(imageUrl: string): Promise<void> {
  try {
    await del(imageUrl)
  } catch (error) {
    console.error('Error deleting profile image:', error)
    // Don't throw error for delete operations to avoid blocking updates
  }
}

export function getImageUrlFromBlob(imageUrl: string): string {
  // If it's already a full URL, return it
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }
  
  // Otherwise, construct the full URL
  return `https://hiso9xmk1y4nfyzd.public.blob.vercel-storage.com/${imageUrl}`
} 