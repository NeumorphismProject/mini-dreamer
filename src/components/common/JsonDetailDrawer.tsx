'use client';

import { useMemo } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { formatJsonString } from '@/lib/jsonUtils';
import { Code, FileJson } from 'lucide-react';

interface JsonDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  jsonString: string;
}

export function JsonDetailDrawer({
  open,
  onClose,
  title = 'JSON 详情',
  jsonString,
}: JsonDetailDrawerProps) {
  // 格式化 JSON
  const formattedJson = useMemo(() => {
    return formatJsonString(jsonString, 2);
  }, [jsonString]);

  // 解析 JSON 获取键值信息
  const parsedData = useMemo(() => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  }, [jsonString]);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            {title}
          </SheetTitle>
          <SheetDescription>
            编辑参数详情（只读）
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* 原始 JSON 格式化展示 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Code className="h-4 w-4" />
                格式化数据
              </h4>
              <Badge variant="outline" className="text-xs">
                格式化
              </Badge>
            </div>
            <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-xs font-mono leading-relaxed max-h-[400px] overflow-y-auto">
              <code className="text-foreground">
                {formattedJson}
              </code>
            </pre>
          </div>

          {/* 键值对表格展示（如果是对象） */}
          {parsedData && typeof parsedData === 'object' && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">字段说明</h4>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">字段</th>
                      <th className="px-3 py-2 text-left font-medium">值</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {Object.entries(parsedData).map(([key, value]) => (
                      <tr key={key} className="hover:bg-muted/50">
                        <td className="px-3 py-2 font-mono text-muted-foreground">
                          {key}
                        </td>
                        <td className="px-3 py-2 font-mono break-all">
                          {typeof value === 'object' 
                            ? JSON.stringify(value) 
                            : String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
