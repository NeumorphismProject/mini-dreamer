import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '速算趣味堂 - 用户协议',
  description: '速算趣味堂用户协议 - 纯本地离线教育学习工具',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuanqufantangAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">用户协议</h1>

        <p className="mb-2 font-semibold text-gray-900">生效日期：2026年08月31日</p>

        <p className="mb-4 leading-relaxed text-gray-700">
          欢迎您使用「速算趣味堂」应用软件（以下简称&ldquo;本应用&rdquo;）。
        </p>
        <p className="mb-6 leading-relaxed text-gray-700">
          在使用本应用前，请您认真阅读本《用户协议》及配套《隐私政策》。您下载、安装、打开、使用本应用，即代表您<strong className="font-semibold">已充分阅读、理解并自愿同意本协议全部条款</strong>。如果您不同意任意条款，请立即卸载本应用，停止一切使用行为。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">一、应用服务说明</h2>
        <p className="mb-2 leading-relaxed text-gray-700">
          1. 本应用<strong className="font-semibold">速算趣味堂</strong>是一款<strong className="font-semibold">纯本地离线小学数学速算、九九乘法口诀学习练习工具</strong>。
        </p>
        <p className="mb-2 leading-relaxed text-gray-700">
          2. 本应用<strong className="font-semibold">无任何联网功能、无后台服务器、不上传任何数据、无广告、无充值、无付费功能</strong>。
        </p>
        <p className="mb-2 leading-relaxed text-gray-700">
          3. 本应用所有学习数据、练习记录、闯关进度、存档文件<strong className="font-semibold">仅存储在用户本机设备</strong>，不会上传、同步、外泄至任何外部平台。
        </p>
        <p className="mb-6 leading-relaxed text-gray-700">
          4. 应用唯一设备权限：<strong className="font-semibold">本地文件读写权限</strong>，仅用于用户手动导入、导出学习存档数据，用于个人进度备份与恢复。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">二、用户使用须知</h2>
        <p className="mb-2 leading-relaxed text-gray-700">
          1. 用户承诺：仅将本应用用于<strong className="font-semibold">个人学习、家庭教育、合法日常练习</strong>用途。
        </p>
        <p className="mb-2 leading-relaxed text-gray-700">
          2. 用户禁止：反编译、破解、篡改、二次分发、商用倒卖本应用程序。
        </p>
        <p className="mb-2 leading-relaxed text-gray-700">
          3. 用户禁止：利用本应用从事违法、违规、侵权、不良教育用途。
        </p>
        <p className="mb-6 leading-relaxed text-gray-700">
          4. 用户对自己设备内的存档数据、学习记录<strong className="font-semibold">全权负责</strong>，请自行做好备份保存。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">三、服务与权限说明</h2>
        <p className="mb-2 leading-relaxed text-gray-700">
          1. 本应用<strong className="font-semibold">不收集、不读取、不上传、不共享</strong>用户姓名、手机号、设备信息、位置、相册、通讯录等一切个人隐私信息。
        </p>
        <p className="mb-2 leading-relaxed text-gray-700">
          2. 所有文件读写行为<strong className="font-semibold">仅由用户主动触发</strong>，软件不会后台私自读取、修改、上传用户设备文件。
        </p>
        <p className="mb-6 leading-relaxed text-gray-700">
          3. 本应用全程离线运行，无任何网络请求、无数据传输行为。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">四、未成年人使用说明</h2>
        <p className="mb-2 leading-relaxed text-gray-700">
          1. 本应用专为<strong className="font-semibold">小学生数学启蒙、速算口诀练习</strong>设计，内容健康、无不良信息、无诱导内容。
        </p>
        <p className="mb-6 leading-relaxed text-gray-700">
          2. 未成年人请在监护人陪同与指导下使用本应用，监护人需承担未成年人使用软件的监督责任。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">五、免责声明</h2>
        <p className="mb-2 leading-relaxed text-gray-700">
          1. 因用户<strong className="font-semibold">未自行备份存档、误删文件、设备故障、系统重装</strong>导致的学习数据丢失，开发者不承担任何责任。
        </p>
        <p className="mb-2 leading-relaxed text-gray-700">
          2. 用户违规使用、私自修改系统文件、破解软件造成的设备问题与数据损坏，由用户自行承担全部责任。
        </p>
        <p className="mb-6 leading-relaxed text-gray-700">
          3. 本应用仅作为教育辅助工具，学习效果因人而异，开发者不对学习成果做任何承诺与担保。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">六、协议更新规则</h2>
        <p className="mb-2 leading-relaxed text-gray-700">
          1. 本应用无联网更新机制，<strong className="font-semibold">不会在线弹窗更新协议</strong>。
        </p>
        <p className="mb-6 leading-relaxed text-gray-700">
          2. 若协议内容需要调整，将随应用新版本打包更新，新版本打开将重新展示最新协议，需用户重新同意方可使用。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">七、法律适用</h2>
        <p className="mb-2 leading-relaxed text-gray-700">
          本用户协议的制定、解释、执行、争议解决<strong className="font-semibold">均适用中华人民共和国法律法规</strong>。
        </p>
        <p className="mb-6 leading-relaxed text-gray-700">
          如产生纠纷，双方优先友好协商解决，协商不成可向当地人民法院申请处理。
        </p>

        <h2 className="mb-3 mt-6 text-lg font-semibold text-gray-900">八、最终说明</h2>
        <p className="mb-2 leading-relaxed text-gray-700">您点击【同意】按钮，即表示：</p>
        <p className="mb-1 leading-relaxed text-gray-700">- 已完整阅读并知晓《用户协议》与《隐私政策》</p>
        <p className="mb-1 leading-relaxed text-gray-700">- 完全理解本软件为<strong className="font-semibold">纯本地离线学习工具</strong></p>
        <p className="mb-6 leading-relaxed text-gray-700">- 自愿遵守所有使用条款，合法合规使用本教育工具</p>

        <div className="mt-10 text-right text-sm text-gray-500">
          <p>本协议最终解释权归「速算趣味堂」应用开发者所有</p>
        </div>
      </div>
    </div>
  );
}