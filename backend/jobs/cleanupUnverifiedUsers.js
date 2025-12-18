// jobs/cleanupUnverifiedUsers.js
export const cleanupUnverifiedUsers = async () => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    await User.deleteMany({
        isVerified: false,
        createdAt: { $lt: cutoff }
    });
};
