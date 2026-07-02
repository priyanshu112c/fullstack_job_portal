import bcrypt from "bcryptjs"
import User from "../models/User.js"

export const registerUser = async (
    payload
) => {
    console.log(payload)
    const existingUser = await User.findOne({
        email: payload.email
    })

    if (existingUser) {
        throw new Error("Email already registered")
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12)
    const user = new User({
        ...payload,
        password: hashedPassword
    })

    return user;
}

export const loginUser = async (
    email,
    password
) => {
    const user = await User.findOne({
        email
    }).select("+password")

    if (!user) {
        throw new Error("Invalid credentials")
    }

    // Blocked users cannot login
    if (user.status === "blocked") {
        throw new Error("Account blocked")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error("Invalid credentials")
    }

    return user;
}
