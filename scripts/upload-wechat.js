/**
 * 微信小游戏体验版上传脚本
 * 使用 miniprogram-ci 实现命令行自动上传
 *
 * 用法：
 *   npm run upload                    → 自动递增版本上传
 *   npm run upload -- --version 0.2.0 → 指定版本号上传
 *   npm run upload -- --desc "修复战斗bug" → 自定义描述
 */

const ci = require('miniprogram-ci');
const path = require('path');
const fs = require('fs');

// ========== 配置 ==========
const CONFIG = {
  appid: 'wx4445a2b9f1e55785',
  type: 'miniGame',
  projectPath: path.resolve(__dirname, '../build/wechatgame'),
  privateKeyPath: path.resolve(__dirname, '../private.wx.key'),
};

// ========== 版本管理 ==========
const VERSION_FILE = path.resolve(__dirname, '../.upload-version.json');

const getVersionInfo = () => {
  if (fs.existsSync(VERSION_FILE)) {
    return JSON.parse(fs.readFileSync(VERSION_FILE, 'utf-8'));
  }
  return { version: '0.1.0', buildNumber: 0 };
};

const saveVersionInfo = (info) => {
  fs.writeFileSync(VERSION_FILE, JSON.stringify(info, null, 2), 'utf-8');
};

const incrementVersion = (version) => {
  const parts = version.split('.').map(Number);
  parts[2] += 1;
  if (parts[2] >= 100) {
    parts[2] = 0;
    parts[1] += 1;
  }
  if (parts[1] >= 100) {
    parts[1] = 0;
    parts[0] += 1;
  }
  return parts.join('.');
};

// ========== 参数解析 ==========
const parseArgs = () => {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--version' && args[i + 1]) {
      result.version = args[i + 1];
      i++;
    }
    if (args[i] === '--desc' && args[i + 1]) {
      result.desc = args[i + 1];
      i++;
    }
  }
  return result;
};

// ========== 主流程 ==========
const upload = async () => {
  // 1. 检查构建产物
  if (!fs.existsSync(CONFIG.projectPath)) {
    console.error('❌ 构建产物不存在：', CONFIG.projectPath);
    console.error('   请先在 Cocos Creator 中构建微信小游戏：');
    console.error('   项目 → 构建发布 → 平台选"微信小游戏" → 构建');
    process.exit(1);
  }

  // 2. 检查密钥文件
  if (!fs.existsSync(CONFIG.privateKeyPath)) {
    console.error('❌ 密钥文件不存在：', CONFIG.privateKeyPath);
    console.error('   请从微信公众平台下载代码上传密钥，放到项目根目录命名为 private.wx.key');
    process.exit(1);
  }

  // 3. 确定版本号
  const args = parseArgs();
  const versionInfo = getVersionInfo();

  let version;
  if (args.version) {
    version = args.version;
  } else {
    version = incrementVersion(versionInfo.version);
  }

  const buildNumber = versionInfo.buildNumber + 1;
  const desc = args.desc || `自动上传 #${buildNumber} - ${new Date().toLocaleString('zh-CN')}`;

  console.log('');
  console.log('🎲 Dice Hero · 微信小游戏上传');
  console.log('================================');
  console.log(`📦 版本号：${version}`);
  console.log(`📝 描述：${desc}`);
  console.log(`🔑 AppID：${CONFIG.appid}`);
  console.log(`📂 构建目录：${CONFIG.projectPath}`);
  console.log('================================');
  console.log('');

  // 4. 创建项目对象
  const project = new ci.Project({
    appid: CONFIG.appid,
    type: CONFIG.type,
    projectPath: CONFIG.projectPath,
    privateKeyPath: CONFIG.privateKeyPath,
    ignores: ['node_modules/**/*'],
  });

  // 5. 上传
  try {
    console.log('⏳ 正在上传...');
    const uploadResult = await ci.upload({
      project,
      version,
      desc,
      setting: {
        es6: true,
        es7: true,
        minify: true,
        autoPrefixWXSS: false,
        minifyWXML: true,
      },
      onProgressUpdate: (task) => {
        if (task._msg) {
          console.log(`   ${task._msg}`);
        }
      },
    });

    // 6. 保存版本信息
    saveVersionInfo({ version, buildNumber });

    console.log('');
    console.log('✅ 上传成功！');
    console.log('================================');
    console.log(`📱 版本：${version}`);
    console.log(`🔢 构建号：#${buildNumber}`);
    console.log('');
    console.log('👉 下一步：');
    console.log('   1. 打开微信，搜索你的小游戏');
    console.log('   2. 或在微信公众平台 → 管理 → 版本管理 → 设为体验版');
    console.log('   3. 体验版二维码固定不变，收藏一次即可');
    console.log('================================');

    if (uploadResult) {
      console.log('');
      console.log('📊 上传详情：', JSON.stringify(uploadResult, null, 2));
    }
  } catch (error) {
    console.error('');
    console.error('❌ 上传失败！');
    console.error('================================');
    console.error('错误信息：', error.message || error);

    if (String(error).includes('invalid ip')) {
      console.error('');
      console.error('💡 IP 白名单问题：');
      console.error('   请到微信公众平台 → 开发 → 开发设置 → 关闭 IP 白名单');
    }

    if (String(error).includes('permission denied') || String(error).includes('privatekey')) {
      console.error('');
      console.error('💡 密钥问题：');
      console.error('   请重新下载代码上传密钥，确保文件完整');
    }

    process.exit(1);
  }
};

upload();
