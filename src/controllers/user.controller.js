// minimal /me
export async function getMe(req, res) {
  return res.json({ success: true, data: req.user });
}
