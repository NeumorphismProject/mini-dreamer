import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const fileName = searchParams.get('name');

  if (!url) {
    return NextResponse.json({ error: '缺少下载地址' }, { status: 400 });
  }

  try {
    // 服务端下载文件
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`);
    }

    // 获取文件内容
    const arrayBuffer = await response.arrayBuffer();

    // 返回文件流，设置正确的 Content-Disposition
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName || 'download.exe')}`,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '下载失败';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}