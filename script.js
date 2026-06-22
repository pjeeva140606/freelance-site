// This runs when someone submits the contact form
document.getElementById('contact-form').addEventListener('submit', async function(e) {
  e.preventDefault(); // stop page from reloading

  const status = document.getElementById('form-status');
  status.textContent = 'Sending...';
  status.style.color = '#666';

  const data = {
    name: this.name.value,
    email: this.email.value,
    message: this.message.value,
  };

  try {
    const res = await fetch('/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      status.textContent = 'Message sent! I\'ll get back to you soon.';
      status.style.color = '#28a745';
      this.reset();
    } else {
      status.textContent = result.error || 'Something went wrong.';
      status.style.color = '#dc3545';
    }
  } catch {
    status.textContent = 'Could not connect to the server.';
    status.style.color = '#dc3545';
  }
});
