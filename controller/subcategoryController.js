const subCategoryDb = require("../model/subCategoryModel");

const idErr = "Provide subCategory id!!!",
  titleErr = "Provide title!!!",
  categoryIdErr = "Provide category id!!!",
  sucLoad = "succesfully loaded",
  sucCreated = "sucesfully created",
  delSuc = "deleted Successfully!!!";

exports.getSubCategory = (req, res, next) => {
  subCategoryDb
    .find({ isActive: true })
    .then((subCategory) => {
      res.status(200).json({ subCategory: subCategory, message: "successfully Loaded" });
    })
    .catch((err) => {
      res.status(400).json({ error: `${err}` });
    });
};

exports.createSubCategory = async (req, res, next) => {
  let { title, categoryId } = req.body;
  let imgUrl;
  try {
    imgUrl = `${req.protocol}://${req.get("host")}/${
      req.file.destination + req.file.filename
    }`;
  } catch (e) {}
  if (!title) res.status(400).json({ error: titleErr });
  else if (!categoryId) res.status(400).json({ error: categoryIdErr });
  else {
    const newSubCategory = await new subCategoryDb({ title,imgUrl, categoryId });
    newSubCategory
      .save()
      .then((subCategory) => {
        res.status(200).json({
          message: sucCreated,
          subCategory: subCategory,
        });
      })
      .catch((err) => {
        res.status(400).json({ error: `${err}` });
      });
  }
};

exports.updateSubCategory = async (req, res, next) => {
  const payload = req.body;
  const subCategoryId = payload.subCategoryId;

  if (!subCategoryId) res.status(400).json({ error: idErr });
  else {
    let updateObj = {};

    payload.title ? (updateObj.title = payload.title) : null;
    try {
      req.file.path
        ? (updateObj.imgUrl = `${req.protocol}://${req.get("host")}/${
            req.file.destination + req.file.filename
          }`)
        : null;
    } catch (e) {}

    try {
      let result = await subCategoryDb
        .updateOne({ _id: subCategoryId }, updateObj)
        .exec();
      res.json({ updated: true, update: updateObj });
    } catch (err) {
      res.status(400).json({ updated: false, error: `${err}` });
    }
  }
};

exports.deleteSubCategory = async (req, res, next) => {
  const { subCategoryId } = req.body;

  if (!subCategoryId) res.status(400).json({ error: idErr });
  else {
    try {
      let result = await subCategoryDb
        .updateOne({ _id: subCategoryId }, { isActive: false })
        .exec();
      res.json({ deleted: true, message: delSuc });
    } catch (err) {
      res.status(400).json({ deleted: false, error: `${err}` });
    }
  }
};
