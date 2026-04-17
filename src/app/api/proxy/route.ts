import { NextRequest, NextResponse } from 'next/server';

// 后端工作流 URL（从环境变量获取）
const WORKFLOW_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.API_TOKEN;

export async function POST(request: NextRequest) {
  if (!WORKFLOW_URL) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: '后端 API 地址未配置',
        },
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // 转发请求到后端工作流，添加 Authorization header
    const response = await fetch(WORKFLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: '代理请求失败',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}
