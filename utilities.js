/**
 * Sanitizes a string to be used as a filename.
 * Removes special characters and limits the length.
 * @param {string} text - The text to sanitize.
 * @returns {string} - The sanitized filename.
 */
function sanitizeFilename(text) {
    return text
        .replace(/[^a-z0-9]/gi, '_') // Replace non-alphanumeric characters with underscores
        .toLowerCase()
        .substring(0, 20); // Limit to the first 20 characters
}

/**
 * Downloads a given text as a file.
 * @param {string} text - The content to download.
 * @param {string} filename - The name of the file.
 */
function downloadTextAsFile(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Cleans up the LLM output by removing unwanted Markdown formatting.
 * @param {string} text - The LLM output text.
 * @returns {string} - The cleaned text.
 */
function cleanMarkdownOutput(text) {
    return text.replace(/```markdown/g, '').replace(/```/g, '');
} 