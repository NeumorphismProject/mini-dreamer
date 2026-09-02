import type { Metadata } from 'next';

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

export default function SuanqufantangPrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">隐私政策</h1>

        <p className="mb-4 leading-relaxed text-gray-700">
          本应用「速算趣味堂」为<strong className="font-semibold">纯本地离线教育学习工具</strong>，全程无网络联网行为、不联网、不上传、不收集、不泄露任何用户个人隐私信息。
        </p>
        <p className="mb-6 leading-relaxed text-gray-700">
          本隐私政策旨在清晰告知用户本应用的权限使用、数据存储、设备操作范围，保证完全合规、透明、安全。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">一、应用性质说明</h2>
        <ol className="mb-6 list-decimal space-y-2 pl-6 text-gray-700">
          <li>本应用无需联网、不请求任何网络权限，不会通过网络上传、下载任何用户数据。</li>
          <li>本应用不收集、不读取、不存储用户姓名、手机号、头像、位置、通讯录、相机、麦克风等任何个人隐私信息。</li>
          <li>本应用所有练习记录、学习进度数据全部保存在用户设备本地，不会同步至任何外部服务器。</li>
        </ol>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">二、应用权限使用说明</h2>
        <p className="mb-3 text-gray-700">
          本应用<strong className="font-semibold">仅使用本地文件读写权限</strong>，用途唯一：
        </p>
        <ul className="mb-3 list-disc space-y-2 pl-6 text-gray-700">
          <li>支持用户手动导入、导出本地练习存档、学习进度数据；</li>
          <li>全部文件读取、写入操作仅发生在用户本机设备内部；</li>
          <li>无任何数据外传、不存在网络传输行为。</li>
        </ul>
        <p className="mb-6 text-gray-700">
          本应用不会私自读取、修改、上传设备上其他无关文件，权限仅服务于软件存档导入导出功能。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">三、用户数据存储说明</h2>
        <ol className="mb-6 list-decimal space-y-2 pl-6 text-gray-700">
          <li>本应用不采集任何个人身份信息。</li>
          <li>软件生成的练习进度、答题记录，全部仅在设备本地保存，控制权完全属于用户本人。</li>
          <li>用户可自行通过导出存档完成备份，导入存档恢复学习进度，全部操作由用户主动触发。</li>
        </ol>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">四、数据共享与泄露说明</h2>
        <p className="mb-6 text-gray-700">
          本软件完全离线运行，不存在网络通讯，因此不会向任何第三方公司、机构、个人分享、转让、泄露用户相关数据，不存在数据售卖行为。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">五、未成年人保护</h2>
        <p className="mb-6 text-gray-700">
          本软件面向小学生，属于速算乘法数学启蒙教育工具，无广告、无联网、无不良内容。全程不会收集未成年人的任何隐私信息，符合未成年人网络保护相关法规。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">六、用户知情与同意</h2>
        <p className="mb-3 text-gray-700">用户在App内点击【同意】即表示：</p>
        <ul className="mb-3 list-disc space-y-2 pl-6 text-gray-700">
          <li>知晓本软件纯本地离线运行；</li>
          <li>知晓软件仅做本地存档文件读写，不会收集隐私；</li>
          <li>自愿使用本教育学习工具。</li>
        </ul>
        <p className="mb-6 text-gray-700">
          如点击【拒绝】，将无法进入软件使用全部功能。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">七、政策更新</h2>
        <p className="mb-6 text-gray-700">
          本软件没有联网更新机制，如果隐私政策发生调整，会跟随App新版本，在本地启动界面展示最新协议。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">八、联系方式</h2>
        <p className="mb-6 text-gray-700">
          如有疑问，可通过应用内反馈渠道进行咨询。
        </p>

        <div className="mt-10 text-right text-sm text-gray-500">
          <p>本政策最终解释权归本应用所有</p>
          <p>生效日期：2026-08-31</p>
        </div>
      </div>
    </div>
  );
}