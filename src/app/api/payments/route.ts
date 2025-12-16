import { NextRequest, NextResponse } from 'next/server';
import {
  isValidEGLDAddress,
  getAccountInfo,
  getTransactionStatus,
} from '@/lib/multiversx';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, recipientAddress, egldAddress } = body;

    if (!amount || typeof amount !== 'string') {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 },
      );
    }

    if (!isValidEGLDAddress(recipientAddress)) {
      return NextResponse.json(
        { error: 'Invalid recipient address' },
        { status: 400 },
      );
    }

    if (!isValidEGLDAddress(egldAddress)) {
      return NextResponse.json(
        { error: 'Invalid user EGLD address' },
        { status: 400 },
      );
    }

    const account = await getAccountInfo(egldAddress);
    if (!account) {
      return NextResponse.json(
        { error: 'Could not fetch account info' },
        { status: 400 },
      );
    }

    const payment = await prisma.payment.create({
      data: {
        amount,
        recipientAddress,
        userAddress: egldAddress,
        status: 'pending',
      },
    });

    return NextResponse.json(
      {
        paymentId: payment.id,
        amount,
        recipientAddress,
        txFeePercentage: 0.001,
        totalAmount: (parseFloat(amount) * 1.001).toString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('POST /api/payments error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const paymentId = request.nextUrl.searchParams.get('paymentId');
    const txHash = request.nextUrl.searchParams.get('txHash');

    if (!paymentId || !txHash) {
      return NextResponse.json(
        { error: 'Missing paymentId or txHash' },
        { status: 400 },
      );
    }

    const txStatus = await getTransactionStatus(txHash);

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: txStatus === 'success' ? 'completed' : 'failed' },
    });

    return NextResponse.json({
      paymentId,
      txHash,
      status: payment.status,
      amount: payment.amount,
    });
  } catch (error) {
    console.error('GET /api/payments error:', error);
    return NextResponse.json(
      { error: 'Payment lookup failed' },
      { status: 500 },
    );
  }
}
