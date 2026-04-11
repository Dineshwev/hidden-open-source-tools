import { NextResponse } from 'next/server';
import { errorResponse } from '@/lib/utils/authHelper';
import { getMysteryAdOffers, getMysteryAdWaitSeconds } from '@/lib/utils/mysteryAdOffers';
import { isMobileUserAgent } from '@/lib/utils/device';

export async function GET(req: Request) {
  try {
    const waitSeconds = getMysteryAdWaitSeconds();
    const userAgent = req.headers.get('user-agent');

    if (isMobileUserAgent(userAgent)) {
      return NextResponse.json(
        {
          data: {
            offers: [],
            waitSeconds,
            message: 'Mobile devices use the Monetag ad experience instead of Adsterra smartlinks.'
          }
        },
        { status: 200 }
      );
    }

    const offers = await getMysteryAdOffers();

    return NextResponse.json(
      {
        data: {
          offers,
          waitSeconds,
          message:
            offers.length === 0
              ? 'No Adsterra smartlinks are configured right now. Set NEXT_PUBLIC_ADSTERRA_SMARTLINK_URLS with public https URLs.'
              : undefined
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorResponse(error);
  }
}
