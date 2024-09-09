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
            outputElement.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            outputElement.textContent = `Error: ${error.message}`;
        }
    });
});


