const posterDb = require("../model/posterModel");
const subCategoryDb = require("../model/subCategoryModel");
const base64_encode = require("../helpers/base64");
const fs = require("fs");

exports.createPoster = async (req, res, next) => {
  let {
    name,
    category,
    subCategory,
    language,
    creator,
    priceGroup,
    description,
    originalPrice,
    discountPercentage,
    stocks,
    material,
    dimension,
    tags,
    sku,
    link,
    weight,
    additionalDetails,
    sale,
    bought,
  } = req.body;

  // const imageAsBase64 = base64_encode(req.file.path);
  let imgUrl;
  try {
    imgUrl = `${req.protocol}://${req.get("host")}/${
      req.file.destination + req.file.filename
    }`;
  } catch (e) {}
  const newPoster = await new posterDb({
    name,
    category,
    subCategory,
    language,
    creator,
    imgUrl:imgUrl,
    priceGroup,
    description,
    originalPrice,
    discountPercentage,
    stocks,
    material,
    dimension,
    tags,
    sku,
    link,
    weight,
    additionalDetails,
    sale,
    bought,
  });

  newPoster
    .save()
    .then((poster) => {
      // try {
      //   fs.unlinkSync(req.file.path);
      // } catch (err) {
      //   console.error(err);
      // }
      res.status(200).json({
        message: "sucesfully created",
        poster: poster,
      });
    })
    .catch((err) => {
      res.status(400).json({ error: `${err}` });
    });
};

exports.getPosterById = (req, res, next) => {
  try {
    let posterId = req.params.posterId;
    try {
      posterDb
        .findOne({ _id: posterId, isActive: true })
        .populate("category", "title")
        .populate("subCategory", "title")
        .populate("material", "title imgUrl")
        .populate("dimension", "title imgUrl")
        .then((poster) => {
          if (!poster) res.status(404).json({ message: "poster not found!!!" });
          res
            .status(200)
            .json({ message: "succesfully loaded", posterData: poster });
        })
        .catch((err) => {
          res.status(400).json({ error: `${err}` });
        });
    } catch (err) {
      res.status(400).json({ error: `${err}` });
    }
  } catch (err) {
    res.status(400).json({ error: `${err}` });
  }
};

exports.getPosterBySubCategory = (req, res, next) => {
  try {
    let subCategory = req.params.subCategory;
    subCategoryDb.findById({_id: subCategory}).then((subCat)=>{
      subCategory=subCat.title;
    });
   
    try {
    
      posterDb
        .find({ isActive: true })
        .populate("category", "title")
        .populate("subCategory", "title")
        .populate("material", "title imgUrl")
        .populate("dimension", "title imgUrl")
        .then((poster) => {
          if (!poster) res.status(404).json({ message: "poster not found!!!" });
          else {
            try {

              let poster2 = poster.filter((v) =>(v.subCategory.title.toLowerCase() == subCategory.toLowerCase()));
              res
                .status(200)
                .json({ message: "succesfully loaded", posterData: poster2 });
                
            } catch (e) {}
          }
        })
        .catch((err) => {
          res.json({ error: `${err}` });
        });
    } catch (err) {
      res.json({ error: `${err}` });
    }
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

exports.getPoster = (req, res, next) => {
  posterDb
    .find({ isActive: true })
    .populate("category", "title")
    .populate("subCategory", "title")
    .populate("material", "title imgUrl")
    .populate("dimension", "title imgUrl")
    .lean()
    .then((poster) => {
      res
        .status(200)
        .json({ posterData: poster, message: "succesfully loaded" });
    })
    .catch((err) => {
      res.status(400).json({ error: `${err}` });
    });
};

exports.updatePoster = async (req, res, next) => {
  let payload = req.body;
  let posterId = payload.posterId;

  let updateObj = {};

  payload.name ? (updateObj.name = payload.name) : null;
  payload.category ? (updateObj.category = payload.category) : null;
  payload.subCategory ? (updateObj.subCategory = payload.subCategory) : null;
  payload.language ? (updateObj.language = payload.language) : null;
  payload.creator ? (updateObj.creator = payload.creator) : null;
  try {
    req.file.path
      ? (updateObj.imgUrl = `${req.protocol}://${req.get("host")}/${
          req.file.destination + req.file.filename
        }`)
      : null;
  } catch (e) {}
  payload.priceGroup ? (updateObj.priceGroup = payload.priceGroup) : null;
  payload.description ? (updateObj.description = payload.description) : null;
  payload.originalPrice ? (updateObj.originalPrice = payload.originalPrice) : null;
  payload.discountPercentage ? (updateObj.discountPercentage = payload.discountPercentage): null;
  payload.stocks ? (updateObj.stocks = payload.stocks) : null;
  payload.material ? (updateObj.material = payload.material) : null;
  payload.dimension ? (updateObj.dimension = payload.dimension) : null;
  payload.tags ? (updateObj.tags = payload.tags) : null;
  payload.sku ? (updateObj.sku = payload.sku) : null;
  payload.link ? (updateObj.link = payload.link) : null;
  payload.weight ? (updateObj.weight = payload.weight) : null;
  payload.additionalDetails ? (updateObj.additionalDetails = payload.additionalDetails) : null;
  payload.sale ? (updateObj.sale = payload.sale) : null;

  try {
    //console.log(updateObj);
    let result = await posterDb
      .updateOne({ _id: posterId }, updateObj, { multi: false })
      .exec();
    res.json({ updated: true, update: updateObj });
  } catch (err) {
    res.status(400).json({ error: `${err}` });
  }
};

exports.deletePoster = async (req, res, next) => {
  let { posterId } = req.body;
  try {
    let result = await posterDb
      .update({ _id: posterId }, { isActive: false }, { multi: false })
      .exec();
    res.json({ deleted: true, message: "deleted Successfully!!!" });
  } catch (err) {
    res.status(400).json({ error: `${err}` });
  }
};
