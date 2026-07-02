import { getDashboardStats } from "./admin.service"

export const getCachedStats = async () => {
    const cached = await redis.get("dashboardStats")
    if (cached) {
        return JSON.parse(cached)
    }
    const stats = await getDashboardStats();
    await redis.set("dashboardStats", JSON.stringify(stats))

    return stats
}