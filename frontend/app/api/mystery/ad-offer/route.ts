import { NextResponse } from 'next/server';
import { getServerUser, unauthorizedResponse, errorResponse } from '@/lib/utils/authHelper';
import { getMysteryAdOffers, getMysteryAdWaitSeconds } from '@/lib/utils/mysteryAdOffers';

export async function GET(req: Request) {
  try {
    const user = getServerUser(req);
    if (!user) return unauthorizedResponse();

    const offers = await getMysteryAdOffers();
    const waitSeconds = getMysteryAdWaitSeconds();

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
