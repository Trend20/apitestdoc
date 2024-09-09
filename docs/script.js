document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });

    document.getElementById('playground-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const method = formData.get('method');
        const headers = formData.get('headers').split('\n').reduce((acc, header) => {
            const [key, value] = header.split(':');
            if (key && value) acc[key.trim()] = value.trim();
            return acc;
        }, {});
        const body = formData.get('body');

        const outputElement = document.getElementById('playground-output');
        outputElement.textContent = 'Sending request...';

        try {
            const response = await fetch(url, {
                method,
                headers,
                body: method !== 'GET' ? body : undefined
            });
            const data = await response.json();
            const formattedOutput = JSON.stringify(data, null, 2);
            outputElement.textContent = formattedOutput;
            // updateLineNumbers(formattedOutput);
        } catch (error) {
            outputElement.textContent = `Error: ${error.message}`;
            // updateLineNumbers(outputElement.textContent);
        }
    });

    document.getElementById('copy-button').addEventListener('click', () => {
        const outputElement = document.getElementById('playground-output');
        navigator.clipboard.writeText(outputElement.textContent).then(() => {
            const copyButton = document.getElementById('copy-button');
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy';
            }, 2000);
        });
    });

    document.getElementById('generate-docs-button').addEventListener('click', () => {
        const url = document.getElementById('url').value;
        const method = document.getElementById('method').value;
        const headers = document.getElementById('headers').value;
        const body = document.getElementById('body').value;
        const response = document.getElementById('playground-output').textContent;
        const format = document.getElementById('doc-format').value;

        const docContent = generateDocs(url, method, headers, body, response, format);
        downloadDocs(docContent, format);
    });

    function generateDocs(url, method, headers, body, response, format) {
        const doc = {
            endpoint: url,
            method: method,
            headers: headers.split('\n').reduce((acc, header) => {
                const [key, value] = header.split(':');
                if (key && value) acc[key.trim()] = value.trim();
                return acc;
            }, {}),
            body: body,
            response: JSON.parse(response)
        };

        if (format === 'json') {
            return JSON.stringify(doc, null, 2);
        } else if (format === 'markdown') {
            return `# API Documentation

## Endpoint: ${url}

### Method: ${method}

### Headers:
${Object.entries(doc.headers).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

### Request Body:
\`\`\`json
${body}
\`\`\`

### Response:
\`\`\`json
${JSON.stringify(doc.response, null, 2)}
\`\`\``;
        } else if (format === 'openapi') {
            return JSON.stringify(generateOpenAPISpec(url, method, doc.headers, body, response), null, 2);
        } else if (format === 'postman') {
            return JSON.stringify(generatePostmanCollection(url, method, doc.headers, body, response), null, 2);
        }
    }

    function generateOpenAPISpec(url, method, headers, body, response) {
        const urlObj = new URL(url);
        return {
            openapi: "3.0.0",
            info: {
                title: "API Documentation",
                version: "1.0.0"
            },
            paths: {
                [urlObj.pathname]: {
                    [method.toLowerCase()]: {
                        summary: `${method} request to ${urlObj.pathname}`,
                        parameters: Object.entries(headers).map(([key, value]) => ({
                            name: key,
                            in: "header",
                            schema: {
                                type: "string"
                            },
                            example: value
                        })),
                        requestBody: {
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        example: JSON.parse(body || '{}')
                                    }
                                }
                            }
                        },
                        responses: {
                            "200": {
                                description: "Successful response",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            example: JSON.parse(response)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
    }

    function generatePostmanCollection(url, method, headers, body, response) {
        return {
            info: {
                name: "API Documentation",
                schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            item: [
                {
                    name: url,
                    request: {
                        url: url,
                        method: method,
                        header: Object.entries(headers).map(([key, value]) => ({
                            key: key,
                            value: value
                        })),
                        body: {
                            mode: "raw",
                            raw: body,
                            options: {
                                raw: {
                                    language: "json"
                                }
                            }
                        }
                    },
                    response: [
                        {
                            name: "Successful response",
                            status: "OK",
                            _postman_previewlanguage: "json",
                            header: [],
                            body: response
                        }
                    ]
                }
            ]
        };
    }

    function downloadDocs(content, format) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `api_docs.${format === 'markdown' ? 'md' : 'json'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});


