import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPages = [
  '/register',
  '/login',
  '/contact',
  '/',
  '/landingpage',
  '/select-plan',
  '/checkout',
  '/demo'
];

const pacesExactPages = new Set([
  '/about',
  '/blog',
  '/news',
  '/reports',
  '/case-studies',
  '/white-papers',
  '/power-developers',
  '/data-center-developers',
  '/free-modular-report',
  '/free-modular-due-diligence-report',
  '/paces-demo',
  '/careers',
  '/faq',
  '/for-ai',
]);

const pacesPagePrefixes = [
  '/products/',
  '/post/',
  '/news/',
  '/reports/',
  '/case-study/',
  '/white-papers/',
  '/webinar-',
  '/terms-and-conditions',
  '/privacy-policy',
];

function isPacesMirrorPage(path: string) {
  return pacesExactPages.has(path) || pacesPagePrefixes.some((prefix) => path.startsWith(prefix));
}


// Add story-related paths that need ownership verification
const storyProtectedPaths = [
  '/chapter-editing',
  '/context-dashboard',
  '/generate-story-points',
  '/characters',
  '/chapter-selection'
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path === '/privacy') {
    return NextResponse.redirect(new URL('/privacy-policy', request.url))
  }

  if (path === '/post/tomorrows-grid-today-paces-launches-automated-off-cycle-case-updates') {
    return NextResponse.redirect(new URL('/blog', request.url))
  }

  if (isPacesMirrorPage(path)) {
    return NextResponse.rewrite(new URL(`/paces-mirror${path}/index.html`, request.url))
  }

  // Skip middleware for public pages and all static assets/images
  if (publicPages.includes(path) || 
      path.startsWith('/_next') || 
      path.includes('/images/') ||
      path.includes('.')) {
    return NextResponse.next()
  }

  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true'
  const username = request.cookies.get('username')?.value

  // Check login status for non-public pages
  if (!isLoggedIn || !username) {
    return NextResponse.redirect(new URL('/landingpage', request.url))
  }

  // Check if current path is a story-protected route
  const isStoryProtectedRoute = storyProtectedPaths.some(protectedPath => 
    path.startsWith(protectedPath)
  )

  if (isStoryProtectedRoute) {
    // Extract storyId from URL
    const storyId = path.split('/')[2]
    
    if (!storyId) {
      console.error('No storyId found in URL')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify-story-ownership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          storyId
        })
      })

      if (!response.ok) {
        console.error(`Story ownership verification failed for user ${username}, story ${storyId}`)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      console.error('Error verifying story ownership:', error)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (e.g. /images, /fonts, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
} 


// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export async function middleware(request: NextRequest) {}
