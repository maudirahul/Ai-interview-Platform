const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, preferredRole, preferredLevel } = req.body;

    const updated = await req.user.updateOne(
      {
        ...(name && { name }),
        ...(preferredRole && { preferredRole }),
        ...(preferredLevel && { preferredLevel }),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      user: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe };