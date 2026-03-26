import { Request, Response } from "express"
import { prisma } from "../../lib/prisma"
import { AuthRequest } from "../types/authRequest"

export const createAddresses = async (req: AuthRequest, res: Response) => {
    const {label, houseNo , receiver_name, district, postal_code, subDistrict, province, phone } = req.body
    try {
        const userId = req.user?.user_id
        if (!userId ||!receiver_name || !district || !province || !postal_code) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const address = await prisma.userAddress.create({
            data: {
                user_id: userId,
                label,
                houseNo,
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

export const getAddress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.user_id
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const users = await prisma.userAddress.findMany({
            where: {user_id: userId}
        });
        console.log("USER ID:", userId);
        console.log("ADDRESS RESULT:", users);
        res.json(users);
    } catch (error) {
        console.log("❌ REAL ERROR:", error)
        res.status(500).json({ error: "Failed to fetch users" });
    }
}

export const getAddressId = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const address = await prisma.userAddress.findUnique({
            where: {
                address_id: id
            }
        })
        if (!address) {
            return res.status(404).json({ error: "Address not found" });
        }
        if (address.user_id !== userId) {
            return res.status(403).json({ error: "Forbidden" });
        }
        console.log("USER ID:", userId);
        res.json(address)
    } catch (error: any) {
  console.log("ERROR DATA:", error.response?.data);
}
}

export const putAddress = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string
     const {label,houseNo, receiver_name, district, subDistrict, province, postal_code, phone } = req.body;
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const existing = await prisma.userAddress.findUnique({
            where: { address_id: id },
        });

        if (!existing || existing.user_id !== userId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const address = await prisma.userAddress.update({
            where: {
                address_id: id
            },
            data: {
                label,
                houseNo,
                receiver_name,
                district,
                subDistrict,
                province,
                postal_code,
                phone
            }
        })
        res.json(address)
        console.log("Address Update", address)
    } catch (error) {
        console.error("CREATE ADDRESS ERROR:", error)
        res.status(500).json(error)
    }
}

export const deleteAddress = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string
    try {
        const userId = req.user?.user_id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        
        const address = await prisma.userAddress.deleteMany({
            where: {
                address_id: id,
                user_id: userId,
            },
            });

        if (address.count === 0) {
        return res.status(403).json({ error: "Forbidden" });
        }
            
        res.json({
            message: 'address deleted successfully',
            address: address
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete address' });
    }
}