import { NextResponse } from 'next/server';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { crawlMultipleUrls } from '@/lib/crawler';
import axios from 'axios';

function initFirebase() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') as string,
      }),
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      productUrl, docsUrl, competitor1, competitor2, competitor3, 
      userEmail, uid, productCategory, targetAudience, whyCustomersBuy, icpDescription 
    } = body;

    initFirebase();
    const db = getFirestore();

    const reportRef = db.collection('reports').doc();
    await reportRef.set({
      userEmail: userEmail || null,
      uid: uid || null,
      productUrl: productUrl || null,
      docsUrl: docsUrl || null,
      competitor1: competitor1 || null,
      competitor2: competitor2 || null,
      competitor3: competitor3 || null,
      productCategory: productCategory || null,
      targetAudience: targetAudience || null,
      whyCustomersBuy: whyCustomersBuy || null,
      icpDescription: icpDescription || null,
      status: 'Processing',
      createdAt: new Date().toISOString(),
    });

    const urlsToCrawl = [productUrl, docsUrl, competitor1, competitor2].filter(Boolean);
    if (competitor3) urlsToCrawl.push(competitor3);
    
    const crawledContent = await crawlMultipleUrls(urlsToCrawl);

    const systemPrompt = "You are an expert product analyst doing an evidence-based audit. You have been given actual crawled content from a SaaS product's website, docs, and competitors. Your job is to analyze this content and return findings in strict JSON format. Every finding must be based on actual content provided — no assumptions. Return ONLY valid JSON, no markdown, no explanation.";

    const userPrompt = `Analyze this SaaS product based on crawled content below.
Product Category: ${productCategory}
Target Audience: ${targetAudience}
ICP: ${icpDescription}
Why customers buy: ${whyCustomersBuy}
CRAWLED CONTENT:
=== WEBSITE: ${productUrl} ===\n${crawledContent[productUrl] || ''}
=== DOCS: ${docsUrl} ===\n${crawledContent[docsUrl] || ''}
=== COMPETITOR 1: ${competitor1} ===\n${crawledContent[competitor1] || ''}
=== COMPETITOR 2: ${competitor2} ===\n${crawledContent[competitor2] || ''}
${competitor3 ? `=== COMPETITOR 3: ${competitor3} ===\n${crawledContent[competitor3] || ''}` : ''}
Return JSON with these exact keys:
- productSummary: string (what this product does)
- targetUser: string (who it's for)
- valueProposition: string (main benefit)
- whatConfusedMe: string[] (list of confusing things found in actual content)
- positioningGaps: string[] (gaps found comparing website content vs competitor content)
- documentationIssues: string[] (missing or broken things found in docs content)
- competitorStrengths: string[] (what competitors do better based on their content)
- missingTrustSignals: string[] (trust elements absent from website content)
- objections: Array<{topic: string, status: 'Addressed'|'Partial'|'Missing', evidence: string}>
- recommendations: Array<{priority: 'Critical'|'Important'|'Opportunity', issue: string, impact: string, effort: string}>
- onboardingFriction: Array<{step: string, friction: string, recommendation: string}>`;

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const claudeRes = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      },
      {
        headers: {
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      }
    );

    const claudeContent = claudeRes.data.content[0].text;
    
    let parsedData = {};
    try {
      parsedData = JSON.parse(claudeContent);
    } catch (e) {
      const match = claudeContent.match(/```(?:json)?([\s\S]*?)```/);
      if (match && match[1]) {
        parsedData = JSON.parse(match[1].trim());
      } else {
        throw new Error('Failed to parse Claude response as JSON');
      }
    }

    await reportRef.update({
      ...parsedData,
      status: 'Ready',
      completedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, reportId: reportRef.id });

  } catch (error: any) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
