import express from 'express';
import {prisma} from '../lib/prisma';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from Prisma API!');
});


app.post('/users', async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password,
                phone
            },
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.post('/users/')



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});