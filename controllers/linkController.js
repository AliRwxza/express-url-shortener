const Link = require("../models/Link");
const ClickEvent = require("../models/ClickEvent");
const responseHandler = require("../helper/responseHandler");
const { StatusCodes } = require("http-status-codes");
const generateId = require("../helper/generateId");

const ID_LENGTH = 6;

function hasChar(string) {
  return /[a-zA-Z]/.test(string);
}

async function insertLink(req, res) {
  const url = req.body.url;
  const expiry = req.body.expiry;
  const userId = req.user.userId;
  const givenAlias = req.body.alias;
  var alias;
  if (!url) {
    return responseHandler(
      res, 
      StatusCodes.BAD_REQUEST, 
      {message: "URL not provided."}
    );
  }
  if (!givenAlias) {
    let repeat = 0;
    let genId;
    while (repeat++ < 10) {
      genId = generateId(ID_LENGTH);
      const isDup = await Link.findOne({
        where: {alias: genId}
      });
      if (!isDup && /[a-zA-Z]/.test(genId)) {
        alias = genId;
        break;
      }
    } 
  } else {
    alias = givenAlias;
  }
  const isDup = await Link.findOne({
    where: {alias}
  });
  if (!givenAlias && (!hasChar(alias) || isDup)) {
    return responseHandler(
      res,
      StatusCodes.SERVICE_UNAVAILABLE,
      {
        message: "Unable to generate an alias. Please try again later."
      }
    );
  }
  if (isDup) {
    return responseHandler(
      res,
      StatusCodes.CONFLICT,
      {
        message: "This alias is taken"
      }
    );
  }
  if (!hasChar(alias)) {
    return responseHandler(
      res,
      StatusCodes.BAD_REQUEST,
      {
        message: "Aliases must contain atleast one letter"
      }
    );
  }
  try {
    if (!expiry) {
      await Link.create({
        alias, 
        url, 
        userId
      });
    } else {
      const expiresAt = new Date(Date.now() + expiry*1000);
      await Link.create({
        alias,
        url,
        userId,
        expiresAt
      });
    }
    const data = await Link.findOne({
      where: {alias}
    });
    const {id, ...returnLink} = data.toJSON();
    return responseHandler(
      res,
      StatusCodes.CREATED,
      {
        link: returnLink,
        message: "Short link created"
      }
    );
  } catch (err) {
    console.error(err);
    return responseHandler(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        error: "Internal server error"
      }
    );
  }
}

async function deleteLinkById(id, userId) {
  const link = await Link.findOne({
    attributes: [
      "userId"
    ],
    where: {id}
  });
  if (!link) {
    return StatusCodes.NOT_FOUND;
  }
  if (link.userId !== userId) {
    return StatusCodes.FORBIDDEN;
  }
  const deleted = await Link.destroy({
    where: {id}
  });
  if (deleted > 0) {
    return StatusCodes.NO_CONTENT;
  } else {
    return StatusCodes.NOT_FOUND;
  }
}

async function deleteLinkByAlias(res, alias, userId) {
  const link = await Link.findOne({
    attributes: [
      "userId"
    ],
    where: {alias}
  });
  console.log(link);
  if (!link) {
    return responseHandler(
      res,
      StatusCodes.NOT_FOUND,
      {
        message: "No short link found with this alias/id"
      }
    );
  }
  if (link.userId !== userId) {
    return responseHandler(
      res,
      StatusCodes.FORBIDDEN,
      {
        message: "This user does not have access to delete the desired short link"
      }
    );
  }
  const deleted = await Link.destroy({
    where: {alias}
  });
  if (deleted > 0) {
    return responseHandler(
      res,
      StatusCodes.NO_CONTENT,
      {}
    );
  } else {
    return responseHandler(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Internal server error"
      }
    );
  }
}

async function deleteLink(req, res) {
  const userId = req.user.userId;
  const value = req.params.value;
  if (Number.isInteger(Number(value))) {
    const status = await deleteLinkById(Number.parseInt(value), userId);
    if (status === StatusCodes.NO_CONTENT) {
      return responseHandler(
        res, 
        status,
        {}
      );
    }
  }
  return deleteLinkByAlias(res, value, userId);
}

async function retrieveLinks(req, res) {
  const userId = req.user.userId;
  try {
    const rows = await Link.findAll({
      where: {userId}
    });
    return responseHandler(
      res,
      StatusCodes.OK,
      {
        rows,
        message: "Links retrieved successfully"
      }
    )
  } catch (err) {
    console.error(err);
    return responseHandler(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      {
        message: "Internal server error"
      }
    );
  }
}

async function getLink(req, res) {
  const userId = req.user.userId;
  const value = req.params.value;
  if (Number.isInteger(Number(value))) {
    const link = await Link.findOne({
      where: {id: value}
    })
    if (!link) {
      return responseHandler(
        res,
        StatusCodes.NOT_FOUND,
        {
          message: "No link found with this id"
        }
      );
    }
    if (link.userId !== userId) {
      return responseHandler(
        res,
        StatusCodes.UNAUTHORIZED,
        {
          message: "You do not have access to this link's information"
        }
      )
    }
    const clickEvent = await ClickEvent.findOne({
      where: {linkId: link.id}
    });
    if (!clickEvent) {
      return responseHandler(
        res,
        StatusCodes.OK,
        {
          link,
          message: "Found link successfully. No click events have been recorded yet."
        }
      );
    }
    return responseHandler(
      res,
      StatusCodes.OK,
      {
        link,
        clickEvent,
        message: "Retrieved successfully."
      }
    );
  } else {
    
  }
}

module.exports = {
  insertLink,
  deleteLink,
  retrieveLinks,
  getLink
}