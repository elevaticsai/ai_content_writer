// llm-api-client.js
class LLMClient {
    constructor() {
        this.apiUrl = 'http://localhost:11434/api/generate';
        this.modelId = "llama3.2:3b";
    }

    async *streamResponse(prompt, systemMessage) {
        try {
            conole.log('before')
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.modelId,
                    prompt: prompt,
                    system: systemMessage,
                    stream: true,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        top_k: 40,
                        max_tokens: 1000
                    }
                })
            });
            console.log('after')
            if (!response.ok) {
                const errorBody = await response.text();
                console.error('Response Status:', response.status);
                console.error('Response Body:', errorBody);
                throw new Error('API request failed');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    const data = JSON.parse(line);
                    yield data.response;
                }
            }
        } catch (error) {
            console.error('Error details:', error);
            throw new Error('Failed to communicate with Ollama API: ' + error.message);
        }
    }
}
