import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // These should be in environment variables ideally
    // User needs to provide their GitHub username/org
    const GITHUB_USER = 'midnight-inc'; // Updated per user request
    const GITHUB_REPO = 'Parsomen'; // Default from project name

    // Fallback if env vars exist
    const owner = process.env.GITHUB_OWNER || GITHUB_USER;
    const repo = process.env.GITHUB_REPO || GITHUB_REPO;

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                // Add token if repo is private: 'Authorization': `token ${process.env.GITHUB_TOKEN}`
            },
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!response.ok) {
            throw new Error(`GitHub API Warning: ${response.status}`);
        }

        const data = await response.json();

        // Find the .exe asset
        const asset = data.assets.find(a => a.name.endsWith('.exe'));

        if (asset && asset.browser_download_url) {
            // Redirect to the download URL
            return NextResponse.redirect(asset.browser_download_url);
        } else {
            return NextResponse.json({ error: 'No .exe asset found in latest release' }, { status: 404 });
        }

    } catch (error) {
        console.error('Download redirect error:', error);
        // Fallback or error message
        return NextResponse.json({
            error: 'Failed to fetch latest release',
            details: error.message,
            setup: 'Please verify GITHUB_OWNER and GITHUB_REPO environment variables.'
        }, { status: 500 });
    }
}
