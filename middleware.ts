import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
    const isApiRoute = req.nextUrl.pathname.startsWith("/api")

    // Redirect authenticated users away from auth pages
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Redirect unauthenticated users to login
    if (!isAuthPage && !isApiRoute && !token) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    // Role-based access control
    if (token) {
      const role = token.role as string
      const pathname = req.nextUrl.pathname

      // Admin routes
      if (pathname.startsWith("/admin") && !["ADMIN", "LAB_MANAGER"].includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

      // Student routes
      if (pathname.startsWith("/student") && role !== "STUDENT") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

      // Professor routes
      if (pathname.startsWith("/professor") && role !== "PROFESSOR") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
        const isApiRoute = req.nextUrl.pathname.startsWith("/api")
        const isPublicPage = req.nextUrl.pathname === "/"

        if (isAuthPage || isApiRoute || isPublicPage) return true
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/student/:path*", 
    "/professor/:path*",
    "/account/:path*",
    "/dashboard"
  ]
}