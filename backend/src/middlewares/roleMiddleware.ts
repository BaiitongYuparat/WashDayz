//ยูเซอกับแอดมินใครครวเข้าถึงบ้าง



export const roleMiddleware = (requiredRole: string) => {
  return async (req: any, res: any, next: any) => {
    if (!req.user?.user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

