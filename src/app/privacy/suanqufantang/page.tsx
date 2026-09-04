import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    absolute: '速算趣味堂 - 隐私政策',
  },
  description: '速算趣味堂隐私政策 - 纯本地离线教育学习工具',
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [],
    shortcut: [],
  },
};

/** 协议文档图标（蓝色强调，随主题色适配暗色模式） */
function AgreementIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      className="mx-auto h-16 w-16 text-primary"
    >
      <defs>
        <clipPath id="privacy-icon-clip">
          <rect width="96" height="96" fill="white" fillOpacity="0" />
        </clipPath>
      </defs>
      <g clipPath="url(#privacy-icon-clip)">
        <path
          d="M74.58 85L23.08 85C21.97 85 21.03 84.6 20.25 83.82C19.47 83.04 19.08 82.1 19.08 81L19.08 15C19.08 13.89 19.47 12.95 20.25 12.17C21.03 11.39 21.97 11 23.08 11L70.58 11C71.68 11 72.62 11.39 73.4 12.17C74.18 12.95 74.58 13.89 74.58 15L74.58 70.5"
          stroke="currentColor"
          strokeOpacity="1"
          strokeWidth="6"
        />
        <path
          d="M74 74L74.25 74C75.35 74 76.29 74.39 77.07 75.17C77.85 75.95 78.25 76.89 78.25 78C78.25 79.1 77.85 80.04 77.07 80.82C76.29 81.6 75.35 82 74.25 82L37.41 82C38.56 79.33 38.56 76.66 37.41 74L74 74ZM74 68L28.43 68C27.62 67.98 26.9 68.24 26.29 68.78C25.68 69.32 25.33 70 25.26 70.81C25.2 71.68 25.47 72.42 26.07 73.05C26.66 73.68 27.39 74 28.26 74L28.68 74C29.85 74.06 30.77 74.56 31.47 75.5C32.46 76.83 32.59 78.24 31.85 79.73C31.11 81.22 29.91 81.98 28.25 82L27.16 82L27.16 84.84C27.17 85.72 27.5 86.47 28.13 87.08C28.76 87.7 29.52 88 30.41 88L74.25 88C74.33 88 74.41 88 74.5 88C75.82 88 77.1 87.74 78.32 87.23C79.55 86.73 80.63 86 81.57 85.07C82.5 84.13 83.23 83.05 83.73 81.82C84.24 80.6 84.5 79.32 84.5 78C84.5 76.67 84.24 75.39 83.73 74.17C83.23 72.94 82.5 71.86 81.57 70.92C80.63 69.99 79.55 69.26 78.32 68.76C77.1 68.25 75.82 68 74.5 68C74.41 67.99 74.33 67.99 74.25 68L74 68Z"
          fill="currentColor"
          fillOpacity="1"
          fillRule="nonzero"
        />
        <path
          d="M30.83 30L62.83 30"
          stroke="currentColor"
          strokeOpacity="1"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M30.83 42.06L62.83 42.06"
          stroke="currentColor"
          strokeOpacity="1"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M30.83 54.12L46.83 54.12"
          stroke="currentColor"
          strokeOpacity="1"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/** 章节标题（对应模板 h5：16px 加粗，上间距 3rem） */
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 mt-12 text-base font-semibold text-foreground">{children}</h2>
  );
}

/** 正文段落（对应模板 p：16px、换行处理、宽松行高） */
function P({ children }: { children: ReactNode }) {
  return (
    <p className="break-words leading-relaxed text-foreground/90">{children}</p>
  );
}

/** 重点加粗内容（对应模板 b 标签） */
function B({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

export default function SuanqufantangPrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[860px] px-6 pb-20 pt-8 sm:px-8">
        <AgreementIcon />

        <h1 className="mb-2 mt-8 text-center text-lg font-semibold text-foreground">
          速算趣味堂隐私政策
        </h1>
        <p className="text-center text-sm text-muted-foreground">
          更新日期：2026年09月04日
        </p>

        <p className="mt-10 break-words italic leading-relaxed text-foreground/80">
          重要提示：请您仔细阅读本隐私政策的全部内容，特别是字体加粗部分。本应用为纯本地离线教育学习工具，如您对本政策内容有任何疑问，请勿进行下一步操作；如您不同意本政策的任意内容，请立即卸载并停止使用本应用。
        </p>

        <SectionTitle>1. 应用性质说明</SectionTitle>
        <div className="space-y-2.5">
          <P>
            「速算趣味堂」（以下简称&ldquo;本应用&rdquo;）是一款
            <B>纯本地离线运行的小学数学速算、九九乘法口诀学习练习工具</B>。
          </P>
          <P>
            <B>
              本应用无需联网、不请求任何网络权限，不会通过网络上传、下载任何用户数据。
            </B>
          </P>
          <P>
            <B>
              本应用不收集、不读取、不存储用户姓名、手机号、头像、位置、通讯录、相机、麦克风等任何个人隐私信息。
            </B>
          </P>
          <P>
            本应用所有练习记录、学习进度数据全部保存在用户设备本地，不会同步至任何外部服务器。
          </P>
        </div>

        <SectionTitle>2. 应用权限使用说明</SectionTitle>
        <div className="space-y-2.5">
          <P>
            本应用<B>仅使用本地文件读写权限</B>，用途唯一：
          </P>
          <P>
            （1）支持用户手动导入、导出本地练习存档、学习进度数据；
          </P>
          <P>（2）全部文件读取、写入操作仅发生在用户本机设备内部；</P>
          <P>（3）无任何数据外传、不存在网络传输行为。</P>
          <P>
            <B>
              本应用不会私自读取、修改、上传设备上其他无关文件，权限仅服务于软件存档导入导出功能。
            </B>
          </P>
        </div>

        <SectionTitle>3. 用户数据存储说明</SectionTitle>
        <div className="space-y-2.5">
          <P>1. 本应用不采集任何个人身份信息。</P>
          <P>
            2.
            软件生成的练习进度、答题记录，全部仅在设备本地保存，<B>控制权完全属于用户本人</B>。
          </P>
          <P>
            3.
            用户可自行通过导出存档完成备份，导入存档恢复学习进度，全部操作由用户主动触发。
          </P>
        </div>

        <SectionTitle>4. 数据共享与泄露说明</SectionTitle>
        <div className="space-y-2.5">
          <P>
            <B>
              本应用完全离线运行，不存在网络通讯，因此不会向任何第三方公司、机构、个人分享、转让、泄露用户相关数据，不存在数据售卖行为。
            </B>
          </P>
        </div>

        <SectionTitle>5. 未成年人保护</SectionTitle>
        <div className="space-y-2.5">
          <P>
            本应用面向小学生，属于速算乘法数学启蒙教育工具，无广告、无联网、无不良内容。
          </P>
          <P>
            <B>
              本应用全程不会收集未成年人的任何隐私信息，符合未成年人网络保护相关法规。
            </B>
          </P>
          <P>
            未成年人请在监护人陪同与指导下使用本应用，监护人应承担对未成年人使用本应用的监督、指导责任。
          </P>
        </div>

        <SectionTitle>6. 用户知情与同意</SectionTitle>
        <div className="space-y-2.5">
          <P>
            本隐私政策与本应用内的
            <Link
              href="/agreement/suanqufantang"
              className="text-primary hover:underline"
            >
              《用户协议》
            </Link>
            共同构成您使用本应用的完整约定，不可分割，您需同时遵守。
          </P>
          <P>用户在应用内点击【同意】即表示：</P>
          <P>（1）知晓本软件纯本地离线运行；</P>
          <P>（2）知晓软件仅做本地存档文件读写，不会收集隐私；</P>
          <P>（3）自愿使用本教育学习工具。</P>
          <P>如点击【拒绝】，将无法进入软件使用全部功能。</P>
        </div>

        <SectionTitle>7. 政策更新</SectionTitle>
        <div className="space-y-2.5">
          <P>
            本应用无联网更新机制，
            <B>不会在线弹窗或远程更新本政策</B>
            。如果隐私政策发生调整，会跟随应用新版本一并打包发布，新版本首次启动时将在本地启动界面展示最新政策，需用户重新阅读并同意后方可继续使用。
          </P>
        </div>

        <SectionTitle>8. 联系我们</SectionTitle>
        <div className="space-y-2.5">
          <P>如您对本政策有任何疑问，可通过应用内反馈渠道与我们联系，我们将尽快为您解答。</P>
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          本政策最终解释权归「速算趣味堂」应用开发者所有
        </p>
      </div>
    </div>
  );
}
