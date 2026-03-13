import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createAddresses = async (req: Request, res: Response) => {

    const { user_id, label, receiver_name, district, postal_code } = req.body

    try {

        const address = await prisma.userAddress.create({
            data: {
                user_id: Number(user_id),
                label,
                receiver_name,
                district,
                postal_code
            }
        })

        res.json(address)

    } catch (error) {
        console.error("CREATE USER ERROR:", error)
        res.status(500).json(error)
    }
}

export const getAddress = async (req: Request, res: Response) => {
    try {
        const users = await prisma.userAddress.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
}

export const getAddressId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        const address = await prisma.userAddress.findUnique({
            where: {
                address_id: id
            }
        });
        res.json({
            message: 'address deleted successfully',
            address: address
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete address' });
    }
}

export const putAddress = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    const { user_id, label, receiver_name, district, postal_code } = req.body
    try {
        const addres = await prisma.userAddress.update({
            where: {
                address_id: id
            },
            data: {
                user_id: Number(user_id),
                label,
                receiver_name,
                district,
                postal_code
            }
        })
     } catch (error) {
        res.status(500).json({ error: 'Failed to delete address' });
    }
}

export const deleteAddress = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        const address = await prisma.userAddress.delete({
            where: {
                address_id: id
            }
        });
        res.json({
            message: 'address deleted successfully',
            address: address
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete address' });
    }
}