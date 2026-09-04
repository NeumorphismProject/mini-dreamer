import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    absolute: '速算趣味堂 - 用户协议',
  },
  description: '速算趣味堂用户协议 - 纯本地离线教育学习工具',
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
        <clipPath id="agreement-icon-clip">
          <rect width="96" height="96" fill="white" fillOpacity="0" />
        </clipPath>
      </defs>
      <g clipPath="url(#agreement-icon-clip)">
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

export default function SuanqufantangAgreementPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[860px] px-6 pb-20 pt-8 sm:px-8">
        <AgreementIcon />

        <h1 className="mb-2 mt-8 text-center text-lg font-semibold text-foreground">
          速算趣味堂用户服务协议
        </h1>
        <p className="text-center text-sm text-muted-foreground">
          更新日期：2026年09月04日
        </p>

        <p className="mt-10 break-words italic leading-relaxed text-foreground/80">
          重要提示：请您仔细阅读本协议的全部内容，特别是字体加粗部分。如您对本协议内容及页面提示信息有疑问，请勿进行下一步操作；如您不同意本协议的任意内容，或无法准确理解条款内容，请立即卸载并停止使用本应用。
        </p>

        <SectionTitle>1. 关于我们</SectionTitle>
        <div className="space-y-2.5">
          <P>感谢您选择使用「速算趣味堂」（以下简称&ldquo;本应用&rdquo;）。</P>
          <P>
            本应用是由本应用开发者（以下简称&ldquo;我们&rdquo;）开发、提供与运营的一款教育学习软件。
          </P>
          <P>
            本《用户服务协议》（以下简称&ldquo;本协议&rdquo;）是我们与用户（以下简称&ldquo;您&rdquo;）关于下载、安装、使用本应用服务所订立的有效协议。
          </P>
        </div>

        <SectionTitle>2. 协议范围、目的及确认方式</SectionTitle>
        <div className="space-y-2.5">
          <P>
            本协议以及本应用内展示的
            <Link
              href="/privacy/suanqufantang"
              className="text-primary hover:underline"
            >
              《隐私政策》
            </Link>
            、页面提示、操作指引等（以下合称为&ldquo;本协议&rdquo;）是我们为您提供本应用服务所依据的条款，不可分割，您需同时遵守。
          </P>
          <P>请您仔细阅读本协议的全部内容，特别是字体加粗部分。</P>
          <P>
            <B>
              您下载、安装、打开、使用本应用，即视为您已充分阅读、理解并自愿同意本协议的约束。
            </B>
          </P>
          <P>
            <B>
              如果您不同意本协议的任意内容，或无法准确理解条款内容，请立即卸载本应用，停止一切使用行为，不要进行后续操作。
            </B>
          </P>
        </div>

        <SectionTitle>3. 使用本服务的要求</SectionTitle>
        <div className="space-y-2.5">
          <P>
            <B>
              3.1
              本应用主要面向小学生及家长、教师等用户群体。若您为无民事行为能力人或限制民事行为能力人，请告知您的监护人，在监护人的陪同与指导下阅读本协议，并在取得监护人同意的前提下使用本应用；监护人应承担对未成年人使用本应用的监督、指导责任；
            </B>
          </P>
          <P>
            <B>
              3.2
              您明确声明和保证：您具备足够的法律权利或授权来签署和履行本协议；您对于本协议的签署和履行不会对您须履行的任何其他协议、安排造成冲突或导致违约；
            </B>
          </P>
          <P>
            3.3
            如您所属的国家或地区排除本协议的全部或部分内容，则您应立即停止使用本应用，否则，您继续使用本应用视为您同意承担相关的法律风险或法律责任。
          </P>
        </div>

        <SectionTitle>4. 服务内容</SectionTitle>
        <div className="space-y-2.5">
          <P>
            「速算趣味堂」是一款
            <B>纯本地离线运行的小学数学速算、九九乘法口诀学习练习工具</B>
            ，您可在本机设备上使用速算练习、乘法口诀学习、闯关练习等学习功能。
          </P>
          <P>
            <B>
              本应用无任何联网功能、无后台服务器、无广告、无充值、无付费内容，不收集、不上传、不共享任何用户数据。
            </B>
          </P>
          <P>
            本应用产生的所有学习数据、练习记录、闯关进度、存档文件
            <B>仅存储在您的本机设备中，不会上传、同步或外泄至任何外部平台</B>
            。
          </P>
          <P>
            本应用唯一申请的设备权限为
            <B>本地文件读写权限</B>
            ，仅用于您手动导入、导出学习存档数据，以进行个人学习进度的备份与恢复；所有文件读写行为均由您主动触发，本应用不会在后台私自读取、修改或上传您设备上的文件。
          </P>
        </div>

        <SectionTitle>5. 用户使用规则</SectionTitle>
        <div className="space-y-2.5">
          <P>
            <B>
              5.1
              您应对您在本应用中的所有操作及产生的结果负责。因您自身原因造成存档文件被误删、覆盖、损坏或学习记录丢失的，由此引起的风险和损失由您自行承担，请您注意自行备份重要数据；
            </B>
          </P>
          <P>
            <B>
              5.2
              您在使用本应用的存档导入、导出功能时，请务必仔细核对文件内容与操作路径，确保导入的存档文件来源可靠、数据准确、完整有效；
            </B>
          </P>
          <P>
            <B>
              5.3
              请您结合自身实际情况，合理安排学习时间，适度、健康地使用本应用；
            </B>
          </P>
          <P>
            <B>
              5.4
              您知悉并同意，如因您自身出现操作不当、选择错误等情形，您需自行承担由此受到的损失及后果。
            </B>
          </P>
        </div>

        <SectionTitle>6. 免责声明</SectionTitle>
        <div className="space-y-2.5">
          <P>
            <B>
              本应用为纯本地离线软件，按&ldquo;现状&rdquo;提供服务。在法律允许的范围内，我们对以下情形导致的服务中断、数据丢失或其他损失不承担责任：
            </B>
          </P>
          <P>
            <B>
              （1）因您未自行备份存档、误删文件、设备故障、系统重装、存储空间不足等原因导致学习数据丢失的；
            </B>
          </P>
          <P>
            <B>
              （2）您对本应用进行反编译、破解、篡改，或安装、使用来源不明的修改版本，造成设备问题或数据损坏的；
            </B>
          </P>
          <P>
            <B>
              （3）您的电脑设备、操作系统、硬件、通信线路等出现故障，导致本应用无法正常运行或数据异常的；
            </B>
          </P>
          <P>
            <B>（4）其他我们无法控制或合理预见的情形。</B>
          </P>
          <P>
            本应用仅作为教育辅助工具，学习效果因人而异，
            <B>我们不对任何学习成果做承诺与担保</B>。
          </P>
        </div>

        <SectionTitle>7. 用户禁止性规定</SectionTitle>
        <div className="space-y-2.5">
          <P>
            <B>
              您在使用本应用时必须遵守法律法规，不得利用本应用从事违法违规行为，包括但不限于：
            </B>
          </P>
          <P>
            （1）对本应用进行反编译、破解、篡改、二次打包、二次分发，或商用倒卖本应用程序；
          </P>
          <P>
            （2）发布、传送、传播、存储危害国家安全统一、破坏社会稳定、违反公序良俗、侮辱、诽谤、淫秽、暴力以及任何违反国家法律法规的内容；
          </P>
          <P>（3）发布、传送、传播、存储侵害他人知识产权、商业秘密等合法权利的内容；</P>
          <P>（4）恶意虚构事实、隐瞒真相以误导、欺骗他人；</P>
          <P>（5）其他法律法规禁止的行为。</P>
          <P>
            <B>
              如因您违反本条约定，导致任何第三方损害的，您应独立承担责任；我们因此遭受损失的，您也应当一并赔偿。
            </B>
          </P>
        </div>

        <SectionTitle>8. 对本协议的修订</SectionTitle>
        <div className="space-y-2.5">
          <P>我们有权在必要时修改本协议条款，您可以在本应用的最新版本中查阅相关协议条款。</P>
          <P>
            本应用无联网更新机制，
            <B>不会在线弹窗或远程更新协议</B>
            。更新后的协议条款将随本应用新版本一并打包发布；新版本首次启动时将向您展示最新协议，需您重新阅读并同意后方可继续使用。
          </P>
          <P>
            <B>
              本协议条款变更后，如果您不接受修改后的协议，请立即停止使用本应用；如果您继续访问或使用本应用，即被视为您已接受修改后的协议。
            </B>
          </P>
        </div>

        <SectionTitle>9. 适用法律及管辖</SectionTitle>
        <div className="space-y-2.5">
          <P>
            <B>本协议的订立、执行、解释及争议的解决均适用中华人民共和国法律。</B>
          </P>
          <P>
            在协议履行过程中双方如发生纠纷，应友好协商解决；
            <B>协商不成的，任何一方均可向有管辖权的人民法院提起诉讼</B>。
          </P>
        </div>

        <SectionTitle>10. 联系我们</SectionTitle>
        <div className="space-y-2.5">
          <P>如您对本协议有任何疑问，可通过应用内反馈渠道与我们联系，我们将尽快为您解答。</P>
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          本协议最终解释权归「速算趣味堂」应用开发者所有
        </p>
      </div>
    </div>
  );
}
