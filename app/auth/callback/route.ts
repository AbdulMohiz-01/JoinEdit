import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    console.log('🔐 Auth callback triggered');

    const requestUrl = new URL(request.url);
    console.log('📍 Request URL:', requestUrl.href);

    // Get the actual host (works with ngrok and localhost)
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto');

    let origin = requestUrl.origin;
    if (forwardedHost && forwardedProto) {
        origin = `${forwardedProto}://${forwardedHost}`;
    }

    console.log('🌐 Origin:', origin);
    console.log('🔀 Forwarded Host:', forwardedHost || 'none');

    const next = requestUrl.searchParams.get("next") ?? "/dashboard";
    console.log('➡️  Next redirect:', next);

    let response = NextResponse.redirect(new URL(next, origin));
    const code = requestUrl.searchParams.get("code");

    console.log('🔑 Authorization code:', code ? 'Present ✅' : 'Missing ❌');

    if (code) {
        console.log('🔄 Exchanging code for session...');

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('❌ Error exchanging code:', error.message);
            console.error('Error details:', error);
            response = NextResponse.redirect(new URL("/login?error=auth_failed", origin));
        } else {
            console.log('✅ Session created successfully');
            console.log('👤 User:', data.user?.email);
            console.log('🎫 Session expires at:', data.session?.expires_at);
        }
    } else {
        console.log('⚠️  No code found, redirecting to login');
        response = NextResponse.redirect(new URL("/login", origin));
    }

    console.log('🏁 Final redirect:', response.headers.get('location'));
    return response;
}



