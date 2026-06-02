import OpenAI from 'openai';

/**
 * Vibe modes for commit messages
 */
const VIBE_PROMPTS: Record<string, string> = {
  professional: `You are a professional commit message generator. Generate a clear, descriptive commit message following Conventional Commits specification.
Format:
- Type: feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert
- Scope (optional): module or area changed
- Description: Clear, concise summary (max 72 chars)
- Body (optional): Detailed explanation if needed

Example:
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh when access token expires.

- Add refresh token storage in secure cookie
- Implement token refresh endpoint
- Add automatic refresh on 401 responses`,

  funny: `You are a funny commit message generator. Generate a humorous but still useful commit message.
Rules:
- Keep it under 72 characters for the subject
- Add a funny but relevant body
- Make developers smile while understanding what changed

Example:
feat(ui): fix the 'works on my machine' bug

Moved the fix from my machine to yours. You're welcome.

- Fixed the CSS alignment that only worked locally
- Added proper viewport meta tag
- Tested on Chrome, Firefox, and Safari (it actually works now)`,

  minimal: `You are a minimal commit message generator. Generate the shortest possible commit message.
Rules:
- Max 50 characters
- No body
- Just the essential change

Example:
fix(auth): resolve token expiry issue`,

  creative: `You are a creative commit message generator. Generate an imaginative commit message.
Rules:
- Use metaphors or analogies
- Be artistic but clear
- Max 72 characters for subject

Example:
feat(search): implement full-text search engine

Built a search engine from scratch - now users can find needles in the haystack.

- Added Elasticsearch integration
- Created search index builder
- Implemented autocomplete suggestions`,

  enterprise: `You are an enterprise commit message generator. Generate a formal, detailed commit message.
Rules:
- Follow Conventional Commits strictly
- Include ticket/reference number if applicable
- Detail affected systems and dependencies
- Include testing information

Example:
feat(api): implement user authentication endpoint [PROJ-123]

Added OAuth2 authentication endpoint for user login.

Affected systems:
- Authentication service
- User management module
- API gateway

Testing:
- Unit tests: 12 new, 0 failed
- Integration tests: All passing
- Security scan: Clean`,

  sarcastic: `You are a sarcastic commit message generator. Generate a witty commit message.
Rules:
- Be clever and slightly sarcastic
- Keep it professional enough for work
- Add humor to the body

Example:
fix(bug): finally fixed the bug everyone ignored

Someone actually looked at the logs for once. Shocking.

- Fixed the null pointer exception nobody reported
- Added null checks everywhere
- Now it doesn't crash (anymore)`,

  concise: `You are a concise commit message generator. Generate the shortest meaningful one-liner.
Rules:
- Exactly one line
- Max 60 characters
- Type: description format only
- No body, no extras

Examples:
fix(auth): handle token refresh failures
feat(ui): add dark mode toggle
docs(api): update endpoint docs`
};

/**
 * Generate commit message using LLM
 */
export async function generateCommitMessage(
  diff: string,
  vibe: string = 'professional',
  lang: string = 'en'
): Promise<string> {
  try {
    // Get API configuration from environment
    const baseUrl = process.env.OPENAI_BASE_URL || 'http://localhost:8081/v1'; // GB10 #2 default
    const apiKey = process.env.OPENAI_API_KEY || 'sk-no-key-required'; // Ollama/vLLM often don't need keys
    
    const openai = new OpenAI({
      baseURL: baseUrl,
      apiKey: apiKey,
    });

    // Get the vibe prompt
    const vibePrompt = VIBE_PROMPTS[vibe] || VIBE_PROMPTS.professional;
    
    // Build the system prompt with language instruction
    const systemPrompt = `${vibePrompt}

IMPORTANT: Write the commit message in ${lang === 'nl' ? 'Dutch' : lang === 'de' ? 'German' : lang === 'fr' ? 'French' : 'English'}.
Keep the commit type and scope in English, but the description in the chosen language.`;

    // Prepare the diff - truncate if too long (LLM context limit)
    const maxDiffLength = 8000;
    const truncatedDiff = diff.length > maxDiffLength 
      ? diff.substring(0, maxDiffLength) + '\n\n... [truncated] ...'
      : diff;

    // Call the LLM
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'Qwen3.6-35B-A3B-NVFP4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Here is the git diff. Generate a commit message in the specified vibe:\n\n\`\`\`diff\n${truncatedDiff}\n\`\`\``
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.95,
    });

    return response.choices[0]?.message?.content || '[No response from AI]';
    
  } catch (error) {
    // Fallback if LLM fails
    console.error('⚠️  LLM call failed, using fallback:', error instanceof Error ? error.message : error);
    
    // Try local fallback
    try {
      return generateFallbackMessage(diff, vibe, lang);
    } catch (fallbackError) {
      return `[${vibe.toUpperCase()}] Update project\n\nGenerated with fallback.`;
    }
  }
}

/**
 * Fallback message generator when LLM is unavailable
 */
function generateFallbackMessage(diff: string, vibe: string, lang: string): string {
  const lines = diff.split('\n');
  const changedFiles = new Set<string>();
  let additions = 0;
  let deletions = 0;
  
  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      const match = line.match(/b\/(.*)/);
      if (match) changedFiles.add(match[1]);
    }
    if (line.startsWith('+') && !line.startsWith('+++')) additions++;
    if (line.startsWith('-') && !line.startsWith('---')) deletions++;
  }
  
  const fileCount = changedFiles.size;
  const type = additions > deletions ? 'feat' : 'fix';
  const summary = lang === 'nl' 
    ? `${type}: update project (${fileCount} bestanden, +${additions}/-${deletions} regels)`
    : `${type}: update project (${fileCount} files, +${additions}/-${deletions} lines)`;
  
  return summary;
}
