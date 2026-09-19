export type SaaSReference = {
  name: string;
  slug: string;
  official_url: string;
  description: string;
};

// Manual catalog for proprietary or hosted products used in comparisons.
// Keep this list curated; it must not be populated from open_source_tools.
export const SAAS_REFERENCE: SaaSReference[] = [
  { name: '1Password', slug: '1password', official_url: 'https://1password.com', description: 'Password manager and secrets management platform for individuals and teams.' },
  { name: 'Airtable', slug: 'airtable', official_url: 'https://airtable.com', description: 'Spreadsheet-database hybrid platform for building custom apps and workflows.' },
  { name: 'Algolia', slug: 'algolia', official_url: 'https://algolia.com', description: 'Hosted search-as-a-service API for building fast search experiences.' },
  { name: 'Amplitude', slug: 'amplitude', official_url: 'https://amplitude.com', description: 'Product analytics platform for tracking user behavior and engagement.' },
  { name: 'Auth0', slug: 'auth0', official_url: 'https://auth0.com', description: 'Identity and access management platform owned by Okta.' },
  { name: 'AWS S3', slug: 'aws-s3', official_url: 'https://aws.amazon.com/s3', description: "Amazon's object storage service for scalable cloud storage." },
  { name: 'Buffer', slug: 'buffer', official_url: 'https://buffer.com', description: 'Social media scheduling and management platform.' },
  { name: 'Calendly', slug: 'calendly', official_url: 'https://calendly.com', description: 'Scheduling platform for booking meetings and appointments.' },
  { name: 'Clerk', slug: 'clerk', official_url: 'https://clerk.com', description: 'Hosted user authentication and management platform for web apps.' },
  { name: 'Confluence', slug: 'confluence', official_url: 'https://www.atlassian.com/software/confluence', description: "Atlassian's team workspace and documentation platform." },
  { name: 'Datadog', slug: 'datadog', official_url: 'https://www.datadoghq.com', description: 'Cloud monitoring and observability platform.' },
  { name: 'Figma', slug: 'figma', official_url: 'https://figma.com', description: 'Collaborative interface design and prototyping tool.' },
  { name: 'Firebase', slug: 'firebase', official_url: 'https://firebase.google.com', description: "Google's mobile and web application backend-as-a-service platform." },
  { name: 'GitHub', slug: 'github', official_url: 'https://github.com', description: 'Microsoft-owned code hosting and collaboration platform.' },
  { name: 'GitHub Actions', slug: 'github-actions', official_url: 'https://github.com/features/actions', description: "GitHub's built-in CI/CD automation feature." },
  { name: 'Google Analytics', slug: 'google-analytics', official_url: 'https://analytics.google.com', description: "Google's web analytics service." },
  { name: 'Google Drive', slug: 'google-drive', official_url: 'https://drive.google.com', description: "Google's cloud file storage and synchronization service." },
  { name: 'Google Photos', slug: 'google-photos', official_url: 'https://photos.google.com', description: "Google's photo and video storage and sharing service." },
  { name: 'HashiCorp Vault', slug: 'hashicorp-vault', official_url: 'https://www.vaultproject.io', description: 'Secrets management tool, source-available under BSL since 2023 (not OSI open source).' },
  { name: 'Heroku', slug: 'heroku', official_url: 'https://www.heroku.com', description: 'Salesforce-owned platform-as-a-service for deploying applications.' },
  { name: 'Intercom', slug: 'intercom', official_url: 'https://www.intercom.com', description: 'Customer messaging and support platform.' },
  { name: 'Jira', slug: 'jira', official_url: 'https://www.atlassian.com/software/jira', description: "Atlassian's issue tracking and project management tool." },
  { name: 'Linear', slug: 'linear', official_url: 'https://linear.app', description: 'Proprietary issue tracking and project management tool for software teams.' },
  { name: 'Make', slug: 'make', official_url: 'https://www.make.com', description: 'Proprietary visual workflow automation platform (formerly Integromat).' },
  { name: 'Mixpanel', slug: 'mixpanel', official_url: 'https://mixpanel.com', description: 'Product analytics platform for tracking user events.' },
  { name: 'MongoDB', slug: 'mongodb', official_url: 'https://www.mongodb.com', description: 'Document database, source-available under SSPL since 2018 (not OSI open source).' },
  { name: 'Notion', slug: 'notion', official_url: 'https://notion.so', description: 'All-in-one workspace for notes, docs, and project management.' },
  { name: 'Pinecone', slug: 'pinecone', official_url: 'https://www.pinecone.io', description: 'Managed vector database service for AI applications.' },
  { name: 'Pingdom', slug: 'pingdom', official_url: 'https://www.pingdom.com', description: 'SolarWinds-owned website uptime and performance monitoring service.' },
  { name: 'PlanetScale', slug: 'planetscale', official_url: 'https://planetscale.com', description: 'Serverless MySQL-compatible database platform.' },
  { name: 'Pocket', slug: 'pocket', official_url: 'https://getpocket.com', description: "Mozilla's read-it-later bookmarking service." },
  { name: 'Railway', slug: 'railway', official_url: 'https://railway.app', description: 'Cloud platform for deploying and hosting applications.' },
  { name: 'Redis', slug: 'redis', official_url: 'https://redis.io', description: 'In-memory data store, source-available under RSAL/SSPL since 2024 (not OSI open source).' },
  { name: 'Render', slug: 'render', official_url: 'https://render.com', description: 'Cloud platform for hosting web services, static sites, and databases.' },
  { name: 'Retool', slug: 'retool', official_url: 'https://retool.com', description: 'Proprietary low-code platform for building internal tools.' },
  { name: 'Salesforce', slug: 'salesforce', official_url: 'https://www.salesforce.com', description: 'Proprietary customer relationship management (CRM) platform.' },
  { name: 'Slack', slug: 'slack', official_url: 'https://slack.com', description: 'Salesforce-owned team messaging and collaboration platform.' },
  { name: 'Tailscale', slug: 'tailscale', official_url: 'https://tailscale.com', description: 'Managed mesh VPN service built on WireGuard, with a proprietary control plane.' },
  { name: 'Tally', slug: 'tally', official_url: 'https://tally.so', description: 'Proprietary online form builder.' },
  { name: 'Terraform', slug: 'terraform', official_url: 'https://www.terraform.io', description: 'Infrastructure-as-code tool, source-available under BSL since 2023 (not OSI open source).' },
  { name: 'Trello', slug: 'trello', official_url: 'https://trello.com', description: 'Atlassian-owned visual task and project management tool.' },
  { name: 'Typeform', slug: 'typeform', official_url: 'https://typeform.com', description: 'Proprietary conversational form and survey builder.' },
  { name: 'Visualping', slug: 'visualping', official_url: 'https://visualping.io', description: 'Proprietary website change-monitoring service.' },
  { name: 'Zapier', slug: 'zapier', official_url: 'https://zapier.com', description: 'Proprietary workflow automation platform connecting apps.' },
];
