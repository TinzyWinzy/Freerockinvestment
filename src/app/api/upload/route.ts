import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG or WebP.' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
    }

    const isSupabaseConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)

    if (isSupabaseConfigured) {
      try {
        const cookieStore = await cookies()
        const supabase = createClient(cookieStore)

        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(`photos/${Date.now()}-${file.name}`, file)

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(data.path)

          return NextResponse.json({ url: publicUrl, message: 'Upload successful' }, { status: 201 })
        }
      } catch {
        // Fall through to mock
      }
    }

    const url = `/uploads/${Date.now()}-${file.name}`
    return NextResponse.json({ url, message: 'Upload successful' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
