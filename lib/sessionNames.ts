const TECH_KEYWORDS = {
  learning: ["Learning", "Understanding", "Mastering", "Exploring", "Studying"],
  troubleshooting: ["Debugging", "Fixing", "Resolving", "Diagnosing", "Troubleshooting"],
  architecture: ["Architecture", "Design", "Structure", "Pattern", "System"],
  deployment: ["Deploying", "Scaling", "Configuring", "Setting up", "Managing"],
  security: ["Securing", "Authenticating", "Encrypting", "Protecting", "Hardening"],
  performance: ["Optimizing", "Tuning", "Profiling", "Benchmarking", "Accelerating"],
  database: ["Database", "Storage", "Query", "Schema", "Indexing"],
  api: ["API", "Integration", "Endpoint", "Service", "Protocol"],
  general: ["Working with", "Building", "Implementing", "Creating", "Developing"]
};

const TECH_TOPICS = [
  "Kubernetes", "Docker", "AWS", "React", "Python", "Node.js", "PostgreSQL",
  "Redis", "MongoDB", "GraphQL", "REST API", "Microservices", "CI/CD",
  "Terraform", "Ansible", "Prometheus", "Grafana", "Kafka", "RabbitMQ",
  "JWT Auth", "OAuth", "SSL/TLS", "Load Balancer", "Cache Layer", "CDN",
  "Data Pipeline", "ETL Process", "Message Queue", "Event Stream", "ML Model"
];

/** Generate content-relevant session name based on chat context */
export function generateSessionName(existingNames: string[] = [], context?: string): string {
  const used = new Set(existingNames);

  // Analyze context to determine category and topic
  const contextLower = (context || "").toLowerCase();
  let category = "general";
  let topic = "";

  // Determine category from context
  if (contextLower.match(/\b(learn|explain|understand|teach|what is|how does)\b/)) {
    category = "learning";
  } else if (contextLower.match(/\b(error|bug|fix|broken|not working|debug|troubleshoot|issue)\b/)) {
    category = "troubleshooting";
  } else if (contextLower.match(/\b(architecture|design|pattern|structure|system design)\b/)) {
    category = "architecture";
  } else if (contextLower.match(/\b(deploy|scale|config|setup|infrastructure)\b/)) {
    category = "deployment";
  } else if (contextLower.match(/\b(security|auth|encrypt|ssl|oauth|jwt)\b/)) {
    category = "security";
  } else if (contextLower.match(/\b(performance|optimize|speed|slow|latency)\b/)) {
    category = "performance";
  } else if (contextLower.match(/\b(database|sql|postgres|mongo|redis|query)\b/)) {
    category = "database";
  } else if (contextLower.match(/\b(api|rest|graphql|endpoint|integration)\b/)) {
    category = "api";
  }

  // Find specific topic mentioned in context
  for (const t of TECH_TOPICS) {
    if (contextLower.includes(t.toLowerCase())) {
      topic = t;
      break;
    }
  }

  // Generate name
  const adjectives = TECH_KEYWORDS[category as keyof typeof TECH_KEYWORDS] || TECH_KEYWORDS.general;
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];

  let name: string;
  if (topic) {
    name = `${adjective} ${topic}`;
  } else {
    // Pick a relevant topic based on category
    const relevantTopics = {
      learning: ["React", "Python", "Kubernetes", "AWS", "System Design"],
      troubleshooting: ["Production Issue", "Deployment", "Performance", "Integration", "Database"],
      architecture: ["Microservices", "API Gateway", "Data Flow", "Event System", "Cache Layer"],
      deployment: ["Kubernetes", "Docker", "CI/CD", "Infrastructure", "Cloud Setup"],
      security: ["Authentication", "API Security", "Data Protection", "Access Control", "Encryption"],
      performance: ["Query Optimization", "Cache Strategy", "Load Handling", "Response Time", "Throughput"],
      database: ["Schema Design", "Query Performance", "Data Modeling", "Indexing Strategy", "Replication"],
      api: ["REST Endpoints", "GraphQL Schema", "Service Integration", "Rate Limiting", "Versioning"],
      general: TECH_TOPICS
    };

    const topics = relevantTopics[category as keyof typeof relevantTopics] || TECH_TOPICS;
    topic = topics[Math.floor(Math.random() * topics.length)];
    name = `${adjective} ${topic}`;
  }

  // Ensure uniqueness
  if (!used.has(name)) return name;

  // Fallback with number if duplicate
  for (let i = 2; i <= 10; i++) {
    const numberedName = `${name} ${i}`;
    if (!used.has(numberedName)) return numberedName;
  }

  return `Session ${Math.floor(Math.random() * 9000 + 1000)}`;
}
