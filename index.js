document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const urlInput = document.getElementById('url');
    const methodSelect = document.getElementById('method');
    const contentTypeSelect = document.getElementById('content-type');
    const requestBodyTextarea = document.getElementById('request-body');
    const sendRequestButton = document.getElementById('send-request');
    const addParamButton = document.getElementById('add-param');
    const addHeaderButton = document.getElementById('add-header');
    const paramsContainer = document.getElementById('params-container');
    const headersContainer = document.getElementById('headers-container');
    const responseSection = document.getElementById('response-section');
    const responseStatus = document.getElementById('response-status');
    const responseTime = document.getElementById('response-time');
    const responseBody = document.getElementById('response-body');
    const prettifyJsonButton = document.getElementById('prettify-json');
    const historyContainer = document.getElementById('history-container');
    const clearHistoryButton = document.getElementById('clear-history');
    const authTypeSelect = document.getElementById('auth-type');
    const authBasicSection = document.getElementById('auth-basic');
    const authBearerSection = document.getElementById('auth-bearer');
    const authApiKeySection = document.getElementById('auth-api-key');
    
    // Tab navigation
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabGroup = this.parentElement;
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all tabs in the same group
            tabGroup.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Handle main tabs
            if (tabGroup.classList.contains('tabs') && !tabGroup.previousElementSibling.classList.contains('form-group')) {
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                document.getElementById(`${tabName}-tab`).classList.add('active');
            } else {
                // Handle sub-tabs
                const parent = tabGroup.parentElement;
                parent.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                document.getElementById(`${tabName}-tab`).classList.add('active');
            }
        });
    });
    
    // Auth type change handler
    authTypeSelect.addEventListener('change', function() {
        const authType = this.value;
        
        // Hide all auth sections
        authBasicSection.style.display = 'none';
        authBearerSection.style.display = 'none';
        authApiKeySection.style.display = 'none';
        
        // Show selected auth section
        if (authType === 'basic') {
            authBasicSection.style.display = 'block';
        } else if (authType === 'bearer') {
            authBearerSection.style.display = 'block';
        } else if (authType === 'api-key') {
            authApiKeySection.style.display = 'block';
        }
    });
    
    // Add param button handler
    addParamButton.addEventListener('click', function() {
        addParamField(paramsContainer);
    });
    
    // Add header button handler
    addHeaderButton.addEventListener('click', function() {
        addParamField(headersContainer);
    });
    
    // Add initial parameter fields
    addParamField(paramsContainer);
    addParamField(headersContainer);
    
    // Send request button handler
    sendRequestButton.addEventListener('click', async function() {
        const url = urlInput.value.trim();
        if (!url) {
            alert('Please enter a URL');
            return;
        }
        
        this.disabled = true;
        this.innerHTML = '<span class="loader"></span> Sending...';
        
        try {
            const startTime = new Date();
            const response = await sendRequest();
            const endTime = new Date();
            const duration = endTime - startTime;
            
            // Display response
            displayResponse(response, duration);
            
            // Add to history
            addToHistory({
                method: methodSelect.value,
                url: urlInput.value,
                params: getParams(paramsContainer),
                headers: getParams(headersContainer),
                body: requestBodyTextarea.value,
                contentType: contentTypeSelect.value,
                auth: getAuthConfig(),
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Request failed:', error);
            displayError(error);
        } finally {
            this.disabled = false;
            this.innerHTML = 'Send Request';
        }
    });
    
    // Prettify JSON button handler
    prettifyJsonButton.addEventListener('click', function() {
        try {
            const json = JSON.parse(responseBody.textContent);
            responseBody.textContent = JSON.stringify(json, null, 2);
        } catch (error) {
            alert('Cannot prettify: Invalid JSON');
        }
    });
    
    // Clear history button handler
    clearHistoryButton.addEventListener('click', function() {
        localStorage.removeItem('apiTesterHistory');
        renderHistory();
    });
    
    // Function to add parameter field
    function addParamField(container, key = '', value = '') {
        const paramContainer = document.createElement('div');
        paramContainer.className = 'param-container';
        
        const keyInput = document.createElement('input');
        keyInput.type = 'text';
        keyInput.className = 'param-key';
        keyInput.placeholder = 'Key';
        keyInput.value = key;
        
        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.className = 'param-value';
        valueInput.placeholder = 'Value';
        valueInput.value = value;
        
        const removeButton = document.createElement('button');
        removeButton.innerHTML = '✕';
        removeButton.title = 'Remove';
        removeButton.addEventListener('click', function() {
            container.removeChild(paramContainer);
        });
        
        paramContainer.appendChild(keyInput);
        paramContainer.appendChild(valueInput);
        paramContainer.appendChild(removeButton);
        
        container.appendChild(paramContainer);
    }
    
    // Function to get parameters from container
    function getParams(container) {
        const params = {};
        container.querySelectorAll('.param-container').forEach(paramContainer => {
            const key = paramContainer.querySelector('.param-key').value.trim();
            const value = paramContainer.querySelector('.param-value').value.trim();
            if (key) {
                params[key] = value;
            }
        });
        return params;
    }
    
    // Function to get auth configuration
    function getAuthConfig() {
        const authType = authTypeSelect.value;
        
        if (authType === 'basic') {
            return {
                type: 'basic',
                username: document.getElementById('basic-username').value,
                password: document.getElementById('basic-password').value
            };
        } else if (authType === 'bearer') {
            return {
                type: 'bearer',
                token: document.getElementById('bearer-token').value
            };
        } else if (authType === 'api-key') {
            return {
                type: 'api-key',
                name: document.getElementById('api-key-name').value,
                value: document.getElementById('api-key-value').value,
                location: document.getElementById('api-key-location').value
            };
        }
        
        return { type: 'none' };
    }
    
    // Function to apply auth configuration to headers or URL
    function applyAuth(url, headers) {
        const auth = getAuthConfig();
        
        if (auth.type === 'basic') {
            const base64Credentials = btoa(`${auth.username}:${auth.password}`);
            headers['Authorization'] = `Basic ${base64Credentials}`;
        } else if (auth.type === 'bearer') {
            headers['Authorization'] = `Bearer ${auth.token}`;
        } else if (auth.type === 'api-key') {
            if (auth.location === 'header') {
                headers[auth.name] = auth.value;
            } else if (auth.location === 'query') {
                url = addQueryParam(url, auth.name, auth.value);
            }
        }
        
        return { url, headers };
    }
    
    // Function to add query param to URL
    function addQueryParam(url, key, value) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
    
    // Function to send request
    async function sendRequest() {
        let url = urlInput.value.trim();
        const method = methodSelect.value;
        const contentType = contentTypeSelect.value;
        const queryParams = getParams(paramsContainer);
        let headers = getParams(headersContainer);
        
        // Apply auth
        const authResult = applyAuth(url, headers);
        url = authResult.url;
        headers = authResult.headers;
        
        // Add query parameters to URL
        Object.entries(queryParams).forEach(([key, value]) => {
            url = addQueryParam(url, key, value);
        });
        
        // Configure request options
        const options = {
            method,
            headers: new Headers(headers)
        };
        
        // Add body for non-GET requests
        if (method !== 'GET' && method !== 'HEAD') {
            const bodyContent = requestBodyTextarea.value.trim();
            if (bodyContent) {
                options.headers.set('Content-Type', contentType);
                options.body = bodyContent;
            }
        }
        
        // Send request
        const response = await fetch(url, options);
        
        // Prepare response object
        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = responseText;
        }
        
        return {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries([...response.headers.entries()]),
            data: responseData,
            text: responseText
        };
    }
    
    // Function to display response
    function displayResponse(response, duration) {
        responseSection.style.display = 'block';
        
        // Set status
        const statusClass = response.status < 400 ? 'success' : 'error';
        responseStatus.className = `response-status ${statusClass}`;
        responseStatus.textContent = `${response.status} ${response.statusText}`;
        
        // Set response time
        responseTime.textContent = `${duration}ms`;
        
        // Set response body
        if (typeof response.data === 'object') {
            responseBody.textContent = JSON.stringify(response.data, null, 2);
        } else {
            responseBody.textContent = response.text;
        }
        
        // Scroll to response
        responseSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Function to display error
    function displayError(error) {
        responseSection.style.display = 'block';
        responseStatus.className = 'response-status error';
        responseStatus.textContent = 'Request Failed';
        responseTime.textContent = '';
        responseBody.textContent = error.message;
        
        responseSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Function to add request to history
    function addToHistory(request) {
        let history = JSON.parse(localStorage.getItem('apiTesterHistory') || '[]');
        history.unshift(request);
        
        // Limit history to 20 items
        if (history.length > 20) {
            history = history.slice(0, 20);
        }
        
        localStorage.setItem('apiTesterHistory', JSON.stringify(history));
        renderHistory();
    }
    
    // Function to render history
    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('apiTesterHistory') || '[]');
        
        if (history.length === 0) {
            historyContainer.innerHTML = '<div class="no-history">No request history yet</div>';
            return;
        }
        
        historyContainer.innerHTML = '';
        
        history.forEach((request, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const methodSpan = document.createElement('span');
            methodSpan.className = 'history-method';
            methodSpan.textContent = request.method;
            
            const urlSpan = document.createElement('span');
            urlSpan.className = 'history-url';
            urlSpan.textContent = request.url;
            
            historyItem.appendChild(methodSpan);
            historyItem.appendChild(urlSpan);
            
            historyItem.addEventListener('click', function() {
                loadRequestFromHistory(request);
                
                // Switch to request tab
                document.querySelector('.tabs .tab[data-tab="request"]').click();
            });
            
            historyContainer.appendChild(historyItem);
        });
    }
    
    // Function to load request from history
    function loadRequestFromHistory(request) {
        // Set URL and method
        urlInput.value = request.url;
        methodSelect.value = request.method;
        
        // Set request body and content type
        requestBodyTextarea.value = request.body || '';
        contentTypeSelect.value = request.contentType || 'application/json';
        
        // Set parameters
        paramsContainer.innerHTML = '';
        if (request.params) {
            Object.entries(request.params).forEach(([key, value]) => {
                addParamField(paramsContainer, key, value);
            });
        }
        if (paramsContainer.children.length === 0) {
            addParamField(paramsContainer);
        }
        
        // Set headers
        headersContainer.innerHTML = '';
        if (request.headers) {
            Object.entries(request.headers).forEach(([key, value]) => {
                addParamField(headersContainer, key, value);
            });
        }
        if (headersContainer.children.length === 0) {
            addParamField(headersContainer);
        }
        
        // Set auth
        if (request.auth) {
            authTypeSelect.value = request.auth.type;
            
            if (request.auth.type === 'basic') {
                document.getElementById('basic-username').value = request.auth.username || '';
                document.getElementById('basic-password').value = request.auth.password || '';
                authBasicSection.style.display = 'block';
                authBearerSection.style.display = 'none';
                authApiKeySection.style.display = 'none';
            } else if (request.auth.type === 'bearer') {
                document.getElementById('bearer-token').value = request.auth.token || '';
                authBasicSection.style.display = 'none';
                authBearerSection.style.display = 'block';
                authApiKeySection.style.display = 'none';
            } else if (request.auth.type === 'api-key') {
                document.getElementById('api-key-name').value = request.auth.name || '';
                document.getElementById('api-key-value').value = request.auth.value || '';
                document.getElementById('api-key-location').value = request.auth.location || 'header';
                authBasicSection.style.display = 'none';
                authBearerSection.style.display = 'none';
                authApiKeySection.style.display = 'block';
            } else {
                authBasicSection.style.display = 'none';
                authBearerSection.style.display = 'none';
                authApiKeySection.style.display = 'none';
            }
        } else {
            authTypeSelect.value = 'none';
            authBasicSection.style.display = 'none';
            authBearerSection.style.display = 'none';
            authApiKeySection.style.display = 'none';
        }
    }
    
    // Initialize
    renderHistory();
});