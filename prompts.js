const WritingPrompts = {
    improve: (text) => ({
        prompt: `Please improve the following text while maintaining its original meaning. Make it more professional and engaging:\n\n${text}`,
        systemMessage: "You are a professional writing coach focused on improving text clarity, style, and impact while preserving the original message. Format your output as markdown."
    }),
    
    grammar: (text) => ({
        prompt: `Please check the following text for grammar and spelling errors, and provide corrections:\n\n${text}`,
        systemMessage: "You are a meticulous grammar and spelling expert. Focus on identifying and correcting errors while explaining the corrections. Format your output as markdown."
    }),
    
    concise: (text) => ({
        prompt: `Please make the following text more concise while maintaining its key points:\n\n${text}`,
        systemMessage: "You are an editor specialized in making text concise and impactful. Focus on eliminating redundancy while preserving essential meaning. Format your output as markdown."
    }),
    
    explain: (text) => ({
        prompt: `Please explain the following text in simple terms:\n\n${text}`,
        systemMessage: "You are an expert at breaking down complex information into simple, easy-to-understand explanations. Focus on clarity and accessibility. Format your output as markdown."
    }),
    
    generate: (text) => ({
        prompt: `Generate content based on this prompt:\n\n${text}`,
        systemMessage: "You are a creative writing assistant with expertise in generating engaging and relevant content. Focus on originality and matching the user's intent. Format your output as markdown."
    }),
    generate: (text) => ({
        prompt: `Generate content based on this prompt:\n\n${text}`,
        systemMessage: "Output Format in tabular format."
    })
}; 