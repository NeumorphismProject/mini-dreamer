import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL;
const API_TOKEN = process.env.API_TOKEN;

export async function GET() {
  if (!API_BASE_URL || !API_TOKEN) {
    return NextResponse.json(
      { error: 'API 配置缺失，请检查环境变量' },
      { status: 500 }
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
        action: 'get_latest_file',
        params: {},
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    if (!data.result || Object.keys(data.result).length === 0) {
      return NextResponse.json({ error: '暂无可用的下载文件' }, { status: 404 });
    }

    return NextResponse.json(data.result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取下载文件失败';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}