// === server.js ===
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(morgan('dev'));
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "img-src": ["'self'", "data:", "https://s3-us-west-2.amazonaws.com"]
        }
    }
}));
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const upload = multer({ dest: 'uploads/' });

app.post('/api/chat', upload.single('file'), async (req, res) => {
    const { message } = req.body;
    const file = req.file;

    try {
        let userMessage;

        if (file) {
            const fileData = fs.readFileSync(file.path);
            const base64Image = fileData.toString('base64');
            const mimeType = file.mimetype;

            userMessage = [
                { role: 'user', content: message },
                {
                    role: 'user',
                    content: {
                        type: 'image_url',
                        image_url: {
                            url: `data:${mimeType};base64,${base64Image}`,
                        }
                    }
                }
            ];
        } else {
            userMessage = [{ role: 'user', content: message }];
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: userMessage,
            temperature: 0.7,
        });

        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error connecting to OpenAI');
    }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
