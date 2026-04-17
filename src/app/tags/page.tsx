'use client';

import { useState } from 'react';
import { TagManagementList } from '@/components/tag';
import { tagApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, RotateCcw, Tags } from 'lucide-react';

export default function TagsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOperating, setIsOperating] = useState(false);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  // 清理无关联软删除标签
  const handleCleanup = async () => {
    setIsOperating(true);
    try {
      const result = await tagApi.cleanupDeletedTags();
      toast.success(result.message);
      handleRefresh();
    } catch (error) {
      console.error('Failed to cleanup tags:', error);
      toast.error('清理失败');
    } finally {
      setIsOperating(false);
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Tags className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">标签管理</h1>
        </div>
        <p className="text-muted-foreground">
          管理音频标签，统一组织和分类您的音频素材
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="active" className="gap-2">
              <Badge variant="secondary" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                1
              </Badge>
              正常标签
            </TabsTrigger>
            <TabsTrigger value="deleted" className="gap-2">
              <Trash2 className="h-4 w-4" />
              已删除
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deleted" className="mt-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                刷新
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCleanup}
                disabled={isOperating}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                清理无关联标签
              </Button>
            </div>
          </TabsContent>
        </div>

        <TabsContent value="active" className="mt-0">
          <TagManagementList key={`active-${refreshKey}`} showDeleted={false} />
        </TabsContent>

        <TabsContent value="deleted" className="mt-0">
          <TagManagementList key={`deleted-${refreshKey}`} showDeleted={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
