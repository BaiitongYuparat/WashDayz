import express from 'express';
import userRoutes from './routes/users'
import orderRoutes from './routes/order'
import branchRoutes from './routes/branch'
import addressesRoutes from './routes/addresses'
import mainserviceRoutes from './routes/mainService'
import addonserviceRoutes from './routes/addonService'
import paymentRoutes from './routes/payment'
import orderItemAddonRoutes from './routes/orderItemAddon'
import orderItemRoutes from './routes/orderItem'
import authRoutes from './routes/auth'
import queuRoutes from './routes/queue'
import profileRoutes from './routes/profile'
import serviceRoutes from './routes/service'
import machineRoutes from './routes/machine'
import mcpRouter from "./mcpRouter";
import chatRouter from './chatRouter'
import branchMachine from "./routes/branchMachine"
import mainmachine from './routes/serviceMachine'
import recommedBranchRouter from './routes/recommedBranch'
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.use('/users', userRoutes)
app.use('/orders', orderRoutes)
app.use('/branches', branchRoutes)
app.use('/addresses', addressesRoutes)
app.use('/mainservices', mainserviceRoutes)
app.use('/addonservice' , addonserviceRoutes)
app.use('/payments', paymentRoutes)
app.use('/orderitemaddons', orderItemAddonRoutes)
app.use('/orderitems',orderItemRoutes)
app.use('/auth', authRoutes)
app.use('/queues',queuRoutes)
app.use('/profile', profileRoutes)
app.use('/services', serviceRoutes)
app.use('/machines', machineRoutes)
app.use("/mcp", mcpRouter);
app.use('/chat', chatRouter);
app.use('/branch-machines',branchMachine)
app.use('/main-machine' ,mainmachine)
app.use('/profile',profileRoutes)
app.use('/recommend-branch', recommedBranchRouter)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});