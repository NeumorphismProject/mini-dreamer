import { NextRequest, NextResponse } from 'next/server';
import { readFile, unlink, readdir, rmdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// 临时文件存储目录
const TEMP_DIR = '/tmp/audio-uploads';

// 环境变量
const TMPFILE_UPLOAD_URL = process.env.TMPFILE_UPLOAD_URL;
const WORKFLOW_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_TOKEN = process.env.API_TOKEN;

interface TmpFileResponse {
  fileName: string;
  downloadLink: string;
  downloadLinkEncoded: string;
  size: number;
  type: string;
  uploadedTo: string;
}

interface UploadAudioResponse {
  success: boolean;
  data: {
    temp_id: number;
    file_name: string;
    audio_url: string;
    audio_duration: number;
    file_size: number;
    file_format: string;
    style_type: string;
    description: string;
    created_at: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uploadId, fileName, totalChunks } = body;

    // 参数验证
    if (!uploadId || !fileName || !totalChunks) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (!TMPFILE_UPLOAD_URL) {
      return NextResponse.json(
        { success: false, error: '第三方上传服务未配置' },
        { status: 500 }
      );
    }

    if (!WORKFLOW_URL || !API_TOKEN) {
      return NextResponse.json(
        { success: false, error: '后端 API 未配置' },
        { status: 500 }
      );
    }

    const uploadDir = path.join(TEMP_DIR, uploadId);

    // 验证目录存在
    if (!existsSync(uploadDir)) {
      return NextResponse.json(
        { success: false, error: '上传任务不存在或已过期' },
        { status: 404 }
      );
    }

    // 验证所有切片完整性
    const missingChunks: number[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(uploadDir, `chunk_${i}`);
      if (!existsSync(chunkPath)) {
        missingChunks.push(i);
      }
    }

    if (missingChunks.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: '部分切片缺失',
          missingChunks 
        },
        { status: 400 }
      );
    }

    // 合并所有切片
    const chunks: Buffer[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(uploadDir, `chunk_${i}`);
      const chunkData = await readFile(chunkPath);
      chunks.push(chunkData);
    }
    const mergedBuffer = Buffer.concat(chunks);

    // 创建 File 对象用于上传
    const file = new File([mergedBuffer], fileName, {
      type: getMimeType(fileName),
    });

    // 上传到第三方服务
    const formData = new FormData();
    formData.append('file', file);

    const tmpFileResponse = await fetch(TMPFILE_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!tmpFileResponse.ok) {
      const errorText = await tmpFileResponse.text();
      console.error('TmpFile upload failed:', errorText);
      return NextResponse.json(
        { success: false, error: '第三方上传失败' },
        { status: 500 }
      );
    }

    const tmpFileResult: TmpFileResponse = await tmpFileResponse.json();

    // 调用后端 upload_audio 接口
    const uploadAudioResponse = await fetch(WORKFLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        action: 'upload_audio',
        params: {
          audio_url: tmpFileResult.downloadLink,
          audio_type: 'sound_effect',
          style_type: '',
          description: '外部上传的音效',
        },
      }),
    });

    if (!uploadAudioResponse.ok) {
      const errorText = await uploadAudioResponse.text();
      console.error('Upload audio API failed:', errorText);
      return NextResponse.json(
        { success: false, error: '保存音频失败' },
        { status: 500 }
      );
    }

    const uploadAudioResult: UploadAudioResponse = await uploadAudioResponse.json();

    if (!uploadAudioResult.success) {
      return NextResponse.json(
        { success: false, error: '保存音频失败' },
        { status: 500 }
      );
    }

    // 清理临时文件（异步执行，不阻塞响应）
    cleanupUploadDir(uploadDir).catch(console.error);

    // 返回完整信息
    return NextResponse.json({
      success: true,
      data: {
        // 第三方上传结果
        fileName: tmpFileResult.fileName,
        downloadLink: tmpFileResult.downloadLink,
        size: tmpFileResult.size,
        type: tmpFileResult.type,
        
        // 后端返回的音频信息（用于编辑）
        audioInfo: {
          audio_url: uploadAudioResult.data.audio_url,
          file_name: uploadAudioResult.data.file_name,
          audio_duration: uploadAudioResult.data.audio_duration,
          file_format: uploadAudioResult.data.file_format,
          file_size: uploadAudioResult.data.file_size,
          temp_id: uploadAudioResult.data.temp_id,
          style_type: uploadAudioResult.data.style_type,
          description: uploadAudioResult.data.description,
          created_at: uploadAudioResult.data.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Merge and upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '处理失败' 
      },
      { status: 500 }
    );
  }
}

// 根据文件名获取 MIME 类型
function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    aac: 'audio/aac',
    flac: 'audio/flac',
  };
  return mimeTypes[ext || ''] || 'audio/mpeg';
}

// 清理上传目录
async function cleanupUploadDir(uploadDir: string): Promise<void> {
  try {
    if (!existsSync(uploadDir)) return;

    const files = await readdir(uploadDir);
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      await unlink(filePath);
    }
    await rmdir(uploadDir);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}
