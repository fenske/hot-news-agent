// AI keywords for content filtering
// Copied from lib/services/news/hackernews.ts and extended
export const AI_KEYWORDS = [
  // General AI terms
  "ai",
  "artificial intelligence",
  "machine learning",
  "ml",
  "deep learning",
  "neural",

  // LLMs
  "llm",
  "large language model",
  "language model",
  "gpt",
  "gpt-4",
  "gpt-5",
  "chatgpt",
  "claude",
  "anthropic",
  "gemini",
  "mistral",
  "mixtral",
  "llama",
  "phi",
  "qwen",
  "deepseek",

  // Companies/Research Labs
  "openai",
  "deepmind",
  "hugging face",
  "huggingface",

  // Techniques
  "transformer",
  "attention mechanism",
  "fine-tuning",
  "finetuning",
  "rlhf",
  "reinforcement learning",
  "prompt engineering",
  "prompting",
  "rag",
  "retrieval augmented",
  "embedding",
  "embeddings",
  "vector",
  "diffusion model",

  // Image/Video AI
  "stable diffusion",
  "midjourney",
  "dall-e",
  "dalle",
  "sora",
  "runway",
  "pika",
  "text-to-image",
  "text-to-video",
  "image generation",

  // AI coding
  "copilot",
  "cursor",
  "code generation",
  "ai coding",
  "codeium",
  "tabnine",
  "replit",

  // AI agents
  "ai agent",
  "autonomous agent",
  "agentic",
  "autogen",
  "crewai",
  "langchain",
  "llamaindex",

  // Infrastructure
  "pytorch",
  "tensorflow",
  "jax",
  "vllm",
  "ollama",
  "mlx",

  // Safety & alignment
  "ai safety",
  "alignment",
  "interpretability",
  "agi",
  "artificial general intelligence",

  // NLP
  "nlp",
  "computer vision",
  "generative",
];

// Major AI companies/entities for entity extraction and importance boosting
export const MAJOR_ENTITIES = [
  "openai",
  "anthropic",
  "google",
  "deepmind",
  "meta",
  "microsoft",
  "nvidia",
  "amazon",
  "apple",
  "mistral",
  "huggingface",
  "stability",
  "cohere",
  "xai",
];

// Tag patterns for categorization
export const TAG_PATTERNS: Record<string, string[]> = {
  LLM: ["llm", "gpt", "claude", "gemini", "mistral", "llama", "chatgpt"],
  "Machine Learning": ["machine learning", "ml", "deep learning", "neural"],
  OpenAI: ["openai", "gpt", "chatgpt", "sora"],
  Anthropic: ["anthropic", "claude"],
  Google: ["google", "gemini", "deepmind"],
  "Computer Vision": [
    "computer vision",
    "diffusion",
    "stable diffusion",
    "midjourney",
    "image",
  ],
  NLP: ["nlp", "language model", "transformer"],
  Research: ["paper", "research", "study"],
};
