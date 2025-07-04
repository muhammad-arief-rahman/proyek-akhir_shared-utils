import axios from "axios"
import type { Request } from "express"

async function storeMedia(files: Express.Multer.File[] | Express.Multer.File) {
  const fileArray = Array.isArray(files) ? files : [files]

  const results = await Promise.allSettled(
    fileArray.map(async (file) => {
      const formData = new FormData()

      const fileBlob = new Blob([file.buffer], {
        type: file.mimetype,
      })

      formData.set("file", fileBlob, file.originalname)

      const response = await axios.post(
        `${process.env.MEDIA_SERVICE_URL}/data`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      const mediaId = response.data?.data?.[0] as string

      return mediaId
    })
  )

  const mappedMedia = results.map((result) =>
    result.status === "fulfilled" ? result.value : null
  )

  return mappedMedia
}

function getMulterFiles(files: Request["files"], pathname: string) {
  if (!files || !Array.isArray(files)) {
    return []
  }

  return files.filter((file) => file.fieldname === pathname)
}

function getMulterFile(files: Request["files"], pathname: string) {
  if (!files || !Array.isArray(files)) {
    return null
  }

  return files.find((file) => file.fieldname === pathname) ?? null
}

async function deleteMedia(mediaId: string) {
  try {
    await axios.delete(`${process.env.MEDIA_SERVICE_URL}/data/${mediaId}`)
    return true
  } catch (error) {
    return false
  }
}

export { storeMedia, getMulterFiles, getMulterFile, deleteMedia }
