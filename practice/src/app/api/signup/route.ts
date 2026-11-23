
import { connectToDatabase } from "@/app/lib/mongodb";
import { userSchema } from "../../../schema/user";
import User from "@/models/User";

export async function POST(request: Request) {
    const result = await request.json();

    const res = userSchema.safeParse(result);

    if (!res.success) {
        return Response.json({
            message: "Validation Failed",
            errors: res.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }))
        }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email: res.data.email });

    console.log(user);

    if (user) {
        return Response.json({
            success: false,
            data: null,
            message: "User already exist with this email"
        }, { status: 409 });
    }

    const newUser = await User.create({
        name: res.data.name,
        email: res.data.email,
        password: res.data.password
    });

    return Response.json({
        success: true,
        data: {
            name: newUser.name,
            email: newUser.email
        },
        message: "Registration successful"
    }, { status: 201 });
}
