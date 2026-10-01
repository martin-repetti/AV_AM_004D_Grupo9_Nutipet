import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(){
    try {
        const result = await pool.query (
            "SELECT NOW() AS fecha, current_database() AS database"
        );

        return NextResponse.json({
            ok: true,
            message: "Conexión exitosa a la base de datos",
            data: result.rows[0]
        });

    }catch (error) {
        console.error("Error al conectar a la base de datos:", error);

        return NextResponse.json(
            {
                ok: false,
                message: "Error al conectar a la base de datos"
            },
            {status: 500}
        );
    }
}