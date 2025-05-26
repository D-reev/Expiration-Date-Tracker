const { execSync } = require('child_process');
const fs = require('fs');

const deployDir = 'dist';
const remote = 'https://github.com/<your-username>/<your-repo>.git';

try {
  console.log('Creating temporary deployment...');

  // Clean previous .git if exists
  if (fs.existsSync(`${deployDir}/.git`)) {
    fs.rmSync(`${deployDir}/.git`, { recursive: true, force: true });
  }

  // Initialize and push
  execSync(`cd ${deployDir} && git init`, { stdio: 'inherit' });
  execSync(`cd ${deployDir} && git remote add origin ${remote}`, { stdio: 'inherit' });
  execSync(`cd ${deployDir} && git checkout -b gh-pages`, { stdio: 'inherit' });
  execSync(`cd ${deployDir} && git add .`, { stdio: 'inherit' });
  execSync(`cd ${deployDir} && git commit -m "Manual deploy"`, { stdio: 'inherit' });
  execSync(`cd ${deployDir} && git push -f origin gh-pages`, { stdio: 'inherit' });

  console.log('✅ Deployed successfully!');
} catch (err) {
  console.error('❌ Deployment failed:', err.message);
}
