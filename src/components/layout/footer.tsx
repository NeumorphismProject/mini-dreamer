export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-2">关于我们</h4>
              <p className="text-sm text-muted-foreground">
                抽象吧桌宠致力于为用户提供高度自定义的桌面宠物体验
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">联系方式</h4>
              <p className="text-sm text-muted-foreground">
                如有问题或建议，请联系我们
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">版本信息</h4>
              <p className="text-sm text-muted-foreground">
                当前版本：v1.0.0
              </p>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} 抽象吧桌宠. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              备用版本：v0.9.9 | 官网备案信息
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}