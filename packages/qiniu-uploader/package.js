Package.describe({
  name: 'qiniu-uploader',
  version: '0.0.1',
  summary: '头像上传',
  git: '',
  documentation: 'README.md'
});

Npm.depends({
  'qiniu': '6.1.8'
});


Package.onUse(function(api) {
  api.versionsFrom('1.1.0.3');
  api.use([
    'templating',
    'meteorhacks:npm@1.4.0'
  ]);

  api.addFiles('server/qiniu-node-sdk.js', 'server');
  api.export('QiniuNodeSDK', 'server');
});

