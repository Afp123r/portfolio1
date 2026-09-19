import { NextResponse } from 'next/server';
import content from '../../config/content.json';

export async function GET() {
  const siteUrl = 'https://portfolio1.edgeone.app';
  
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Portfolio - Neoh Wei Jian</title>
    <description>Full Stack Developer specializing in React, Next.js, Python, and Data Science. Building exceptional and accessible digital experiences for the web.</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${content.blog.posts.map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <link>${siteUrl}/#blog</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${post.tags.join(', ')}</category>
    </item>`).join('')}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
