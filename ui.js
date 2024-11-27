document.addEventListener('alpine:init', () => {
    Alpine.data('writingAssistant', () => ({
        editor: null,
        selectedText: '',
        aiResponse: '',
        isLoading: false,
        showContextMenu: false,
        contextMenuX: 0,
        contextMenuY: 0,
        llmClient: new LLMClient(),
        lastPrompt: '',
        lastSystemMessage: '',

        init() {
            this.initEditor();
            
            // Click outside handler for context menu
            document.addEventListener('click', (e) => {
                if (this.showContextMenu && !e.target.closest('.context-menu')) {
                    this.showContextMenu = false;
                }
            });
        },

        initEditor() {
            // Configure Medium Editor with expanded toolbar options
            this.editor = new MediumEditor('#editor', {
                buttonLabels: 'fontawesome',
                toolbar: {
                    buttons: [
                        'bold',
                        'italic',
                        'underline',
                        'strikethrough',
                        'subscript',
                        'superscript',
                        'anchor',
                        'image',
                        'orderedlist',
                        'unorderedlist',
                        'justifyLeft',
                        'justifyCenter',
                        'justifyRight',
                        'justifyFull',
                        'h1',
                        'h2',
                        'h3',
                        'h4',
                        'quote',
                        'removeFormat',
                        'html'
                    ],
                    static: true,
                    sticky: true,
                    diffLeft: 0,
                    diffTop: -10,
                    standardizeSelectionStart: true
                },
                placeholder: {
                    text: 'Start writing or paste your text here...',
                    hideOnClick: true
                },
                paste: {
                    cleanPastedHTML: true,
                    forcePlainText: false
                },
                anchor: {
                    placeholderText: 'Paste or type a link',
                    customClassOption: null,
                    customClassOptionText: 'Button',
                    linkValidation: true,
                    targetCheckbox: true,
                    targetCheckboxText: 'Open in new window'
                },
                image: {
                    fileUploadOptions: {
                        // Disable file upload since we're not handling server uploads
                        uploadEnabled: false
                    }
                },
                autoLink: true,
                imageDragging: false,
                targetBlank: true,
                disableReturn: false,
                disableDoubleReturn: false,
                disableExtraSpaces: false
            });

            // Handle text selection
            document.querySelector('#editor').addEventListener('mouseup', () => {
                this.handleTextSelection();
            });
            
            document.querySelector('#editor').addEventListener('keyup', () => {
                this.handleTextSelection();
            });
        },

        handleTextSelection() {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                if (range.toString().trim()) {
                    this.selectedText = range.toString().trim();
                } else {
                    this.selectedText = '';
                }
            }
        },

        handleContextMenu(event) {
            event.preventDefault();
            this.handleTextSelection();
            if (this.selectedText) {
                this.showContextMenu = true;
                this.contextMenuX = event.clientX;
                this.contextMenuY = event.clientY;
            } else {
                this.showContextMenu = false;
            }
        },

        async improveText() {
            this.showContextMenu = false;
            if (!this.selectedText) return;
            const { prompt, systemMessage } = WritingPrompts.improve(this.selectedText);
            await this.getAIResponse(prompt, systemMessage);
        },

        async checkGrammar() {
            this.showContextMenu = false;
            if (!this.selectedText) return;
            const { prompt, systemMessage } = WritingPrompts.grammar(this.selectedText);
            await this.getAIResponse(prompt, systemMessage);
        },

        async makeConcise() {
            this.showContextMenu = false;
            if (!this.selectedText) return;
            const { prompt, systemMessage } = WritingPrompts.concise(this.selectedText);
            await this.getAIResponse(prompt, systemMessage);
        },

        async explainText() {
            this.showContextMenu = false;
            if (!this.selectedText) return;
            const { prompt, systemMessage } = WritingPrompts.explain(this.selectedText);
            await this.getAIResponse(prompt, systemMessage);
        },

        async generateFromPrompt() {
            this.showContextMenu = false;
            if (!this.selectedText) return;
            const { prompt, systemMessage } = WritingPrompts.generate(this.selectedText);
            await this.getAIResponse(prompt, systemMessage);
        },

        async getAIResponse(prompt, systemMessage = '') {
            this.lastPrompt = prompt;
            this.lastSystemMessage = systemMessage;
            this.isLoading = true;
            this.aiResponse = '';

            try {
                let fullResponse = '';
                for await (const chunk of this.llmClient.streamResponse(prompt, systemMessage)) {
                    fullResponse += chunk;
                    this.aiResponse = this.formatResponse(fullResponse);
                }
            } catch (error) {
                this.aiResponse = `<p class="text-red-600">Error: ${error.message}</p>`;
            } finally {
                this.isLoading = false;
            }
        },

        formatResponse(text) {
            // Clean the Markdown output before parsing
            const cleanedText = cleanMarkdownOutput(text);
            return marked.parse(cleanedText);
        },

        async downloadResponse() {
            if (!this.aiResponse) return;

            // Convert AI response from HTML to plain text
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.aiResponse;
            const rawResponse = tempDiv.textContent || tempDiv.innerText || '';

            // Sanitize the filename using the first few words of the response
            const filename = sanitizeFilename(rawResponse.split(' ').slice(0, 5).join(' ')) + '.txt';

            // Download the response as a file
            downloadTextAsFile(rawResponse, filename);
        },

        async insertResponse() {
            if (!this.editor || !this.aiResponse) return;

            try {
                // Convert markdown to HTML using marked
                const htmlContent = marked.parse(this.aiResponse);
                
                // Get current selection
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    
                    // Create temporary container
                    const temp = document.createElement('div');
                    temp.innerHTML = htmlContent;
                    
                    // Insert content
                    range.deleteContents();
                    range.insertNode(temp);
                } else {
                    // If no selection, append to editor
                    const editorElement = document.querySelector('#editor');
                    editorElement.innerHTML += htmlContent;
                }
            } catch (e) {
                console.warn('Error inserting response:', e);
            }

            // Clear the AI response
            this.aiResponse = '';
        },

        async retryResponse() {
            if (this.lastPrompt) {
                await this.getAIResponse(this.lastPrompt, this.lastSystemMessage);
            }
        },

        cancelResponse() {
            this.aiResponse = '';
            this.lastPrompt = '';
            this.lastSystemMessage = '';
        }
    }));
});
