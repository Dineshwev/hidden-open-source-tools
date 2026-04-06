import { NextResponse } from 'next/server';
import { getServerUser, unauthorizedResponse, errorResponse } from '@/lib/utils/authHelper';
import { getMysteryAdOffers, getMysteryAdWaitSeconds } from '@/lib/utils/mysteryAdOffers';

export async function GET(req: Request) {
  try {
    const user = getServerUser(req);
    if (!user) return unauthorizedResponse();

    const offers = await getMysteryAdOffers();
    const waitSeconds = getMysteryAdWaitSeconds();

    if (offers.length === 0) {
      return NextResponse.json(
        {
          error: 'No Adsterra smartlink URLs configured. Set NEXT_PUBLIC_ADSTERRA_SMARTLINK_URLS with public https URLs.'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        data: {
          offers,
          waitSeconds
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    return errorResponse(error);
  }
}
