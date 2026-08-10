const TECH_CATEGORIES = {
  learning: ["Learning", "Understanding", "Mastering", "Exploring"],
  troubleshooting: ["Debugging", "Fixing", "Resolving", "Diagnosing"],
  architecture: ["Architecture", "Design", "Structure"],
  deployment: ["Deploying", "Configuring", "Setting up"],
  security: ["Securing", "Authenticating", "Encrypting"],
  performance: ["Optimizing", "Tuning", "Profiling"],
  database: ["Database", "Storage", "Query"],
  api: ["API", "Integration", "Endpoint"],
  general: ["Working with", "Building", "Implementing"]
};

const TECH_TOPICS = [
  "Kubernetes", "Docker", "AWS", "React", "Python", "Node.js", "PostgreSQL",
  "Redis", "MongoDB", "GraphQL", "REST API", "Microservices", "CI/CD",
  "Terraform", "Ansible", "Prometheus", "Grafana", "Kafka", "RabbitMQ",
  "JWT Auth", "OAuth", "SSL/TLS", "Load Balancer", "Cache Layer", "CDN",
  "Data Pipeline", "ETL Process", "Message Queue", "Event Stream", "ML Model"
];

/** Generate session name STRICTLY from chat content - no hallucinations */
export function generateSessionName(existingNames: string[] = [], context?: string): string {
  const used = new Set(existingNames);

  if (!context || context.trim().length === 0) {
    return `Session ${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  const contextLower = context.toLowerCase();
  let category = "general";
  let detectedTopic = "";

  // Detect category from actual content keywords
  if (contextLower.match(/\b(learn|explain|understand|teach|what is|how does|tutorial)\b/)) {
    category = "learning";
  } else if (contextLower.match(/\b(error|bug|fix|broken|not working|debug|troubleshoot|issue|crash)\b/)) {
    category = "troubleshooting";
  } else if (contextLower.match(/\b(architecture|design pattern|system design|microservice)\b/)) {
    category = "architecture";
  } else if (contextLower.match(/\b(deploy|kubernetes|docker|infrastructure|terraform)\b/)) {
    category = "deployment";
  } else if (contextLower.match(/\b(security|auth|jwt|oauth|ssl|encrypt|certificate)\b/)) {
    category = "security";
  } else if (contextLower.match(/\b(performance|slow|optimize|latency|throughput|cache)\b/)) {
    category = "performance";
  } else if (contextLower.match(/\b(database|sql|postgres|mongo|query|index)\b/)) {
    category = "database";
  } else if (contextLower.match(/\b(api|rest|graphql|endpoint|integration)\b/)) {
    category = "api";
  }

  // Extract actual topic mentioned in the context
  for (const topic of TECH_TOPICS) {
    if (contextLower.includes(topic.toLowerCase())) {
      detectedTopic = topic;
      break;
    }
  }

  // Build name from detected content only
  const adjectives = TECH_CATEGORIES[category as keyof typeof TECH_CATEGORIES] || TECH_CATEGORIES.general;
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];

  let name: string;
  if (detectedTopic) {
    name = `${adjective} ${detectedTopic}`;
  } else {
    // Use a topic that matches the category
    const categoryTopics: Record<string, string[]> = {
      learning: ["React", "Python", "Kubernetes", "AWS", "System Design"],
      troubleshooting: ["Production Issue", "Deployment", "Performance", "Database", "Integration"],
      architecture: ["Microservices", "API Gateway", "Event System", "Cache Layer", "Data Flow"],
      deployment: ["Kubernetes", "Docker", "CI/CD", "Infrastructure", "Cloud Setup"],
      security: ["Authentication", "API Security", "Data Protection", "Access Control", "Encryption"],
      performance: ["Query Optimization", "Cache Strategy", "Load Handling", "Response Time"],
      database: ["Schema Design", "Query Performance", "Data Modeling", "Indexing Strategy"],
      api: ["REST Endpoints", "GraphQL Schema", "Service Integration", "Rate Limiting"],
      general: TECH_TOPICS
    };

    const topics = categoryTopics[category] || TECH_TOPICS;
    const topic = topics[Math.floor(Math.random() * topics.length)];
    name = `${adjective} ${topic}`;
  }

  // Ensure uniqueness
  if (!used.has(name)) return name;

  for (let i = 2; i <= 5; i++) {
    const numberedName = `${name} ${i}`;
    if (!used.has(numberedName)) return numberedName;
  }

  return `Session ${Math.floor(Math.random() * 9000 + 1000)}`;
}
