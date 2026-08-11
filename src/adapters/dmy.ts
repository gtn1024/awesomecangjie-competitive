import { defineOjAdapter } from './types';

export default defineOjAdapter({
  id: 'dmy',
  displayName: '代码源',
  normalizeId: (raw) => raw.trim(),
  validateId: (id) => /^\d+$/.test(id),
  problemUrl: (id) => `https://bs.daimayuan.top/p/${id}`,
});
