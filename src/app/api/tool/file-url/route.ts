import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL;
const API_TOKEN = process.env.API_TOKEN;

export async function GET(request: NextRequest) {
  if (!API_BASE_URL || !API_TOKEN) {
    return NextResponse.json(
      { error: 'API 配置缺失，请检查环境变量' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const storageKey = searchParams.get('storage_key') || '';

  if (!storageKey) {
    return NextResponse.json(
      { error: '缺少 storage_key 参数' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_tool_file_url',
        params: {
          storage_key: storageKey,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json(data.result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取工具文件URL失败';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}