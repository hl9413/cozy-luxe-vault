export default async function handler(req, res) {
  res.status(200).json({
    ok: true,
    uploadUrl: "http://localhost:3000/api/put-test",
    fileName: "test-image.jpg"
  });
}
