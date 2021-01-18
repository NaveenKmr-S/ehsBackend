const materialDimensionDb = require("../model/materialDimensionModel");
const base64_encode = require("../helpers/base64");
const fs = require("fs");
const storageImg = require("../helpers/storageImg");

const idErr = "Provide material id!!!",
  titleErr = "Provide title!!!",
  typeErr =
    "Provide type i.e.,(type:0 for material and type:1 for dimension)!!!",
  imgUrlErr = "Provide ImgUrl!!!";

exports.getMaterial = (req, res, next) => {
  materialDimensionDb
    .find({ isActive: true })
    .then((metDim) => {
      if (!metDim)
        res.status(400).json({ error: "Something Wrong try again later!!!" });
      else
        res
          .status(200)
          .json({ materialDimension: metDim, message: "succesfully loaded" });
    })
    .catch((err) => {
      res.status(400).json({ error: `${err}` });
    });
};

/*
material id: 


dimension id :


*/

exports.createMaterial = async (req, res, next) => {
  const { title, type } = req.body;
  

  if (!title) res.status(400).json({ error: titleErr });
  else if (!type) res.status(400).json({ error: typeErr });
  else if (!req.hasOwnProperty("file"))
    res.status(400).json({ error: imgUrlErr });
  else {
    let imgUrl;
    try {
      imgUrl = `${req.protocol}://${req.get("host")}/${
        req.file.destination + req.file.filename
      }`;
    } catch (e) {}

    const newMetDim = await new materialDimensionDb({
      title,
      imgUrl: imgUrl,
      type,
    });


    newMetDim
      .save()
      .then((metDim) => {
        if (!metDim)
          res.status(400).json({ error: "Something Wrong try again later!!!" });
        else
          res.status(200).json({
            message: "succesfully created",
            materialDimension: metDim,
          });
      })
      .catch((err) => {
        res.status(400).json({ error: `${err}` });
      });
  }
};

exports.updateMaterial = async (req, res, next) => {
  const payload = req.body;

  let materialId = payload.materialId;

  if (materialId) {
    let updateObj = {};

    payload.title ? (updateObj.title = payload.title) : null;
    payload.imgUrl ? (updateObj.imgUrl = req.file.path) : null;

    payload.type ? (updateObj.type = payload.type) : null;

    try {
      let result = await materialDimensionDb
        .update({ _id: materialId }, updateObj, { multi: false })
        .exec();
      res.json({ updated: true, update: updateObj });
    } catch (err) {
      res.status(400).json({updated: false, error: `${err}` });
    }
  } else res.status(400).json({ error: idErr });
};

exports.deleteMaterial = async (req, res, next) => {
  const { materialId } = req.body;
  if (!materialId) 
    res.status(400).json({ error: idErr });
  else {
    try {
      let result = await materialDimensionDb
        .updateOne({ _id: materialId }, { isActive: false })
        .exec();
      res.json({ deleted: true, message: "deleted Successfully!!!" });
    } catch (err) {
      res.status(400).json({deleted: false, error: `${err}` });
    }
  }
};
