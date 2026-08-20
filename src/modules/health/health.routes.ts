import { Router } from 'express';
import { checkHealth, checkReady } from './health.controller';

const router = Router();

router.get('/', checkHealth);
router.get('/ready', checkReady);

export default router;
