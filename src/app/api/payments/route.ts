import { NextRequest } from 'next/server';
import { isValidEGLDAddress, getAccountInfo, getTransactionStatus } from '@/lib/multiversx';
import { ok, err } from '@/lib/response';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, recipientAddress, egldAddress, userId } = body;

    if (!amount || typeof amount !== 'string') return err('Invalid amount');
    if (!isValidEGLDAddress(recipientAddress))  return err('Invalid recipient address');
    if (!isValidEGLDAddress(egldAddress))        return err('Invalid user EGLD address');

    const account = await getAccountInfo(egldAddress);
    if (!account) return err('Could not fetch account info from chain');

    const payment = await prisma.payment.create({
      data: {
        amount,
        recipientAddress,
        userAddress: egldAddress,
        userId:      userId ?? null,
        status:      'pending',
      },
    });

    return ok(
      {
        paymentId:        payment.id,
        amount,
        recipientAddress,
        note: 'Send the exact amount to the recipient address, then call POST /api/payments/verify with the txHash.',
      },
      201,
    );
  } catch (e) {
    console.error('POST /api/payments error:', e);
    return err('Payment initialisation failed', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const paymentId = request.nextUrl.searchParams.get('paymentId');
    const txHash    = request.nextUrl.searchParams.get('txHash');

    if (!paymentId || !txHash) return err('Missing paymentId or txHash');

    const txStatus = await getTransactionStatus(txHash);

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data:  { status: txStatus === 'success' ? 'completed' : 'failed', txHash },
    });

    return ok({ paymentId, txHash, status: payment.status, amount: payment.amount });
  } catch (e) {
    console.error('GET /api/payments error:', e);
    return err('Payment lookup failed', 500);
  }
}
