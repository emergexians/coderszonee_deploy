import type { NextApiRequest, NextApiResponse } from "next";
import { dbConnect } from "@/lib/db";
import { Model, Document } from "mongoose";

interface CrudOptions<T extends Document> {
  model: Model<T>;
  modelName: string;
  searchableFields?: string[];
}

export default function crudHandler<T extends Document>({
  model,
  modelName,
  searchableFields = ["name", "level", "skills"],
}: CrudOptions<T>) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
      await dbConnect();
    } catch (err) {
      console.error(`❌ DB connection error (${modelName}):`, err);
      return res.status(500).json({ error: "Database connection failed" });
    }

    const { id } = req.query;

    try {
      // 📌 GET ALL (with pagination, search, sorting)
      if (req.method === "GET" && !id) {
        const {
          page = "1",
          limit = "10",
          search = "",
          sort = "createdAt",
          order = "desc",
        } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const query: Record<string, unknown> = {};

        if (search) {
          query["$or"] = searchableFields.map((field) => ({
            [field]: { $regex: search, $options: "i" },
          }));
        }

        const results = await model
          .find(query)
          .sort({ [sort as string]: order === "asc" ? 1 : -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum);

        const total = await model.countDocuments(query);

        return res.json({
          data: results,
          pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
          },
        });
      }

      // other CRUD cases...
    } catch (err) {
      console.error(`❌ Error in ${modelName} handler:`, err);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
