import { productControllerSuite } from './ProductController.test.js';
import { brandControllerSuite } from './BrandController.test.js';
import { userControllerSuite } from './UserController.test.js';

async function main() {
  await productControllerSuite();
  await brandControllerSuite();
  await userControllerSuite();
}

main().catch((e) => { console.error(e); process.exit(1); });

