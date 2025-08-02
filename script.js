// Fixed Email sender frontend logic
document.addEventListener('DOMContentLoaded', function() {
    const emailForm = document.getElementById('emailForm');
    const previewBtn = document.getElementById('previewBtn');
    const sendBtn = document.getElementById('sendBtn');
    const closePreviewBtn = document.getElementById('closePreview');
    const previewSection = document.getElementById('previewSection');
    const previewFrame = document.getElementById('previewFrame');
    const statusMessage = document.getElementById('statusMessage');

    // Backend API URL - Using the correct Vercel deployment URL
    const API_BASE_URL = 'https://vidpace-final-backend-email.vercel.app';

    // Fixed HTML email template
    const EMAIL_TEMPLATE = `
<html>
  <body>
    <h1>Hello [Name],</h1>
    <p>This is [SenderName] from vidpace. [Message]</p>
  </body>
</html>`;

    // Preview email functionality - Fixed to render HTML properly
    previewBtn.addEventListener('click', function() {
        const recipientName = document.getElementById('recipientName').value;
        const senderEmail = document.getElementById('senderEmail').value;
        const customMessage = document.getElementById('customMessage').value;
        
        if (!recipientName || !senderEmail || !customMessage) {
            showStatus('Please fill in all required fields to preview.', 'error');
            return;
        }

        // Extract sender name from email (part before @)
        const senderName = senderEmail.split('@')[0];

        // Replace placeholders with actual values
        let personalizedBody = EMAIL_TEMPLATE
            .replace(/\[Name\]/g, recipientName)
            .replace(/\[SenderName\]/g, senderName)
            .replace(/\[Message\]/g, customMessage);
        
        // Show preview using iframe for proper HTML rendering
        previewFrame.srcdoc = personalizedBody;
        previewSection.style.display = 'block';
        previewSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Close preview functionality
    closePreviewBtn.addEventListener('click', function() {
        previewSection.style.display = 'none';
    });

    // Send email functionality - Fixed API URL and error handling
    emailForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data directly from form elements
        const recipientName = document.getElementById('recipientName').value;
        const senderEmail = document.getElementById('senderEmail').value;
        const customMessage = document.getElementById('customMessage').value;
        
        const emailData = {
            senderEmail: senderEmail,
            senderPassword: document.getElementById('senderPassword').value,
            recipientEmail: document.getElementById('recipientEmail').value,
            recipientName: recipientName,
            subject: document.getElementById('subject').value,
            emailBody: '' // Will be set below
        };

        console.log('Email data:', { ...emailData, senderPassword: '[HIDDEN]' });

        // Validate form data
        if (!validateEmailData(emailData, customMessage)) {
            return;
        }

        // Generate personalized email body
        const senderName = emailData.senderEmail.split('@')[0];
        emailData.emailBody = EMAIL_TEMPLATE
            .replace(/\[Name\]/g, emailData.recipientName)
            .replace(/\[SenderName\]/g, senderName)
            .replace(/\[Message\]/g, customMessage);

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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Response data:', result);

            if (result.success) {
                showStatus('✅ Email sent successfully!', 'success');
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
    function validateEmailData(data, customMessage) {
        if (!data.senderEmail || !data.senderPassword) {
            showStatus('Please enter your email credentials.', 'error');
            return false;
        }

        if (!data.recipientEmail || !data.recipientName) {
            showStatus('Please enter recipient information.', 'error');
            return false;
        }

        if (!data.subject || !customMessage) {
            showStatus('Please enter email subject and your message.', 'error');
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

    // Auto-save form data to localStorage (excluding password)
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

    // Clear saved data button
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
