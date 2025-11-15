const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl: process.env.SONAR_HOST_URL || 'http://localhost:9000',
    token: process.env.SONAR_TOKEN || '',
    options: {
      'sonar.projectKey': 'aiagent-platform',
      'sonar.projectName': 'AI Agent Platform',
      'sonar.projectVersion': '1.0.0',
      'sonar.sources': 'app,components,lib,contexts',
      'sonar.tests': '__tests__',
      'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
      'sonar.exclusions': '**/node_modules/**,**/*.test.ts,**/*.test.tsx,**/dist/**,**/.next/**,**/coverage/**',
      'sonar.sourceEncoding': 'UTF-8',
    },
  },
  () => process.exit()
);
