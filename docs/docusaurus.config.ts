import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'OpenTelemetry DoJo',
  tagline: "Maîtrisez l'observabilité applicative avec OpenTelemetry",
  favicon: 'img/favicon.svg',

  url: 'https://otel-dojo.dev',
  baseUrl: '/',

  organizationName: 'otel-dojo',
  projectName: 'otel-dojo',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'fr',
    locales: ['fr'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],

  markdown: {
    mermaid: true,
  },

  themeConfig: {
    navbar: {
      title: 'OTel DoJo',
      logo: {
        alt: 'OTel DoJo Logo',
        src: 'img/logo.svg',
      },
      items: [
        { type: 'doc', docId: 'intro', label: 'Accueil', position: 'left' },
        { to: '/getting-started', label: 'Démarrage', position: 'left' },
        { to: '/concepts', label: 'Concepts', position: 'left' },
        { to: '/dojo/step-00', label: 'DoJo', position: 'left' },
        { to: '/infrastructure', label: 'Infra', position: 'left' },
        { to: '/references', label: 'Références', position: 'left' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Ressources',
          items: [
            { label: 'OpenTelemetry Docs', href: 'https://opentelemetry.io/docs/' },
            { label: 'Jaeger', href: 'https://www.jaegertracing.io/' },
            { label: 'Grafana', href: 'https://grafana.com/' },
            { label: 'Prometheus', href: 'https://prometheus.io/' },
          ],
        },
        {
          title: 'Communauté',
          items: [
            { label: 'GitHub', href: 'https://github.com/otel-dojo' },
            { label: 'Discord', href: 'https://discord.gg/opentelemetry' },
            { label: 'Twitter', href: 'https://twitter.com/opentelemetry' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OpenTelemetry DoJo.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'java', 'json', 'yaml', 'bash', 'powershell'],
    },
    mermaid: {
      theme: {
        light: 'neutral',
        dark: 'dark',
      },
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
