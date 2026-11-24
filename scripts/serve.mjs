import { execSync } from 'child_process';
import { homedir } from 'os';
import { join } from 'path';

const certDir = join(homedir(), '.office-addin-dev-certs');
execSync(`npm run build && npx http-server dist -S -C ${join(certDir, 'localhost.crt')} -K ${join(certDir, 'localhost.key')} -p 3000`, { stdio: 'inherit' });