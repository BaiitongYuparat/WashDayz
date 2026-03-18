import express from 'express';
import userRoutes from './routes/users'
import riderRoutes from './routes/rider'
import orderRoutes from './routes/order'
import branchRoutes from './routes/branch'
import addressesRoutes from './routes/addresses'
import mainserviceRoutes from './routes/mainService'
import addonserviceRoutes from './routes/addonService'
import paymentRoutes from './routes/payment'
import orderItemAddonRoutes from './routes/orderItemAddon'
import orderItemRoutes from './routes/orderItem'
import authRoutes from './routes/auth'
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.use('/users', userRoutes)
app.use('/riders', riderRoutes)
app.use('/orders', orderRoutes)
app.use('/branchs', branchRoutes)
app.use('/addresses', addressesRoutes)
app.use('/mainservices', mainserviceRoutes)
app.use('/addonservice' , addonserviceRoutes)
app.use('/payments', paymentRoutes)
app.use('/orderitemaddons', orderItemAddonRoutes)
app.use('/orderitems',orderItemRoutes)
app.use('/auth', authRoutes)


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});