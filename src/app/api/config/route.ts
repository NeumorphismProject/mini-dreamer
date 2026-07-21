import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    baiduPanUrl: process.env.BAIDU_PAN_URL || '',
    quarkPanUrl: process.env.QUARK_PAN_URL || '',
  };

  return NextResponse.json(config);
}