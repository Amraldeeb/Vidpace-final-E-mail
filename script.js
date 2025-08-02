document.addEventListener("DOMContentLoaded", function() {
    const emailForm = document.getElementById("emailForm");
    const previewBtn = document.getElementById("previewBtn");
    const sendBtn = document.getElementById("sendBtn");
    const closePreviewBtn = document.getElementById("closePreview");
    const previewSection = document.getElementById("previewSection");
    const previewFrame = document.getElementById("previewFrame");
    const statusMessage = document.getElementById("statusMessage");

    // Backend API URL - Using the correct Vercel deployment URL
    const API_BASE_URL = "https://vidpace-final-backend-email.vercel.app";

    // Fixed HTML email template
    const EMAIL_TEMPLATE = `
<html>
  <body style="margin:0; padding:0; background-color:#f5f5f5; font-family: 'Segoe UI', sans-serif;">
    <div style="max-width:600px; margin:40px auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08 );">
      <!-- Header -->
      <div style="background-color:#eeeeee; padding:20px 30px; text-align:center;">
        <img src="https://static.wixstatic.com/media/056e0c_8797100b61ae453fb6ae48211f2143e5~mv2.png/v1/fill/w_147,h_66,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Vidpace.png" alt="Vidpace Logo" style="height:40px;" />
      </div>
      <!-- Body -->
      <div style="padding:30px; text-align:left;">
        <h2 style="color:#111; font-size:22px; margin:0 0 15px;">Hi [[Recepient Name]],</h2>
        <p style="font-size:16px; color:#444; line-height:1.6; margin-bottom:20px;">This is [[SenderName]] from Vidpace. [[Body]]</p>
        <p style="font-size:16px; color:#444; line-height:1.6;"><br>If you're interested we can schedule a quick meeting to discuss this further.<br></p>
        <p style="font-size:16px; color:#444; line-height:1.6;">Regards,</p>  
        <p style="font-size:16px; color:#444; line-height:1.6;">[[SenderName]]</p>  
        <p style="font-size:16px; color:#444; line-height:1.6;">Vidpace Team</p>
        <div style="text-align:center; margin:30px 0;">
          <a href="https://vidpace.com/#/schedule" style="background-color:#E60023; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold; font-size:16px;">Schedule A Quick Meeting</a>
        </div>
      </div>
      <!-- Footer -->
      <div style="background-color:#f1f1f1; padding:15px 30px; text-align:center; font-size:12px; color:#999;">
        © 2024 Vidpace · Creative Youtube Automation  
        <a href="https://vidpace.com" style="color:#999; text-decoration:none;">www.vidpace.com</a>
      </div>
    </div>
  </body>
</html>
`;

    // Preview email functionality - Fixed to render HTML properly
    previewBtn.addEventListener('click', function( ) {
        const recipientName = document.getElementById('recipientName').value;
        const senderEmail = document.getElementById('senderEmail').value;
        const customMessage = document.getElementById('customMessage').value.replace(/\n/g, '<br>');
        
        if (!recipientName || !senderEmail || !customMessage) {
            showStatus('Please fill in all required fields to preview.', 'error');
            return;
        }

        // Extract sender name from email (part before @)
        const senderName = senderEmail.split('@')[0];
        const capitalizedSenderName = senderName.charAt(0).toUpperCase() + senderName.slice(1);

        // Replace placeholders with actual values
        let personalizedBody = EMAIL_TEMPLATE.replace(/\[\[Recepient Name\]\]/g, recipientName)
            .replace(/\[\[SenderName\]\]/g, capitalizedSenderName)
            .replace(/\[\[Body\]\]/g, customMessage);
        
        // Show preview using div for proper HTML rendering
        document.getElementById("previewContent").innerHTML = personalizedBody;
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
        const customMessage = document.getElementById('customMessage').value.replace(/\n/g, '<br>');
        
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
        const capitalizedSenderName = senderName.charAt(0).toUpperCase() + senderName.slice(1);
        emailData.emailBody = EMAIL_TEMPLATE.replace(/\[\[Recepient Name\]\]/g, emailData.recipientName)
            .replace(/\[\[SenderName\]\]/g, capitalizedSenderName)
            .replace(/\[\[Body\]\]/g, customMessage);

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
