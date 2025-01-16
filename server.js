const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Route for index.html
app.get(['/index.html', '/'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for products.html
app.get(['/products.html', '/products'], (req, res) => {
    res.sendFile(path.join(__dirname, 'products.html'));
});

// Route for contact.html
app.get(['/contact.html', '/contact'], (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

// Route for checkout.html
app.get(['/checkout.html', '/checkout'], (req, res) => {
    res.sendFile(path.join(__dirname, 'checkout.html'));
});

// Handle form submission
app.post('/checkout', (req, res) => {
    const orderData = req.body;
    const timestamp = Date.now();
    const userName = orderData.firstName.replace(/\s+/g, '_'); // Replace spaces with underscores
    const filePath = path.join(__dirname, 'data', 'userInvoice', `${userName}_${timestamp}.json`);

    fs.writeFile(filePath, JSON.stringify(orderData, null, 2), (err) => {
        if (err) {
            console.error('Error saving order data:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.status(200).json({ message: 'Order placed successfully!' });
    });
});

// Handle 404 (Page Not Found)
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});