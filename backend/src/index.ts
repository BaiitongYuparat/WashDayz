import express from 'express';
import userRoutes from './routes/users'
import riderRoutes from './routes/rider'
import orderRoutes from './routes/order'
import branchRoutes from './routes/branch'
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.use('/users', userRoutes)
app.use('/riders', riderRoutes)
app.use('/orders', orderRoutes)
app.use('/branchs', branchRoutes)


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});