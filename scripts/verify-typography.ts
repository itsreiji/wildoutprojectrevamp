import { execSync } from 'child_process';
import fs from 'fs';

const SRC_DIR = 'src';
const CSS_FILE = 'src/index.css';

function checkHardcodedFontFamily() {
  console.log('Checking for hardcoded font-family declarations...');
  try {
    const output = execSync(`grep -r "font-family:" ${SRC_DIR} --include="*.{tsx,css}" | grep -v "${CSS_FILE}" || true`).toString();
    if (output.trim()) {
      console.error('❌ Found hardcoded font-family declarations:');
      console.error(output);
      return false;
    }
    console.log('✅ No hardcoded font-family declarations found outside index.css.');
    return true;
  } catch (error) {
    console.error('Error checking font-family:', error);
    return false;
  }
}

function checkArbitraryTextSizes() {
  console.log('Checking for arbitrary text sizes (text-[...])...');
  try {
    // Only match text-[digit] or text-[0.8rem] etc. Ignore colors text-[#...]
    const output = execSync(`grep -r "text-\\[[0-9]" ${SRC_DIR} --include="*.tsx" || true`).toString();
    if (output.trim()) {
      console.error('❌ Found arbitrary text sizes:');
      console.error(output);
      return false;
    }
    console.log('✅ No arbitrary text sizes found.');
    return true;
  } catch (error) {
    console.error('Error checking arbitrary text sizes:', error);
    return false;
  }
}

function checkCentralizedVariables() {
  console.log('Checking for centralized font variables in index.css...');
  try {
    const cssContent = fs.readFileSync(CSS_FILE, 'utf8');
    const requiredVars = [
      '--font-sans',
      '--font-mono',
      '--font-weight-light',
      '--font-weight-normal',
      '--font-weight-medium',
      '--font-weight-semibold',
      '--font-weight-bold',
      '--font-weight-black',
      '--text-2xs',
      '--text-xs',
      '--text-sm',
      '--text-base'
    ];

    const missing = requiredVars.filter(v => !cssContent.includes(v));
    if (missing.length > 0) {
      console.error('❌ Missing centralized font variables in index.css:', missing.join(', '));
      return false;
    }
    console.log('✅ All required centralized font variables found in index.css.');
    return true;
  } catch (error) {
    console.error('Error reading index.css:', error);
    return false;
  }
}

function run() {
  console.log('--- Typography Regression Test ---');
  const results = [
    checkHardcodedFontFamily(),
    checkArbitraryTextSizes(),
    checkCentralizedVariables()
  ];

  if (results.every(r => r)) {
    console.log('\n✨ All typography checks passed!');
    process.exit(0);
  } else {
    console.error('\n⚠️ Typography checks failed. Please resolve the issues above.');
    process.exit(1);
  }
}

run();
