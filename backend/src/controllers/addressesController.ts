import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"

export const createAddresses = async (req: Request, res: Response) => {
    const { user_id, label, receiver_name, district, postal_code, subDistrict, province, phone } = req.body
    try {
        if (!user_id || !receiver_name || !district || !province || !postal_code) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const address = await prisma.userAddress.create({
            data: {
                user_id,
                label,
                receiver_name,
                district,
                subDistrict,
                province,
                postal_code,
                phone
            }
        })
        res.json(address)
    } catch (error) {
        console.error("CREATE ADDRESS ERROR:", error)
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
    const id = req.params.id as string
    try {
        const address = await prisma.userAddress.findUnique({
            where: {
                address_id: id
            }
        })
        if (!address) {
            return res.status(404).json({ error: "Address not found" });
        }
        res.json(address)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch address' })
    }
}

export const putAddress = async (req: Request, res: Response) => {
    const id = req.params.id as string
     const { user_id, label, receiver_name, district, subDistrict, province, postal_code, phone } = req.body;
    try {
        const address = await prisma.userAddress.update({
            where: {
                address_id: id
            },
            data: {
                 user_id,
                label,
                receiver_name,
                district,
                subDistrict,
                province,
                postal_code,
                phone
            }
        })
        res.json(address)
    } catch (error) {
        console.error("CREATE ADDRESS ERROR:", error)
        res.status(500).json(error)
    }
}

export const deleteAddress = async (req: Request, res: Response) => {
    const id = req.params.id as string
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