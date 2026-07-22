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
  const page = searchParams.get('page') || '1';
  const pageSize = searchParams.get('page_size') || '10';
  const keyword = searchParams.get('keyword') || '';

  try {
    const response = await fetch(`${API_BASE_URL}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'list_roles',
        params: {
          page: parseInt(page, 10),
          page_size: parseInt(pageSize, 10),
          keyword: keyword,
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
    const errorMessage = error instanceof Error ? error.message : '获取角色列表失败';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}