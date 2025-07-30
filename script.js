// Email sender frontend logic
document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('emailForm');
    const previewBtn = document.getElementById('previewBtn');
    const sendBtn = document.getElementById('sendBtn');
    const closePreviewBtn = document.getElementById('closePreview');
    const previewSection = document.getElementById('previewSection');
    const previewContent = document.getElementById('previewContent');
    const statusMessage = document.getElementById('statusMessage');

    // Backend API URL - Update this with your Vercel deployment URL
    const API_BASE_URL = 'https://your-vercel-app.vercel.app';

    // Preview email functionality
    previewBtn.addEventListener('click', function() {
        const recipientName = document.getElementById('recipientName').value;
        const emailBody = document.getElementById('emailBody').value;
        
        if (!recipientName || !emailBody) {
            showStatus('Please fill in recipient name and email body to preview.', 'error');
            return;
        }

        // Replace {{name}} placeholder with actual name
        const personalizedBody = emailBody.replace(/\{\{name\}\}/g, recipientName);
        
        // Show preview
        previewContent.innerHTML = personalizedBody;
        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Close preview functionality
    closePreviewBtn.addEventListener('click', function() {
        previewSection.style.display = 'none';
    });

    // Send email functionality
    sendBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Get form data directly from form elements
        const emailData = {
            senderEmail: document.getElementById('senderEmail').value,
            senderPassword: document.getElementById('senderPassword').value,
            recipientEmail: document.getElementById('recipientEmail').value,
            recipientName: document.getElementById('recipientName').value,
            subject: document.getElementById('subject').value,
            emailBody: document.getElementById('emailBody').value
        };

        console.log('Email data:', { ...emailData, senderPassword: '[HIDDEN]' });

        // Validate form data
        if (!validateEmailData(emailData)) {
            return;
        }

        // Personalize email body
        emailData.emailBody = emailData.emailBody.replace(/\{\{name\}\}/g, emailData.recipientName);

        // Show loading state
        showStatus('<span class="loading-spinner"></span>Sending email...', 'loading');
        sendBtn.disabled = true;
        sendBtn.textContent = '📤 Sending...';

        try {
            console.log('Making API request to:', `${API_BASE_URL}/api/send-email`);
            
            const response = await fetch(`${API_BASE_URL}/api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            const result = await response.json();
            console.log('Response data:', result);

            if (response.ok) {
                showStatus('✅ Email sent successfully!', 'success');
                // Don't reset form to preserve data for testing
                previewSection.style.display = 'none';
            } else {
                showStatus(`❌ Error: ${result.error || 'Failed to send email'}`, 'error');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            showStatus(`❌ Network error: ${error.message}. Please check your connection and try again.`, 'error');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = '📤 Send Email';
        }
    });

    // Validate email data
    function validateEmailData(data) {
        if (!data.senderEmail || !data.senderPassword) {
            showStatus('Please enter your email credentials.', 'error');
            return false;
        }

        if (!data.recipientEmail || !data.recipientName) {
            showStatus('Please enter recipient information.', 'error');
            return false;
        }

        if (!data.subject || !data.emailBody) {
            showStatus('Please enter email subject and body.', 'error');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.senderEmail)) {
            showStatus('Please enter a valid sender email address.', 'error');
            return false;
        }

        if (!emailRegex.test(data.recipientEmail)) {
            showStatus('Please enter a valid recipient email address.', 'error');
            return false;
        }

        return true;
    }

    // Show status message
    function showStatus(message, type) {
        statusMessage.innerHTML = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 5000);
        }
        
        // Scroll to status message
        statusMessage.scrollIntoView({ behavior: 'smooth' });
    }

    // Auto-save form data to localStorage
    const formInputs = emailForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        // Load saved data
        const savedValue = localStorage.getItem(`vidpace_${input.name}`);
        if (savedValue && input.type !== 'password') {
            input.value = savedValue;
        }

        // Save data on change
        input.addEventListener('input', function() {
            if (input.type !== 'password') {
                localStorage.setItem(`vidpace_${input.name}`, input.value);
            }
        });
    });

    // Clear saved data button (optional)
    const clearDataBtn = document.createElement('button');
    clearDataBtn.type = 'button';
    clearDataBtn.textContent = '🗑️ Clear Saved Data';
    clearDataBtn.style.cssText = `
        margin-top: 10px;
        padding: 8px 15px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 0.9rem;
        cursor: pointer;
    `;
    clearDataBtn.addEventListener('click', function() {
        if (confirm('Clear all saved form data?')) {
            formInputs.forEach(input => {
                localStorage.removeItem(`vidpace_${input.name}`);
            });
            emailForm.reset();
            showStatus('Saved data cleared.', 'success');
        }
    });
    
    document.querySelector('.button-group').appendChild(clearDataBtn);
});

