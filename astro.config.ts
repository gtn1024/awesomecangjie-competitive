// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import cangjieGrammar from './src/grammars/cangjie.json';

export default defineConfig({
  site: 'https://competitive.awesomecangjie.com',
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, { throwOnError: false }]],
    shikiConfig: {
      langs: [
        {
          ...cangjieGrammar,
          name: 'cangjie',
          aliases: ['cj'],
        },
      ],
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
