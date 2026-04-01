import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  dojoSidebar: [
    { type: 'doc', id: 'intro', label: 'Accueil' },
    {
      type: 'category',
      label: 'Démarrage',
      items: [
        'getting-started/index',
        'getting-started/prerequisites',
        'getting-started/installation',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/index',
        'concepts/signals',
        'concepts/architecture',
        'concepts/collector',
      ],
    },
    {
      type: 'category',
      label: 'DoJo - Étapes',
      items: [
        'dojo/step-00/index',
        'dojo/step-01/index',
        'dojo/step-02/index',
        'dojo/step-03/index',
        'dojo/step-04/index',
        'dojo/step-05/index',
        'dojo/step-06/index',
        'dojo/step-07/index',
        'dojo/step-08/index',
        'dojo/step-09/index',
        'dojo/step-10/index',
        'dojo/step-11/index',
        'dojo/step-12/index',
      ],
    },
    {
      type: 'category',
      label: 'Infrastructure',
      items: [
        'infrastructure/index',
        'infrastructure/docker-compose',
        'infrastructure/collector-config',
        'infrastructure/backends',
      ],
    },
    {
      type: 'category',
      label: 'Références',
      items: [
        'references/index',
        'references/glossary',
        'references/troubleshooting',
        'references/resources',
      ],
    },
  ],
};

export default sidebars;
