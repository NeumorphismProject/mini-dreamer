'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GenerateForm } from '@/components/generate';
import { AudioPreview } from '@/components/audio';
import { useGenerateStore } from '@/stores';
import { audioApi } from '@/services/api';
import type { GenerateResponse, AudioItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wand2, Save, Clock, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

function GeneratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { reset, setEditAudio, editAudio } = useGenerateStore();
  const [generatedResult, setGeneratedResult] = useState<GenerateResponse | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const type = searchParams.get('type') as 'sound_effect' | null;
  const editId = searchParams.get('edit');

  // 加载编辑数据
  useEffect(() => {
    const loadEditData = async () => {
      if (!editId) {
        // 清除编辑状态
        setEditAudio(null);
        return;
      }

      setLoadingEdit(true);
      try {
        // 尝试从临时音频获取
        const tempResponse = await audioApi.queryTempAudio({ page: 1, page_size: 100 });
        const tempAudio = tempResponse.list.find((item: AudioItem) => 
          String(item.temp_id) === editId || String(item.id) === editId
        );

        if (tempAudio) {
          setEditAudio(tempAudio);
        } else {
          // 尝试从音效库获取
          const soundResponse = await audioApi.querySoundEffects({ page: 1, page_size: 100 });
          const soundAudio = soundResponse.list.find((item: AudioItem) => 
            String(item.id) === editId
          );

          if (soundAudio) {
            setEditAudio(soundAudio);
          }
        }
      } catch (error) {
        console.error('Failed to load edit data:', error);
      } finally {
        setLoadingEdit(false);
      }
    };

    loadEditData();
  }, [editId, setEditAudio]);

  // 根据 URL 参数重置
  useEffect(() => {
    if (type && !editId) {
      reset();
    }
  }, [type, editId, reset]);

  const handleSuccess = (response: GenerateResponse) => {
    setGeneratedResult(response);
    // 清除编辑状态
    setEditAudio(null);
  };

  const handleSave = () => {
    router.push('/temp-audio');
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-2xl">
      {/* Back link */}
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        返回首页
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {editId && editAudio ? '重新生成' : '音频生成'}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {editId && editAudio 
            ? '修改参数后重新生成音频，将基于新的配置创建新的音频文件'
            : '描述你想要的声音效果，AI 将为您生成独特的音频素材'
          }
        </p>
      </div>

      {/* Loading Edit Data */}
      {loadingEdit && (
        <Card className="mb-8 border-primary/20">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">加载编辑数据中...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Form */}
      {!loadingEdit && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              生成配置
            </CardTitle>
            <CardDescription>
              {editId && editAudio 
                ? '已加载原有音频参数，可修改后重新生成'
                : '选择音频类型、风格，填写描述，开始生成'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GenerateForm
              defaultType={type || 'sound_effect'}
              onSuccess={handleSuccess}
            />
          </CardContent>
        </Card>
      )}

      {/* Generated Result */}
      {generatedResult && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Save className="h-5 w-5" />
              生成成功！
            </CardTitle>
            <CardDescription>
              音频已生成并保存到临时音频区
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AudioPreview audio={generatedResult} />
            <div className="flex gap-3">
              <Button variant="outline" onClick={reset} className="flex-1">
                继续生成
              </Button>
              <Button onClick={handleSave} className="flex-1 gap-2">
                <Clock className="h-4 w-4" />
                查看临时音频
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="container px-4 py-8">加载中...</div>}>
      <GeneratePageContent />
    </Suspense>
  );
}
