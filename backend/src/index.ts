import express from 'express';
import userRoutes from './routes/users'
import riderRoutes from './routes/rider'
import orderRoutes from './routes/order'

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.use('/users', userRoutes)
app.use('/riders', riderRoutes)
app.use('/orders', orderRoutes)


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});