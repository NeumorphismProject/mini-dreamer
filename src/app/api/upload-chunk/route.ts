import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// 临时文件存储目录
const TEMP_DIR = '/tmp/audio-uploads';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const file = formData.get('file') as File | null;
    const uploadId = formData.get('uploadId') as string | null;
    const chunkIndex = formData.get('chunkIndex') as string | null;
    const totalChunks = formData.get('totalChunks') as string | null;
    const fileName = formData.get('fileName') as string | null;

    // 参数验证
    if (!file || !uploadId || !chunkIndex || !totalChunks || !fileName) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 创建上传目录
    const uploadDir = path.join(TEMP_DIR, uploadId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 保存切片文件
    const chunkPath = path.join(uploadDir, `chunk_${chunkIndex}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(chunkPath, buffer);

    // 保存元数据
    const metaPath = path.join(uploadDir, 'meta.json');
    const metaData = {
      fileName,
      totalChunks: parseInt(totalChunks, 10),
      uploadedChunks: [parseInt(chunkIndex, 10)],
      createdAt: Date.now(),
    };
    
    // 读取现有元数据或创建新的
    let existingMeta = metaData;
    if (existsSync(metaPath)) {
      const { readFile } = await import('fs/promises');
      const existingData = JSON.parse(await readFile(metaPath, 'utf-8'));
      existingMeta = {
        ...existingData,
        uploadedChunks: [...new Set([...existingData.uploadedChunks, parseInt(chunkIndex, 10)])],
      };
    }
    await writeFile(metaPath, JSON.stringify(existingMeta));

    return NextResponse.json({
      success: true,
      chunkIndex: parseInt(chunkIndex, 10),
    });
  } catch (error) {
    console.error('Upload chunk error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '上传失败' 
      },
      { status: 500 }
    );
  }
}
