import { z } from "zod"

const multerFileSchema = z.custom<Express.Multer.File>(
  (file) => {
    return (
      file &&
      typeof file === "object" &&
      "fieldname" in file &&
      "originalname" in file &&
      "mimetype" in file &&
      "size" in file &&
      typeof file.fieldname === "string" &&
      typeof file.originalname === "string" &&
      typeof file.mimetype === "string" &&
      typeof file.size === "number"
    )
  },
  {
    message: "File must be a valid multer file",
  }
)

const optionalMulterFileSchema = z.custom<Express.Multer.File | undefined>(
  (file) => {
    // Allow for undefined/null
    if (file === null || file === undefined) {
      return true
    }
    
    return (
      file &&
      typeof file === "object" &&
      "fieldname" in file &&
      "originalname" in file &&
      "mimetype" in file &&
      "size" in file &&
      typeof file.fieldname === "string" &&
      typeof file.originalname === "string" &&
      typeof file.mimetype === "string" &&
      typeof file.size === "number"
    )
  },
  {
    message: "File must be a valid multer file",
  }
)

export { multerFileSchema, optionalMulterFileSchema }
