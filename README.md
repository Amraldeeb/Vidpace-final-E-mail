# Vidpace Email Sender - Frontend

This is the frontend component of the Vidpace Email Sender application, designed to be deployed on GitHub Pages.

## Features

- Clean, responsive HTML interface for sending emails
- Email preview functionality
- Form validation and error handling
- Auto-save form data to localStorage
- Professional styling with CSS

## Deployment to GitHub Pages

1. Create a new repository on GitHub
2. Upload these files to the repository:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`

3. Go to repository Settings > Pages
4. Select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click Save

## Configuration

Before deployment, update the `API_BASE_URL` in `script.js` with your Vercel backend URL:

```javascript
const API_BASE_URL = 'https://your-vercel-app.vercel.app';
```

## Files

- `index.html` - Main application page
- `style.css` - Styling and responsive design
- `script.js` - Frontend logic and API communication
- `README.md` - This documentation

## Usage

1. Enter your email credentials (sender)
2. Fill in recipient information
3. Write your email subject and body (supports HTML)
4. Use {{name}} placeholder for personalization
5. Preview the email before sending
6. Click "Send Email" to deliver

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- No external dependencies required

